"""Menu service for retrieving and querying culinary items."""

import re
from typing import Any
from app.db.client import get_db
from app.errors import AppException
from app.utils.serialization import parse_object_id, serialize_doc, serialize_docs


class MenuService:
    """Business operations for hotel dining menu items."""

    @staticmethod
    def get_menu_items(
        category: str | None = None,
        search: str | None = None,
        featured: bool | None = None,
        available: bool | None = None,
    ) -> list[dict[str, Any]]:
        """Query menu items with flexible filtering."""
        db = get_db()
        filter_query: dict[str, Any] = {}

        if category and category.lower() != "all":
            # Case-insensitive category match
            filter_query["category"] = {"$regex": f"^{re.escape(category)}$", "$options": "i"}

        if search and search.strip():
            term = search.strip()
            # Regex match across name and description
            filter_query["$or"] = [
                {"name": {"$regex": re.escape(term), "$options": "i"}},
                {"description": {"$regex": re.escape(term), "$options": "i"}},
            ]

        if featured is not None:
            filter_query["featured"] = featured

        if available is not None:
            filter_query["available"] = available

        # Sort by sort_order or created_at
        cursor = db.menu_items.find(filter_query).sort([("sort_order", 1), ("_id", 1)])
        items = list(cursor)
        return serialize_docs(items)

    @staticmethod
    def get_menu_item_by_id(item_id_str: str) -> dict[str, Any]:
        """Fetch a single menu item by string or ObjectId."""
        item_id = parse_object_id(item_id_str)
        if not item_id:
            raise AppException(
                code="NOT_FOUND",
                message="Menu item not found.",
                status_code=404,
            )

        db = get_db()
        item = db.menu_items.find_one({"_id": item_id})
        if not item:
            raise AppException(
                code="NOT_FOUND",
                message="Menu item not found.",
                status_code=404,
            )

        safe_item = serialize_doc(item)
        if not safe_item:
            raise AppException("INTERNAL_ERROR", "Failed to serialize menu item.", 500)
        return safe_item
