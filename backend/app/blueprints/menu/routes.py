"""Menu routes for menu browsing and individual item lookup."""

from flask import Blueprint, jsonify, request
from app.blueprints.menu.service import MenuService

menu_bp = Blueprint("menu", __name__, url_prefix="/api/menu")


@menu_bp.route("", methods=["GET"])
def list_menu():
    """List menu items with optional category, search, and availability filters."""
    category = request.args.get("category")
    search = request.args.get("search")

    featured_arg = request.args.get("featured")
    featured = None
    if featured_arg is not None:
        featured = featured_arg.lower() in ("true", "1", "yes")

    available_arg = request.args.get("available")
    available = None
    if available_arg is not None:
        available = available_arg.lower() in ("true", "1", "yes")

    items = MenuService.get_menu_items(
        category=category,
        search=search,
        featured=featured,
        available=available,
    )

    return jsonify({
        "items": items,
        "count": len(items),
    }), 200


@menu_bp.route("/<string:item_id>", methods=["GET"])
def get_menu_item(item_id: str):
    """Retrieve details for a single menu item."""
    item = MenuService.get_menu_item_by_id(item_id)
    return jsonify({
        "item": item,
    }), 200
