from __future__ import annotations

import time
from collections import defaultdict, deque
from dataclasses import dataclass

from fastapi import Request


class RateLimitExceeded(Exception):
    def __init__(self, retry_after: int):
        self.retry_after = retry_after
        super().__init__(f"Rate limit exceeded. Retry after {retry_after} seconds.")


@dataclass
class InMemoryRateLimiter:
    max_requests: int = 10
    window_seconds: int = 60

    def __post_init__(self) -> None:
        self._requests: dict[str, deque[float]] = defaultdict(deque)

    def check(self, key: str) -> None:
        now = time.monotonic()
        bucket = self._requests[key]

        while bucket and now - bucket[0] >= self.window_seconds:
            bucket.popleft()

        if len(bucket) >= self.max_requests:
            retry_after = max(1, int(self.window_seconds - (now - bucket[0])))
            raise RateLimitExceeded(retry_after)

        bucket.append(now)

    def reset(self) -> None:
        self._requests.clear()


limiter = InMemoryRateLimiter(max_requests=10, window_seconds=60)


async def check_api_rate_limit(request: Request) -> None:
    client_host = request.client.host if request.client else "unknown"
    limiter.check(f"{client_host}:{request.url.path}")
