"""MongoDB index initialization for high-performance querying and uniqueness."""

import logging
from pymongo import ASCENDING, DESCENDING, TEXT
from pymongo.database import Database

logger = logging.getLogger(__name__)


def create_indexes(db: Database) -> None:
    """Create essential and recommended MongoDB indexes for JAS Hotel collections."""
    try:
        # 1. Users collection: unique email
        db.users.create_index(
            [("email", ASCENDING)],
            unique=True,
            name="idx_users_email_unique",
        )
        logger.info("Created unique index on users.email")

        # 2. Menu Items collection
        db.menu_items.create_index(
            [("category", ASCENDING)],
            name="idx_menu_category",
        )
        db.menu_items.create_index(
            [("featured", ASCENDING)],
            name="idx_menu_featured",
        )
        db.menu_items.create_index(
            [("available", ASCENDING)],
            name="idx_menu_available",
        )
        db.menu_items.create_index(
            [("name", TEXT), ("description", TEXT)],
            name="idx_menu_text_search",
        )
        logger.info("Created indexes on menu_items")

        # 3. Orders collection: user_id + created_at compound index
        db.orders.create_index(
            [("user_id", ASCENDING), ("created_at", DESCENDING)],
            name="idx_orders_user_created",
        )
        db.orders.create_index(
            [("status", ASCENDING)],
            name="idx_orders_status",
        )
        logger.info("Created indexes on orders")

        # 4. Rooms collection
        db.rooms.create_index(
            [("category", ASCENDING)],
            name="idx_rooms_category",
        )
        db.rooms.create_index(
            [("featured", ASCENDING)],
            name="idx_rooms_featured",
        )
        logger.info("Created indexes on rooms")

        # 5. Room Bookings collection
        db.room_bookings.create_index(
            [("user_id", ASCENDING), ("created_at", DESCENDING)],
            name="idx_bookings_user_created",
        )
        db.room_bookings.create_index(
            [("room_id", ASCENDING)],
            name="idx_bookings_room",
        )
        logger.info("Created indexes on room_bookings")

    except Exception as exc:
        logger.warning("Index creation notice: %s", exc)
