"""Centralized BSON/ObjectId serialization helpers for JSON responses."""

from datetime import datetime
from typing import Any
from bson import ObjectId


def is_valid_object_id(val: Any) -> bool:
    """Check if the provided value is a valid 24-character hexadecimal ObjectId."""
    if not val:
        return False
    if isinstance(val, ObjectId):
        return True
    return ObjectId.is_valid(str(val))


def parse_object_id(val: Any) -> ObjectId | None:
    """Safely convert a string or value to a BSON ObjectId, or return None if invalid."""
    if isinstance(val, ObjectId):
        return val
    if val and ObjectId.is_valid(str(val)):
        try:
            return ObjectId(str(val))
        except Exception:
            return None
    return None


def serialize_doc(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    """
    Recursively serialize a MongoDB document for JSON responses:
    - Replaces `_id` with string `id`
    - Converts all nested `ObjectId`s to strings
    - Converts `datetime` objects to ISO 8601 strings
    """
    if doc is None:
        return None

    serialized: dict[str, Any] = {}
    for key, value in doc.items():
        if key == "_id":
            serialized["id"] = str(value)
        elif key == "password_hash":
            # Never serialize password hashes to the API boundary
            continue
        elif isinstance(value, ObjectId):
            serialized[key] = str(value)
        elif isinstance(value, datetime):
            serialized[key] = value.isoformat()
        elif isinstance(value, dict):
            serialized[key] = serialize_doc(value)
        elif isinstance(value, list):
            serialized[key] = [
                serialize_doc(item) if isinstance(item, dict)
                else str(item) if isinstance(item, ObjectId)
                else item.isoformat() if isinstance(item, datetime)
                else item
                for item in value
            ]
        else:
            serialized[key] = value

    return serialized


def serialize_docs(docs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Serialize a list of MongoDB documents."""
    return [serialize_doc(doc) for doc in docs if doc is not None]  # type: ignore
