"""Authentication decorators and helpers for session-based user resolution."""

from functools import wraps
from typing import Any, Callable
from flask import g, session
from app.errors import AppException
from app.db.client import get_db
from app.utils.serialization import parse_object_id, serialize_doc


def get_current_user() -> dict[str, Any] | None:
    """
    Retrieve the current authenticated user from session.
    Caches the user document in Flask's `g` request context.
    """
    if hasattr(g, "current_user"):
        return g.current_user

    user_id_str = session.get("user_id")
    if not user_id_str:
        g.current_user = None
        return None

    user_id = parse_object_id(user_id_str)
    if not user_id:
        session.clear()
        g.current_user = None
        return None

    db = get_db()
    user = db.users.find_one({"_id": user_id})
    if not user:
        session.clear()
        g.current_user = None
        return None

    safe_user = serialize_doc(user)
    g.current_user = safe_user
    return safe_user


def login_required(f: Callable) -> Callable:
    """Decorator ensuring that an authenticated user session is present."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            raise AppException(
                code="UNAUTHENTICATED",
                message="You must be signed in to access this luxury service.",
                status_code=401,
            )
        return f(*args, **kwargs)

    return decorated_function


def admin_required(f: Callable) -> Callable:
    """Decorator ensuring that the authenticated user holds the admin role."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            raise AppException(
                code="UNAUTHENTICATED",
                message="Authentication required.",
                status_code=401,
            )
        if user.get("role") != "admin":
            raise AppException(
                code="FORBIDDEN",
                message="Administrative privileges required.",
                status_code=403,
            )
        return f(*args, **kwargs)

    return decorated_function
