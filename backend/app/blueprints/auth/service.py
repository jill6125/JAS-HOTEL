"""Authentication service encapsulating user signup, credential verification, and user retrieval."""

from datetime import datetime, timezone
from typing import Any
from werkzeug.security import check_password_hash, generate_password_hash
from app.constants import ROLE_CUSTOMER
from app.db.client import get_db
from app.errors import AppException
from app.utils.serialization import serialize_doc


class AuthService:
    """Business logic for customer and administrative authentication."""

    @staticmethod
    def signup(name: str, email: str, password: str) -> dict[str, Any]:
        """Register a new customer account with hashed password and unique normalized email."""
        db = get_db()
        normalized_email = email.strip().lower()

        # Check for existing account
        existing_user = db.users.find_one({"email": normalized_email})
        if existing_user:
            raise AppException(
                code="EMAIL_CONFLICT",
                message="An account with this email address already exists.",
                status_code=409,
                fields={"email": "Email is already registered."},
            )

        password_hash = generate_password_hash(password)
        now = datetime.now(timezone.utc)

        user_doc = {
            "name": name.strip(),
            "email": normalized_email,
            "password_hash": password_hash,
            "role": ROLE_CUSTOMER,
            "created_at": now,
            "updated_at": now,
        }

        result = db.users.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id

        safe_user = serialize_doc(user_doc)
        if not safe_user:
            raise AppException("INTERNAL_ERROR", "Failed to serialize created user.", 500)
        return safe_user

    @staticmethod
    def login(email: str, password: str) -> dict[str, Any]:
        """Verify user credentials and return safe user representation."""
        db = get_db()
        normalized_email = email.strip().lower()

        user = db.users.find_one({"email": normalized_email})
        if not user:
            # Generic error to prevent email enumeration
            raise AppException(
                code="INVALID_CREDENTIALS",
                message="Invalid email or password.",
                status_code=401,
            )

        if not check_password_hash(user.get("password_hash", ""), password):
            raise AppException(
                code="INVALID_CREDENTIALS",
                message="Invalid email or password.",
                status_code=401,
            )

        safe_user = serialize_doc(user)
        if not safe_user:
            raise AppException("INTERNAL_ERROR", "Failed to serialize user.", 500)
        return safe_user
