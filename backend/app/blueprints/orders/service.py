"""Order service enforcing server-side pricing, tax calculation, and access control."""

from datetime import datetime, timezone
from typing import Any
from flask import current_app
from app.constants import (
    CANCELLABLE_ORDER_STATUSES,
    CURRENCY_INR,
    DEFAULT_DINING_TAX_RATE,
    ORDER_STATUS_CANCELLED,
    ORDER_STATUS_PENDING,
)
from app.db.client import get_db
from app.errors import AppException
from app.utils.serialization import parse_object_id, serialize_doc, serialize_docs


class OrderService:
    """Business logic for in-room and restaurant dining orders."""

    @staticmethod
    def calculate_order_totals(
        items_payload: list[dict[str, Any]],
    ) -> tuple[list[dict[str, Any]], int, int, int]:
        """
        CRITICAL SECURITY REQUIREMENT:
        Never trust client-submitted prices or totals.
        1. Query MongoDB for each menu item by ObjectId.
        2. Verify existence and availability.
        3. Read the authoritative server-side price.
        4. Calculate line_total, subtotal, tax, and grand total.
        5. Return a complete snapshot of item details.
        """
        db = get_db()
        processed_items: list[dict[str, Any]] = []
        subtotal = 0

        # Query items efficiently
        object_ids = [parse_object_id(it["menu_item_id"]) for it in items_payload]
        valid_ids = [oid for oid in object_ids if oid is not None]

        menu_items_map = {
            doc["_id"]: doc
            for doc in db.menu_items.find({"_id": {"$in": valid_ids}})
        }

        for idx, item_req in enumerate(items_payload):
            item_id = parse_object_id(item_req.get("menu_item_id"))
            if not item_id or item_id not in menu_items_map:
                raise AppException(
                    code="ITEM_NOT_FOUND",
                    message=f"Menu item at index {idx} was not found in our catalog.",
                    status_code=404,
                    fields={f"items.{idx}.menu_item_id": "Menu item does not exist."},
                )

            menu_doc = menu_items_map[item_id]

            # Availability check
            if not menu_doc.get("available", True):
                raise AppException(
                    code="ITEM_UNAVAILABLE",
                    message=f"'{menu_doc.get('name')}' is currently not available from our kitchen.",
                    status_code=422,
                    fields={f"items.{idx}.menu_item_id": "Item is currently sold out."},
                )

            quantity = int(item_req.get("quantity", 1))
            server_price = int(menu_doc.get("price", 0))
            line_total = server_price * quantity
            subtotal += line_total

            notes = item_req.get("notes")

            processed_items.append({
                "menu_item_id": str(menu_doc["_id"]),
                "name": menu_doc.get("name", "Curated Dish"),
                "price": server_price,
                "quantity": quantity,
                "notes": str(notes).strip() if notes else None,
                "line_total": line_total,
                "image_url": menu_doc.get("image_url"),
            })

        # Configurable tax rate
        tax_rate = current_app.config.get("DINING_TAX_RATE", DEFAULT_DINING_TAX_RATE)
        tax = int(round(subtotal * tax_rate))
        total = subtotal + tax

        return processed_items, subtotal, tax, total

    @staticmethod
    def create_order(user_id_str: str, payload: dict[str, Any]) -> dict[str, Any]:
        """Create a verified dining order for the authenticated user."""
        user_id = parse_object_id(user_id_str)
        if not user_id:
            raise AppException("UNAUTHORIZED", "Invalid authenticated user.", 401)

        items_payload = payload.get("items", [])
        order_type = payload.get("order_type", "room_service")
        room_number = payload.get("room_number")
        special_instructions = payload.get("special_instructions")

        # Authoritative server calculation
        processed_items, subtotal, tax, total = OrderService.calculate_order_totals(items_payload)

        db = get_db()
        now = datetime.now(timezone.utc)

        order_doc = {
            "user_id": user_id,
            "order_type": order_type,
            "room_number": room_number.strip() if room_number else None,
            "special_instructions": special_instructions.strip() if special_instructions else None,
            "items": processed_items,
            "subtotal": subtotal,
            "tax": tax,
            "total": total,
            "currency": CURRENCY_INR,
            "status": ORDER_STATUS_PENDING,
            "created_at": now,
            "updated_at": now,
        }

        result = db.orders.insert_one(order_doc)
        order_doc["_id"] = result.inserted_id

        serialized = serialize_doc(order_doc)
        if not serialized:
            raise AppException("INTERNAL_ERROR", "Failed to serialize created order.", 500)
        return serialized

    @staticmethod
    def get_user_orders(user_id_str: str) -> list[dict[str, Any]]:
        """Retrieve order history strictly for the authenticated user, newest first."""
        user_id = parse_object_id(user_id_str)
        if not user_id:
            raise AppException("UNAUTHORIZED", "Invalid user ID.", 401)

        db = get_db()
        cursor = db.orders.find({"user_id": user_id}).sort("created_at", -1)
        return serialize_docs(list(cursor))

    @staticmethod
    def get_order_by_id(order_id_str: str, user_id_str: str) -> dict[str, Any]:
        """Fetch order details with strict user ownership access control."""
        order_id = parse_object_id(order_id_str)
        user_id = parse_object_id(user_id_str)

        if not order_id:
            raise AppException("NOT_FOUND", "Order not found.", 404)

        db = get_db()
        order = db.orders.find_one({"_id": order_id})
        if not order:
            raise AppException("NOT_FOUND", "Order not found.", 404)

        # Access control: ensure requesting user owns the order
        if order.get("user_id") != user_id:
            # Safe 404 response to avoid information leakage
            raise AppException("NOT_FOUND", "Order not found.", 404)

        serialized = serialize_doc(order)
        if not serialized:
            raise AppException("INTERNAL_ERROR", "Failed to serialize order.", 500)
        return serialized

    @staticmethod
    def cancel_order(order_id_str: str, user_id_str: str) -> dict[str, Any]:
        """Cancel an order if it belongs to the user and is in a cancellable status."""
        order_id = parse_object_id(order_id_str)
        user_id = parse_object_id(user_id_str)

        if not order_id:
            raise AppException("NOT_FOUND", "Order not found.", 404)

        db = get_db()
        order = db.orders.find_one({"_id": order_id})
        if not order:
            raise AppException("NOT_FOUND", "Order not found.", 404)

        if order.get("user_id") != user_id:
            raise AppException("NOT_FOUND", "Order not found.", 404)

        current_status = order.get("status")
        if current_status not in CANCELLABLE_ORDER_STATUSES:
            raise AppException(
                code="ORDER_CANNOT_BE_CANCELLED",
                message=f"Order cannot be cancelled in '{current_status}' status as the kitchen has already commenced preparation.",
                status_code=400,
            )

        now = datetime.now(timezone.utc)
        db.orders.update_one(
            {"_id": order_id},
            {"$set": {"status": ORDER_STATUS_CANCELLED, "updated_at": now}},
        )

        order["status"] = ORDER_STATUS_CANCELLED
        order["updated_at"] = now
        serialized = serialize_doc(order)
        if not serialized:
            raise AppException("INTERNAL_ERROR", "Failed to serialize cancelled order.", 500)
        return serialized
