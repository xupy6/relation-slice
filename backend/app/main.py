import logging
import time
from pathlib import Path
from uuid import uuid4

from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.graph import run_analysis
from app.logging_config import setup_logging
from app.parser import ChatMessage
from app.parser import ChatParseError, parse_upload
from app.rate_limit import RateLimitExceeded, check_api_rate_limit
from app.responses import api_error, api_success


setup_logging()
logger = logging.getLogger(__name__)


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


@app.middleware("http")
async def log_requests(request: Request, call_next):
    started_at = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        logger.exception("Request failed: %s %s", request.method, request.url.path)
        raise

    elapsed_ms = (time.perf_counter() - started_at) * 1000
    logger.info("%s %s -> %s %.2fms", request.method, request.url.path, response.status_code, elapsed_ms)
    return response


@app.get("/health")
async def health_check() -> dict[str, object]:
    return api_success({"status": "ok"})


@app.post("/api/upload", dependencies=[Depends(check_api_rate_limit)])
async def upload_chat_file(file: UploadFile = File(...)) -> dict[str, object]:
    return await _upload_chat_file(file)


async def _upload_chat_file(file: UploadFile) -> dict[str, object]:
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
        logger.warning("Chat file parsing failed: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    finally:
        await file.close()

    return api_success({"chat_messages": [message.model_dump(mode="json") for message in messages]})


@app.post("/api/analyze", dependencies=[Depends(check_api_rate_limit)])
async def analyze_chat(request: AnalyzeRequest) -> dict[str, object]:
    if not request.chat_messages:
        raise HTTPException(status_code=400, detail="chat_messages cannot be empty")

    try:
        report = run_analysis(request.chat_messages)
    except Exception as exc:
        logger.exception("Analysis failed")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc

    return api_success(report)


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=api_error(exc.status_code, str(exc.detail)),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content=api_error(422, str(exc)),
    )


@app.exception_handler(RateLimitExceeded)
async def rate_limit_exception_handler(_request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content=api_error(429, str(exc)),
        headers={"Retry-After": str(exc.retry_after)},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled API error", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content=api_error(500, "Internal server error"),
    )
