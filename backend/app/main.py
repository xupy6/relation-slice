from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.graph import run_analysis
from app.parser import ChatParseError, parse_upload
from app.parser import ChatMessage


class AnalyzeRequest(BaseModel):
    chat_messages: list[ChatMessage]


app = FastAPI(
    title="Relation Slice API",
    description="Backend API for Relation Slice chat analysis.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/upload")
async def upload_chat_file(file: UploadFile = File(...)) -> dict[str, object]:
    upload_dir = Path(__file__).resolve().parents[1] / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)

    original_suffix = Path(file.filename or "").suffix
    saved_path = upload_dir / f"{uuid4().hex}{original_suffix}"

    try:
        with saved_path.open("wb") as handle:
            while chunk := await file.read(1024 * 1024):
                handle.write(chunk)

        messages = parse_upload(str(saved_path))
    except ChatParseError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        await file.close()

    return {"chat_messages": [message.model_dump(mode="json") for message in messages]}


@app.post("/api/analyze")
async def analyze_chat(request: AnalyzeRequest) -> dict[str, object]:
    if not request.chat_messages:
        raise HTTPException(status_code=400, detail="chat_messages cannot be empty")

    try:
        report = run_analysis(request.chat_messages)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc

    return report
