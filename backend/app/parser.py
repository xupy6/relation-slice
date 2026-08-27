from __future__ import annotations

import csv
import json
import os
import re
import shlex
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field


class ChatParseError(ValueError):
    """Raised when an uploaded chat file cannot be converted into messages."""


class ChatMessage(BaseModel):
    sender: str
    content: str
    timestamp: datetime
    msg_type: str = Field(default="text")


SENDER_KEYS = ("sender", "Sender", "talker", "from", "user", "nickname", "display_name", "\u53d1\u9001\u8005")
CONTENT_KEYS = ("content", "Content", "text", "message", "msg", "StrContent", "\u5185\u5bb9", "\u6d88\u606f\u5185\u5bb9")
TIME_KEYS = ("timestamp", "Timestamp", "time", "datetime", "create_time", "CreateTime", "\u65f6\u95f4", "\u6d88\u606f\u65f6\u95f4")
TYPE_KEYS = ("msg_type", "type", "Type", "MsgType", "\u6d88\u606f\u7c7b\u578b", "\u7c7b\u578b")
EXPORTED_FILE_TYPES = ".json, .csv, .txt, or screenshot images"
IMAGE_FILE_TYPES = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}


def parse_upload(file_path: str) -> list[ChatMessage]:
    path = Path(file_path)
    if not path.exists():
        raise ChatParseError(f"Uploaded file does not exist: {file_path}")

    suffix = path.suffix.lower()
    if suffix == ".json":
        return _parse_json(path)
    if suffix == ".csv":
        return _parse_csv(path)
    if suffix == ".txt":
        return _parse_text(path)
    if suffix in IMAGE_FILE_TYPES:
        return _parse_image_ocr(path)
    if suffix in {".db", ".sqlite", ".sqlite3"}:
        return _parse_wechat_database(path)

    raise ChatParseError(f"Unsupported file type: {suffix or 'unknown'}. Please upload {EXPORTED_FILE_TYPES}.")


def _parse_json(path: Path) -> list[ChatMessage]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8-sig"))
    except json.JSONDecodeError as exc:
        raise ChatParseError(f"Invalid JSON file: {exc}") from exc

    if isinstance(payload, dict):
        for key in ("chat_messages", "messages", "data", "records"):
            if isinstance(payload.get(key), list):
                payload = payload[key]
                break

    if not isinstance(payload, list):
        raise ChatParseError("JSON must be a message list or contain chat_messages/messages/data.")

    return _normalize_records(payload)


def _parse_csv(path: Path) -> list[ChatMessage]:
    try:
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            rows = list(csv.DictReader(handle))
    except csv.Error as exc:
        raise ChatParseError(f"Invalid CSV file: {exc}") from exc

    if not rows:
        raise ChatParseError("CSV file does not contain any message rows.")

    return _normalize_records(rows)


def _parse_text(path: Path) -> list[ChatMessage]:
    try:
        lines = path.read_text(encoding="utf-8-sig").splitlines()
    except UnicodeDecodeError as exc:
        raise ChatParseError("TXT exports must be UTF-8 encoded.") from exc

    return _parse_text_lines(lines)


def _parse_image_ocr(path: Path) -> list[ChatMessage]:
    try:
        import pytesseract
        from PIL import Image
    except ImportError as exc:
        raise ChatParseError(
            "Screenshot OCR requires optional dependencies pillow and pytesseract. "
            "Install them and ensure the Tesseract OCR binary is available, or upload JSON/CSV/TXT exports."
        ) from exc

    try:
        text = pytesseract.image_to_string(Image.open(path), lang=os.getenv("OCR_LANG", "chi_sim+eng"))
    except Exception as exc:
        raise ChatParseError(f"Screenshot OCR failed: {exc}") from exc

    if not text.strip():
        raise ChatParseError("Screenshot OCR did not find readable text.")

    try:
        return _parse_text_lines(text.splitlines())
    except ChatParseError as exc:
        raise ChatParseError(
            "Screenshot OCR text was extracted, but it did not match a supported chat format. "
            "Use screenshots that show timestamps and sender names, or upload exported JSON/CSV/TXT."
        ) from exc


def _parse_text_lines(lines: list[str]) -> list[ChatMessage]:

    records: list[dict[str, str]] = []
    current: dict[str, str] | None = None

    patterns = (
        re.compile(r"^\[(?P<time>[^\]]+)\]\s*(?P<sender>[^:：]+)[:：]\s*(?P<content>.*)$"),
        re.compile(r"^(?P<time>\d{4}[-/]\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{2}(?::\d{2})?)\s+(?P<sender>[^:：]+)[:：]\s*(?P<content>.*)$"),
    )

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        match = next((pattern.match(stripped) for pattern in patterns if pattern.match(stripped)), None)
        if match:
            current = {
                "timestamp": match.group("time"),
                "sender": match.group("sender").strip(),
                "content": match.group("content").strip(),
                "msg_type": "text",
            }
            records.append(current)
        elif current:
            current["content"] = f"{current['content']}\n{stripped}".strip()

    if not records:
        raise ChatParseError(
            "TXT export was not recognized. Expected lines like "
            "'2026-08-25 12:00:00 Alice: hello' or '[2026-08-25 12:00:00] Alice: hello'."
        )

    return _normalize_records(records)


