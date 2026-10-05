"""Room and Room Reservation service handling suite catalog and guest bookings."""

import re
from datetime import datetime, timezone
from typing import Any
from flask import current_app
from app.constants import (
    BOOKING_STATUS_CANCELLED,
    BOOKING_STATUS_CONFIRMED,
    CANCELLABLE_BOOKING_STATUSES,
    CURRENCY_INR,
    DEFAULT_ROOM_TAX_RATE,
)
from app.db.client import get_db
from app.errors import AppException
from app.utils.serialization import parse_object_id, serialize_doc, serialize_docs


class RoomsService:
    """Business operations for luxury suites and room reservations."""

    @staticmethod
    def get_rooms(
        category: str | None = None,
        search: str | None = None,
        adults: int | None = None,
        featured: bool | None = None,
    ) -> list[dict[str, Any]]:
        """List suites with optional filters."""
        db = get_db()
        filter_query: dict[str, Any] = {"available": True}

        if category and category.lower() != "all":
            filter_query["category"] = {"$regex": f"^{re.escape(category)}$", "$options": "i"}

        if search and search.strip():
            term = search.strip()
            filter_query["$or"] = [
                {"name": {"$regex": re.escape(term), "$options": "i"}},
                {"description": {"$regex": re.escape(term), "$options": "i"}},
                {"view": {"$regex": re.escape(term), "$options": "i"}},
            ]

        if adults is not None and adults > 0:
            filter_query["max_adults"] = {"$gte": adults}

        if featured is not None:
            filter_query["featured"] = featured

        cursor = db.rooms.find(filter_query).sort([("price_per_night", 1)])
        return serialize_docs(list(cursor))

    @staticmethod
    def get_room_by_id(room_id_str: str) -> dict[str, Any]:
        """Fetch single suite by string or ObjectId."""
        room_id = parse_object_id(room_id_str)
        db = get_db()

        # Check by ObjectId or string room_id
        room = None
        if room_id:
            room = db.rooms.find_one({"_id": room_id})
        if not room:
            room = db.rooms.find_one({"room_slug": room_id_str})

        if not room:
            raise AppException("NOT_FOUND", "Room not found.", 404)

        serialized = serialize_doc(room)
        if not serialized:
            raise AppException("INTERNAL_ERROR", "Failed to serialize room.", 500)
        return serialized

    @staticmethod
    def create_booking(user_id_str: str, payload: dict[str, Any]) -> dict[str, Any]:
        """
        Create a room booking reservation for the authenticated user.
        Calculates nights and totals authoritatively from server-side room price.
        """
        user_id = parse_object_id(user_id_str)
        if not user_id:
            raise AppException("UNAUTHORIZED", "Invalid user.", 401)

        room_id = parse_object_id(payload.get("room_id"))
        if not room_id:
            raise AppException("NOT_FOUND", "Room ID is invalid.", 404)

        db = get_db()
        room = db.rooms.find_one({"_id": room_id})
        if not room:
            raise AppException("NOT_FOUND", "Room not found in hotel catalog.", 404)

        check_in_str = payload.get("check_in")
        check_out_str = payload.get("check_out")

        try:
            check_in_date = datetime.strptime(check_in_str, "%Y-%m-%d").date()
            check_out_date = datetime.strptime(check_out_str, "%Y-%m-%d").date()
        except ValueError:
            raise AppException("VALIDATION_ERROR", "Dates must be formatted as YYYY-MM-DD.", 422)

        if check_out_date <= check_in_date:
            raise AppException(
                "VALIDATION_ERROR",
                "Check-out date must be strictly after check-in date.",
                422,
                fields={"check_out": "Check-out must be after check-in."},
            )

        nights = max(1, (check_out_date - check_in_date).days)
        price_per_night = int(room.get("price_per_night", 0))
        subtotal = price_per_night * nights

        tax_rate = current_app.config.get("ROOM_TAX_RATE", DEFAULT_ROOM_TAX_RATE)
        tax = int(round(subtotal * tax_rate))
        total = subtotal + tax

        now = datetime.now(timezone.utc)
        booking_doc = {
            "user_id": user_id,
            "room_id": str(room["_id"]),
            "room_name": room.get("name", "Luxury Suite"),
            "room_image": room.get("images", [""])[0] if room.get("images") else "",
            "room_category": room.get("category", "Suite"),
            "check_in": check_in_str,
            "check_out": check_out_str,
            "nights": nights,
            "guests_adults": payload.get("guests_adults", 1),
            "guests_children": payload.get("guests_children", 0),
            "price_per_night": price_per_night,
            "subtotal": subtotal,
            "tax": tax,
            "total": total,
            "currency": CURRENCY_INR,
            "special_requests": (payload.get("special_requests") or "").strip() or None,
            "status": BOOKING_STATUS_CONFIRMED,
            "created_at": now,
            "updated_at": now,
        }

        result = db.room_bookings.insert_one(booking_doc)
        booking_doc["_id"] = result.inserted_id

        serialized = serialize_doc(booking_doc)
        if not serialized:
            raise AppException("INTERNAL_ERROR", "Failed to serialize booking.", 500)
        return serialized

    @staticmethod
    def get_user_bookings(user_id_str: str) -> list[dict[str, Any]]:
        """Retrieve all room bookings for the authenticated user, newest first."""
        user_id = parse_object_id(user_id_str)
        if not user_id:
            raise AppException("UNAUTHORIZED", "Invalid user ID.", 401)

        db = get_db()
        cursor = db.room_bookings.find({"user_id": user_id}).sort("created_at", -1)
        return serialize_docs(list(cursor))

    @staticmethod
    def cancel_booking(booking_id_str: str, user_id_str: str) -> dict[str, Any]:
        """Cancel a room booking belonging to the authenticated user."""
        booking_id = parse_object_id(booking_id_str)
        user_id = parse_object_id(user_id_str)

        if not booking_id:
            raise AppException("NOT_FOUND", "Reservation not found.", 404)

        db = get_db()
        booking = db.room_bookings.find_one({"_id": booking_id})
        if not booking:
            raise AppException("NOT_FOUND", "Reservation not found.", 404)

        if booking.get("user_id") != user_id:
            raise AppException("NOT_FOUND", "Reservation not found.", 404)

        current_status = booking.get("status")
        if current_status not in CANCELLABLE_BOOKING_STATUSES:
            raise AppException(
                code="BOOKING_CANNOT_BE_CANCELLED",
                message=f"Reservation cannot be cancelled in '{current_status}' status.",
                status_code=400,
            )

        now = datetime.now(timezone.utc)
        db.room_bookings.update_one(
            {"_id": booking_id},
            {"$set": {"status": BOOKING_STATUS_CANCELLED, "updated_at": now}},
        )

        booking["status"] = BOOKING_STATUS_CANCELLED
        booking["updated_at"] = now
        serialized = serialize_doc(booking)
        if not serialized:
            raise AppException("INTERNAL_ERROR", "Failed to serialize booking.", 500)
        return serialized
