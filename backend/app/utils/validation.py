"""Input validation utilities for API payloads."""

import re
from typing import Any
from app.constants import (
    MIN_PASSWORD_LENGTH,
    ALLOWED_ORDER_TYPES,
    MAX_ORDER_ITEMS_COUNT,
    MAX_ITEM_QUANTITY,
)
from app.utils.serialization import is_valid_object_id

EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def validate_email(email: str | None) -> tuple[bool, str | None]:
    """Validate email address format and presence."""
    if not email or not isinstance(email, str):
        return False, "Email address is required."
    clean_email = email.strip()
    if not EMAIL_REGEX.match(clean_email):
        return False, "Please enter a valid email address."
    return True, None


def validate_password(password: str | None) -> tuple[bool, str | None]:
    """Validate password length and string type."""
    if not password or not isinstance(password, str):
        return False, "Password is required."
    if len(password) < MIN_PASSWORD_LENGTH:
        return False, f"Password must be at least {MIN_PASSWORD_LENGTH} characters."
    return True, None


def validate_signup_payload(data: dict[str, Any] | None) -> tuple[bool, dict[str, str]]:
    """Validate user registration payload."""
    errors: dict[str, str] = {}
    if not isinstance(data, dict):
        return False, {"body": "Invalid JSON request body."}

    name = data.get("name")
    if not name or not isinstance(name, str) or not name.strip():
        errors["name"] = "Full name is required."
    elif len(name.strip()) > 100:
        errors["name"] = "Name cannot exceed 100 characters."

    valid_email, email_err = validate_email(data.get("email"))
    if not valid_email:
        errors["email"] = email_err or "Invalid email."

    valid_pw, pw_err = validate_password(data.get("password"))
    if not valid_pw:
        errors["password"] = pw_err or "Invalid password."

    return len(errors) == 0, errors


def validate_login_payload(data: dict[str, Any] | None) -> tuple[bool, dict[str, str]]:
    """Validate user login payload."""
    errors: dict[str, str] = {}
    if not isinstance(data, dict):
        return False, {"body": "Invalid JSON request body."}

    email = data.get("email")
    if not email or not isinstance(email, str) or not email.strip():
        errors["email"] = "Email is required."

    password = data.get("password")
    if not password or not isinstance(password, str):
        errors["password"] = "Password is required."

    return len(errors) == 0, errors


def validate_order_payload(data: dict[str, Any] | None) -> tuple[bool, dict[str, str]]:
    """Validate order creation payload."""
    errors: dict[str, str] = {}
    if not isinstance(data, dict):
        return False, {"body": "Invalid JSON request body."}

    order_type = data.get("order_type", "room_service")
    if order_type not in ALLOWED_ORDER_TYPES:
        errors["order_type"] = f"Invalid order type. Allowed: {', '.join(ALLOWED_ORDER_TYPES)}"

    room_number = data.get("room_number")
    if order_type == "room_service":
        if not room_number or not isinstance(room_number, str) or not room_number.strip():
            errors["room_number"] = "Room number is required for room service dining."
        elif len(room_number.strip()) > 50:
            errors["room_number"] = "Room number must not exceed 50 characters."

    special_instructions = data.get("special_instructions")
    if special_instructions and len(str(special_instructions)) > 500:
        errors["special_instructions"] = "Special instructions must not exceed 500 characters."

    items = data.get("items")
    if not items or not isinstance(items, list) or len(items) == 0:
        errors["items"] = "Order must include at least one menu item."
    elif len(items) > MAX_ORDER_ITEMS_COUNT:
        errors["items"] = f"Order cannot contain more than {MAX_ORDER_ITEMS_COUNT} distinct items."
    else:
        for idx, item in enumerate(items):
            if not isinstance(item, dict):
                errors[f"items.{idx}"] = "Each item must be an object with menu_item_id and quantity."
                continue

            menu_item_id = item.get("menu_item_id")
            if not is_valid_object_id(menu_item_id):
                errors[f"items.{idx}.menu_item_id"] = "Valid menu item ID is required."

            quantity = item.get("quantity")
            if not isinstance(quantity, int) or quantity <= 0:
                errors[f"items.{idx}.quantity"] = "Quantity must be a positive integer."
            elif quantity > MAX_ITEM_QUANTITY:
                errors[f"items.{idx}.quantity"] = f"Quantity cannot exceed {MAX_ITEM_QUANTITY} per item."

            notes = item.get("notes")
            if notes and len(str(notes)) > 200:
                errors[f"items.{idx}.notes"] = "Item notes must not exceed 200 characters."

    return len(errors) == 0, errors


def validate_booking_payload(data: dict[str, Any] | None) -> tuple[bool, dict[str, str]]:
    """Validate room booking reservation payload."""
    errors: dict[str, str] = {}
    if not isinstance(data, dict):
        return False, {"body": "Invalid JSON request body."}

    room_id = data.get("room_id")
    if not is_valid_object_id(room_id):
        errors["room_id"] = "Valid room ID is required."

    check_in = data.get("check_in")
    if not check_in or not isinstance(check_in, str):
        errors["check_in"] = "Check-in date is required (YYYY-MM-DD)."

    check_out = data.get("check_out")
    if not check_out or not isinstance(check_out, str):
        errors["check_out"] = "Check-out date is required (YYYY-MM-DD)."

    adults = data.get("guests_adults", 1)
    if not isinstance(adults, int) or adults < 1 or adults > 10:
        errors["guests_adults"] = "Guests adults must be between 1 and 10."

    children = data.get("guests_children", 0)
    if not isinstance(children, int) or children < 0 or children > 10:
        errors["guests_children"] = "Guests children must be 0 or greater."

    special_requests = data.get("special_requests")
    if special_requests and len(str(special_requests)) > 500:
        errors["special_requests"] = "Special requests must not exceed 500 characters."

    return len(errors) == 0, errors