def _parse_wechat_database(path: Path) -> list[ChatMessage]:
    """Export a WeChat database through a configured WeChatMsg CLI, then parse it.

    Set WECHATMSG_EXPORT_COMMAND to a command template containing {input} and {output}.
    The command must write a JSON or CSV export to {output}. Example:
    WECHATMSG_EXPORT_COMMAND='WeChatMsg export --input {input} --output {output}'
    """

    command_template = os.getenv("WECHATMSG_EXPORT_COMMAND")
    if not command_template:
        raise ChatParseError(
            "WeChat database parsing requires WeChatMsg CLI configuration. "
            "Set WECHATMSG_EXPORT_COMMAND with {input} and {output} placeholders, "
            f"or upload an already exported {EXPORTED_FILE_TYPES} file."
        )

    output_suffix = os.getenv("WECHATMSG_EXPORT_FORMAT", "json").lower().lstrip(".")
    if output_suffix not in {"json", "csv"}:
        raise ChatParseError("WECHATMSG_EXPORT_FORMAT must be json or csv.")

    with tempfile.TemporaryDirectory(prefix="relation-slice-wechatmsg-") as temp_dir:
        output_path = Path(temp_dir) / f"wechatmsg_export.{output_suffix}"
        command = command_template.format(input=str(path), output=str(output_path))

        try:
            result = subprocess.run(
                shlex.split(command, posix=os.name != "nt"),
                capture_output=True,
                check=False,
                encoding="utf-8",
                errors="replace",
                timeout=int(os.getenv("WECHATMSG_EXPORT_TIMEOUT", "120")),
            )
        except FileNotFoundError as exc:
            raise ChatParseError(
                f"WeChatMsg CLI executable was not found. You can upload an already exported {EXPORTED_FILE_TYPES} file instead."
            ) from exc
        except subprocess.TimeoutExpired as exc:
            raise ChatParseError("WeChatMsg CLI export timed out.") from exc

        if result.returncode != 0:
            detail = (result.stderr or result.stdout or "").strip()
            raise ChatParseError(
                f"WeChatMsg CLI export failed: {detail or 'unknown error'}. "
                f"You can upload an already exported {EXPORTED_FILE_TYPES} file instead."
            )
        if not output_path.exists():
            raise ChatParseError("WeChatMsg CLI did not produce the expected export file.")

        return parse_upload(str(output_path))


def _normalize_records(records: list[Any]) -> list[ChatMessage]:
    messages: list[ChatMessage] = []
    errors: list[str] = []

    for index, record in enumerate(records, start=1):
        if not isinstance(record, dict):
            errors.append(f"row {index}: expected object")
            continue

        try:
            messages.append(
                ChatMessage(
                    sender=_coerce_sender(record),
                    content=str(_first_present(record, CONTENT_KEYS)).strip(),
                    timestamp=_parse_timestamp(_first_present(record, TIME_KEYS)),
                    msg_type=str(_first_present(record, TYPE_KEYS, default="text") or "text"),
                )
            )
        except (ChatParseError, ValueError, TypeError) as exc:
            errors.append(f"row {index}: {exc}")

    if not messages:
        joined_errors = "; ".join(errors[:5])
        raise ChatParseError(f"No valid chat messages found. {joined_errors}".strip())

    return messages


def _coerce_sender(record: dict[str, Any]) -> str:
    sender = _first_present(record, SENDER_KEYS, default=None)
    if sender is not None and str(sender).strip():
        return str(sender).strip()

    is_sender = record.get("is_sender", record.get("IsSender"))
    if is_sender is not None:
        return "person_a" if str(is_sender).lower() in {"1", "true", "yes"} else "person_b"

    raise ChatParseError("missing sender")


def _first_present(record: dict[str, Any], keys: tuple[str, ...], default: Any = ...):
    for key in keys:
        value = record.get(key)
        if value is not None and value != "":
            return value

    if default is not ...:
        return default

    raise ChatParseError(f"missing field, expected one of: {', '.join(keys)}")


def _parse_timestamp(value: Any) -> datetime:
    if isinstance(value, datetime):
        return value

    if isinstance(value, (int, float)):
        return _datetime_from_epoch(value)

    text = str(value).strip()
    if not text:
        raise ChatParseError("empty timestamp")
    if text.isdigit():
        return _datetime_from_epoch(float(text))

    normalized = text.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(normalized)
    except ValueError:
        pass

    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y/%m/%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y/%m/%d %H:%M"):
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            continue

    raise ChatParseError(f"invalid timestamp: {text}")


def _datetime_from_epoch(value: float) -> datetime:
    seconds = value / 1000 if value > 10_000_000_000 else value
    return datetime.fromtimestamp(seconds, tz=timezone.utc)
