"""Health check endpoint verifying API and MongoDB connectivity."""

from flask import Blueprint, jsonify
from app.db.client import get_client

health_bp = Blueprint("health", __name__, url_prefix="/api")


@health_bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint verifying service status and lightweight database ping."""
    db_status = "unknown"
    try:
        client = get_client()
        # Fast admin command ping
        client.admin.command("ping")
        db_status = "connected"
    except Exception as exc:
        db_status = f"unreachable: {str(exc)}"

    return jsonify({
        "status": "ok",
        "service": "jas-hotel-api",
        "database": db_status,
    }), 200
