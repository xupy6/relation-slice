from __future__ import annotations

from typing import Any


def api_success(data: Any) -> dict[str, Any]:
    return {"code": 0, "data": data}


def api_error(code: int, message: str) -> dict[str, Any]:
    return {"code": code, "message": message}
