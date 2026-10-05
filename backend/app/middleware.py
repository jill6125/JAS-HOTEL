"""Application middleware for request logging and security response headers."""

import logging
import time
from flask import Flask, g, request

logger = logging.getLogger(__name__)


def register_middleware(app: Flask) -> None:
    """Register custom before/after request middleware."""

    @app.before_request
    def record_start_time():
        g.start_time = time.time()

    @app.after_request
    def set_security_headers(response):
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        # XSS Protection
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Request timing logging in debug mode
        if app.debug and hasattr(g, "start_time"):
            duration = (time.time() - g.start_time) * 1000
            logger.debug(
                "%s %s -> %s (%.2f ms)",
                request.method,
                request.path,
                response.status_code,
                duration,
            )

        return response
