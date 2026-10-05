"""Authentication routes for signup, login, session inspection, and logout."""

from flask import Blueprint, jsonify, request, session
from app.blueprints.auth.service import AuthService
from app.errors import AppException
from app.utils.auth import get_current_user
from app.utils.validation import validate_login_payload, validate_signup_payload

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/signup", methods=["POST"])
def signup():
    """Create a new user profile and establish an authenticated session."""
    data = request.get_json(silent=True)
    is_valid, errors = validate_signup_payload(data)
    if not is_valid:
        raise AppException(
            code="VALIDATION_ERROR",
            message="Please provide all required fields correctly.",
            status_code=422,
            fields=errors,
        )

    user = AuthService.signup(
        name=data["name"],
        email=data["email"],
        password=data["password"],
    )

    # Establish session
    session["user_id"] = user["id"]
    session.permanent = True

    return jsonify({
        "message": f"Welcome to JAS Hotel, {user['name']}.",
        "user": user,
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """Verify credentials and establish user session."""
    data = request.get_json(silent=True)
    is_valid, errors = validate_login_payload(data)
    if not is_valid:
        raise AppException(
            code="VALIDATION_ERROR",
            message="Please provide valid credentials.",
            status_code=422,
            fields=errors,
        )

    user = AuthService.login(
        email=data["email"],
        password=data["password"],
    )

    # Establish session
    session["user_id"] = user["id"]
    session.permanent = True

    return jsonify({
        "message": "Signed in successfully.",
        "user": user,
    }), 200


@auth_bp.route("/me", methods=["GET"])
def me():
    """Retrieve the current authenticated user identity."""
    user = get_current_user()
    if not user:
        return jsonify({
            "authenticated": False,
            "user": None,
        }), 200

    return jsonify({
        "authenticated": True,
        "user": user,
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Clear session and log the user out."""
    session.clear()
    return jsonify({
        "message": "Successfully signed out of JAS Hotel.",
    }), 200
