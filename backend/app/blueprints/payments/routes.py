"""Payments routes for Razorpay key inquiry, checkout initiation, and payment verification."""

from flask import Blueprint, jsonify, request
from app.blueprints.payments.service import RazorpayService
from app.db.client import get_db
from app.errors import AppException
from app.utils.auth import get_current_user, login_required
from app.utils.serialization import parse_object_id, serialize_doc
from datetime import datetime, timezone

payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")


@payments_bp.route("/config", methods=["GET"])
def get_payment_config():
    """Retrieve public Razorpay configuration (Key ID and gateway state)."""
    _, key_id, _ = RazorpayService.get_client()
    is_live = bool(key_id and "placeholder" not in key_id.lower())
    return jsonify({
        "key_id": key_id or "rzp_test_placeholder",
        "is_configured": is_live,
        "currency": "INR",
    }), 200


@payments_bp.route("/create-order", methods=["POST"])
@login_required
def create_payment_order():
    """
    Create a Razorpay payment order for either a dining order or room booking.
    Request: { reference_id: "...", type: "dining_order" | "room_booking" }
    """
    user = get_current_user()
    data = request.get_json(silent=True) or {}

    reference_id_str = data.get("reference_id")
    order_type = data.get("type", "dining_order")

    if not reference_id_str:
        raise AppException("VALIDATION_ERROR", "reference_id is required.", 422)

    db = get_db()
    obj_id = parse_object_id(reference_id_str)
    amount_inr = 0
    receipt = ""
    notes = {"user_id": user["id"], "user_email": user["email"]}

    if order_type == "room_booking":
        booking = db.room_bookings.find_one({"_id": obj_id}) if obj_id else None
        if not booking:
            raise AppException("NOT_FOUND", "Room reservation not found.", 404)
        if booking.get("user_id") != parse_object_id(user["id"]):
            raise AppException("FORBIDDEN", "Unauthorized access to reservation.", 403)
        amount_inr = booking.get("total", 0)
        receipt = f"rcpt_bk_{str(booking['_id'])[:12]}"
        notes["booking_id"] = str(booking["_id"])
        notes["room_name"] = booking.get("room_name", "")
    else:
        order = db.orders.find_one({"_id": obj_id}) if obj_id else None
        if not order:
            raise AppException("NOT_FOUND", "Dining order not found.", 404)
        if order.get("user_id") != parse_object_id(user["id"]):
            raise AppException("FORBIDDEN", "Unauthorized access to order.", 403)
        amount_inr = order.get("total", 0)
        receipt = f"rcpt_ord_{str(order['_id'])[:12]}"
        notes["order_id"] = str(order["_id"])

    payment_info = RazorpayService.create_payment_order(
        amount_inr=amount_inr,
        receipt=receipt,
        notes=notes,
    )

    # Persist razorpay_order_id in document
    if order_type == "room_booking":
        db.room_bookings.update_one(
            {"_id": obj_id},
            {"$set": {"razorpay_order_id": payment_info["razorpay_order_id"]}},
        )
    else:
        db.orders.update_one(
            {"_id": obj_id},
            {"$set": {"razorpay_order_id": payment_info["razorpay_order_id"]}},
        )

    return jsonify(payment_info), 200


@payments_bp.route("/verify", methods=["POST"])
@login_required
def verify_payment():
    """
    Verify Razorpay payment signature and mark order/booking as paid.
    Request: {
        reference_id: "...",
        type: "dining_order" | "room_booking",
        razorpay_order_id: "...",
        razorpay_payment_id: "...",
        razorpay_signature: "..."
    }
    """
    data = request.get_json(silent=True) or {}
    reference_id_str = data.get("reference_id")
    order_type = data.get("type", "dining_order")
    rp_order_id = data.get("razorpay_order_id")
    rp_payment_id = data.get("razorpay_payment_id")
    rp_signature = data.get("razorpay_signature")

    if not rp_payment_id:
        raise AppException("VALIDATION_ERROR", "Payment ID is required.", 422)

    # Verify signature
    is_valid = RazorpayService.verify_payment_signature(
        razorpay_order_id=rp_order_id or "",
        razorpay_payment_id=rp_payment_id,
        razorpay_signature=rp_signature or "",
    )

    if not is_valid:
        raise AppException(
            code="PAYMENT_VERIFICATION_FAILED",
            message="Payment signature verification failed.",
            status_code=400,
        )

    db = get_db()
    obj_id = parse_object_id(reference_id_str)
    now = datetime.now(timezone.utc)

    payment_record = {
        "payment_status": "Paid",
        "payment_method": "Razorpay",
        "razorpay_payment_id": rp_payment_id,
        "razorpay_order_id": rp_order_id,
        "paid_at": now,
        "updated_at": now,
    }

    if order_type == "room_booking":
        db.room_bookings.update_one({"_id": obj_id}, {"$set": payment_record})
        doc = db.room_bookings.find_one({"_id": obj_id})
    else:
        db.orders.update_one({"_id": obj_id}, {"$set": payment_record})
        doc = db.orders.find_one({"_id": obj_id})

    return jsonify({
        "message": "Payment verified and recorded successfully.",
        "payment_status": "Paid",
        "transaction_id": rp_payment_id,
        "record": serialize_doc(doc),
    }), 200
