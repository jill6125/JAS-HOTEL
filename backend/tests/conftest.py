"""Pytest configuration and mock fixtures for JAS Hotel backend."""

import pytest
from mongomock import MongoClient as MockMongoClient
from app import create_app
from app.config import TestingConfig
from app.db import client as db_client_module
from app.db.seed import SEED_MENU_ITEMS, SEED_ROOMS
from datetime import datetime, timezone


@pytest.fixture(scope="session")
def app():
    """Create Flask application configured for testing."""
    test_app = create_app(TestingConfig)
    return test_app


@pytest.fixture
def mock_db(monkeypatch):
    """In-memory MongoDB mock instance using mongomock."""
    client = MockMongoClient()
    db = client["jas_hotel_test"]

    # Seed mock database with initial menu items and suites
    now = datetime.now(timezone.utc)
    for item in SEED_MENU_ITEMS:
        item_copy = dict(item)
        item_copy["created_at"] = now
        item_copy["updated_at"] = now
        db.menu_items.insert_one(item_copy)

    for room in SEED_ROOMS:
        room_copy = dict(room)
        room_copy["created_at"] = now
        room_copy["updated_at"] = now
        db.rooms.insert_one(room_copy)

    # Patch db accessor in app.db.client
    monkeypatch.setattr(db_client_module, "get_db", lambda: db)
    monkeypatch.setattr(db_client_module, "get_client", lambda: client)

    return db


@pytest.fixture
def client(app, mock_db):
    """Flask test client connected to the mock MongoDB database."""
    with app.test_client() as test_client:
        yield test_client


@pytest.fixture
def authenticated_client(client):
    """Helper to return an authenticated test client with a test customer account."""
    signup_payload = {
        "name": "Maharaja Kumar",
        "email": "maharaja@jashotel.com",
        "password": "RoyalPassword123!",
    }
    client.post("/api/auth/signup", json=signup_payload)
    return client
