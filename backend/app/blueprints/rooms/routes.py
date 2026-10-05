"""Room catalog and booking endpoints for guests."""

from flask import Blueprint, jsonify, request
from app.blueprints.rooms.service import RoomsService
from app.errors import AppException
from app.utils.auth import get_current_user, login_required
from app.utils.validation import validate_booking_payload

rooms_bp = Blueprint("rooms", __name__, url_prefix="/api")


@rooms_bp.route("/rooms", methods=["GET"])
def list_rooms():
    """List suites with optional category, search, and guest filters."""
    category = request.args.get("category")
    search = request.args.get("search")

    adults_arg = request.args.get("adults")
    adults = int(adults_arg) if adults_arg and adults_arg.isdigit() else None

    featured_arg = request.args.get("featured")
    featured = None
    if featured_arg is not None:
        featured = featured_arg.lower() in ("true", "1", "yes")

    rooms = RoomsService.get_rooms(
        category=category,
        search=search,
        adults=adults,
        featured=featured,
    )

    return jsonify({
        "rooms": rooms,
        "count": len(rooms),
    }), 200


@rooms_bp.route("/rooms/<string:room_id>", methods=["GET"])
def get_room(room_id: str):
    """Retrieve details for a single room."""
    room = RoomsService.get_room_by_id(room_id)
    return jsonify({
        "room": room,
    }), 200


@rooms_bp.route("/bookings", methods=["POST"])
@login_required
def create_booking():
    """Create a room reservation (strictly requires logged-in user)."""
    user = get_current_user()
    data = request.get_json(silent=True)

    is_valid, errors = validate_booking_payload(data)
    if not is_valid:
        raise AppException(
            code="VALIDATION_ERROR",
            message="Please provide valid booking details.",
            status_code=422,
            fields=errors,
        )

    booking = RoomsService.create_booking(user_id_str=user["id"], payload=data)

    return jsonify({
        "message": f"Suite reservation confirmed for {user['name']}.",
        "booking": booking,
    }), 201


@rooms_bp.route("/bookings", methods=["GET"])
@login_required
def list_bookings():
    """List room reservations for the current authenticated user only."""
    user = get_current_user()
    bookings = RoomsService.get_user_bookings(user_id_str=user["id"])

    return jsonify({
        "bookings": bookings,
        "count": len(bookings),
    }), 200


@rooms_bp.route("/bookings/<string:booking_id>/cancel", methods=["PATCH"])
@login_required
def cancel_booking(booking_id: str):
    """Cancel a confirmed room booking."""
    user = get_current_user()
    cancelled = RoomsService.cancel_booking(booking_id_str=booking_id, user_id_str=user["id"])

    return jsonify({
        "message": "Room reservation cancelled successfully.",
        "booking": cancelled,
    }), 200
