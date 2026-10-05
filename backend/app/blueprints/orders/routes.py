"""Order routes for authenticated order placement, history, detail, and cancellation."""

from flask import Blueprint, jsonify, request
from app.blueprints.orders.service import OrderService
from app.errors import AppException
from app.utils.auth import get_current_user, login_required
from app.utils.validation import validate_order_payload

orders_bp = Blueprint("orders", __name__, url_prefix="/api/orders")


@orders_bp.route("", methods=["POST"])
@login_required
def create_order():
    """Create a new authenticated dining order."""
    user = get_current_user()
    data = request.get_json(silent=True)

    is_valid, errors = validate_order_payload(data)
    if not is_valid:
        raise AppException(
            code="VALIDATION_ERROR",
            message="Please review your order details.",
            status_code=422,
            fields=errors,
        )

    order = OrderService.create_order(user_id_str=user["id"], payload=data)

    return jsonify({
        "message": "Order created successfully. The kitchen has been notified.",
        "order": order,
    }), 201


@orders_bp.route("", methods=["GET"])
@login_required
def list_orders():
    """List orders for the current authenticated user only."""
    user = get_current_user()
    orders = OrderService.get_user_orders(user_id_str=user["id"])

    return jsonify({
        "orders": orders,
        "count": len(orders),
    }), 200


@orders_bp.route("/<string:order_id>", methods=["GET"])
@login_required
def get_order(order_id: str):
    """Retrieve details for a specific order owned by current user."""
    user = get_current_user()
    order = OrderService.get_order_by_id(order_id_str=order_id, user_id_str=user["id"])

    return jsonify({
        "order": order,
    }), 200


@orders_bp.route("/<string:order_id>/cancel", methods=["PATCH"])
@login_required
def cancel_order(order_id: str):
    """Cancel a pending or confirmed order."""
    user = get_current_user()
    cancelled_order = OrderService.cancel_order(order_id_str=order_id, user_id_str=user["id"])

    return jsonify({
        "message": "Order successfully cancelled.",
        "order": cancelled_order,
    }), 200
