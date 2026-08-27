import csv
import json
import tempfile
import unittest
from pathlib import Path

from app.parser import ChatParseError, _parse_ocr_fallback_lines, parse_upload


class ParseUploadFallbackTest(unittest.TestCase):
    def test_parse_exported_json_without_wechatmsg(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "chat.json"
            path.write_text(
                json.dumps(
                    {
                        "chat_messages": [
                            {
                                "sender": "Alice",
                                "content": "Lunch?",
                                "timestamp": "2026-08-25 12:00:00",
                            }
                        ]
                    }
                ),
                encoding="utf-8",
            )

            messages = parse_upload(str(path))

        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0].sender, "Alice")
        self.assertEqual(messages[0].content, "Lunch?")

    def test_parse_exported_csv_without_wechatmsg(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "chat.csv"
            with path.open("w", encoding="utf-8", newline="") as handle:
                writer = csv.DictWriter(handle, fieldnames=["sender", "content", "timestamp"])
                writer.writeheader()
                writer.writerow({"sender": "Bob", "content": "Sure", "timestamp": "2026-08-25 12:01:00"})

            messages = parse_upload(str(path))

        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0].sender, "Bob")

    def test_parse_exported_txt_without_wechatmsg(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "chat.txt"
            path.write_text(
                "2026-08-25 12:00:00 Alice: Lunch?\n"
                "2026-08-25 12:01:00 Bob: Sure\n",
                encoding="utf-8",
            )

            messages = parse_upload(str(path))

        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[1].content, "Sure")

    def test_database_without_wechatmsg_points_to_export_fallback(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "chat.db"
            path.write_bytes(b"sqlite placeholder")

            with self.assertRaises(ChatParseError) as raised:
                parse_upload(str(path))

        self.assertIn("already exported", str(raised.exception))

    def test_ocr_fallback_without_timestamp_infers_messages(self):
        messages = _parse_ocr_fallback_lines(["微信", "你吃饭了吗", "吃了，刚到家", "Alice: 明天见"])

        self.assertEqual(len(messages), 3)
        self.assertEqual(messages[0].sender, "截图用户A")
        self.assertEqual(messages[1].sender, "截图用户B")
        self.assertEqual(messages[2].sender, "Alice")


if __name__ == "__main__":
    unittest.main()
