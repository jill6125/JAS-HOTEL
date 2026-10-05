"""Standardized JSON error formatting and global Flask error handlers."""

import logging
from typing import Any
from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException

logger = logging.getLogger(__name__)


def make_error_response(
    code: str,
    message: str,
    status_code: int = 400,
    fields: dict[str, Any] | None = None,
):
    """
    Format a consistent error JSON response matching:
    {
      "error": {
        "code": "INVALID_REQUEST",
        "message": "Human readable message",
        "fields": {}
      }
    }
    """
    payload = {
        "error": {
            "code": code,
            "message": message,
            "fields": fields or {},
        },
        # Top-level message for direct consumer compatibility
        "message": message,
    }
    return jsonify(payload), status_code


class AppException(Exception):
    """Custom application exception with structured error code and status."""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        fields: dict[str, Any] | None = None,
    ):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.fields = fields or {}


def register_error_handlers(app: Flask) -> None:
    """Register application-wide error handlers for uniform JSON responses."""

    @app.errorhandler(AppException)
    def handle_app_exception(exc: AppException):
        return make_error_response(
            code=exc.code,
            message=exc.message,
            status_code=exc.status_code,
            fields=exc.fields,
        )

    @app.errorhandler(400)
    def handle_bad_request(err):
        description = getattr(err, "description", "Bad Request")
        return make_error_response("BAD_REQUEST", str(description), 400)

    @app.errorhandler(401)
    def handle_unauthorized(err):
        return make_error_response("UNAUTHORIZED", "Authentication required to access this resource.", 401)

    @app.errorhandler(403)
    def handle_forbidden(err):
        return make_error_response("FORBIDDEN", "You do not have permission to perform this action.", 403)

    @app.errorhandler(404)
    def handle_not_found(err):
        description = getattr(err, "description", "The requested resource was not found.")
        return make_error_response("NOT_FOUND", str(description), 404)

    @app.errorhandler(405)
    def handle_method_not_allowed(err):
        return make_error_response("METHOD_NOT_ALLOWED", "Method not allowed for this endpoint.", 405)

    @app.errorhandler(409)
    def handle_conflict(err):
        description = getattr(err, "description", "A conflicting resource already exists.")
        return make_error_response("CONFLICT", str(description), 409)

    @app.errorhandler(422)
    def handle_unprocessable_entity(err):
        description = getattr(err, "description", "Validation error occurred.")
        return make_error_response("VALIDATION_ERROR", str(description), 422)

    @app.errorhandler(500)
    def handle_internal_server_error(err):
        logger.exception("Unhandled server error: %s", err)
        return make_error_response(
            "INTERNAL_SERVER_ERROR",
            "An unexpected error occurred. Our hospitality engineering team has been notified.",
            500,
        )

    @app.errorhandler(HTTPException)
    def handle_http_exception(err: HTTPException):
        code = getattr(err, "name", "HTTP_ERROR").upper().replace(" ", "_")
        message = err.description or "An error occurred."
        return make_error_response(code, message, err.code or 500)

    @app.errorhandler(Exception)
    def handle_generic_exception(err: Exception):
        logger.exception("Unexpected error occurred: %s", err)
        return make_error_response(
            "UNEXPECTED_ERROR",
            "An internal error occurred. Please try again later.",
            500,
        )
