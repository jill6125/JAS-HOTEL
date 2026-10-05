"""Menu test suite covering listing, filtering, search, and detail lookup."""

import pytest
from bson import ObjectId


def test_list_menu(client):
    """Test retrieving entire menu list."""
    response = client.get("/api/menu")
    assert response.status_code == 200

    data = response.get_json()
    assert "items" in data
    assert "count" in data
    assert data["count"] >= 20
    assert len(data["items"]) == data["count"]

    # Verify ID serialization
    first_item = data["items"][0]
    assert "id" in first_item
    assert "_id" not in first_item
    assert "price" in first_item
    assert "category" in first_item


def test_menu_category_filter(client):
    """Test filtering menu items by specific category."""
    response = client.get("/api/menu?category=Breakfast")
    assert response.status_code == 200

    data = response.get_json()
    assert data["count"] >= 4
    for item in data["items"]:
        assert item["category"].lower() == "breakfast"


def test_menu_search(client):
    """Test search query matching name or description."""
    response = client.get("/api/menu?search=Biryani")
    assert response.status_code == 200

    data = response.get_json()
    assert data["count"] >= 1
    found = any("Biryani" in item["name"] for item in data["items"])
    assert found is True


def test_get_menu_item_detail(client):
    """Test retrieving a single menu item by ID."""
    list_resp = client.get("/api/menu")
    first_item_id = list_resp.get_json()["items"][0]["id"]

    detail_resp = client.get(f"/api/menu/{first_item_id}")
    assert detail_resp.status_code == 200
    item = detail_resp.get_json()["item"]
    assert item["id"] == first_item_id
    assert "description" in item


def test_get_menu_item_invalid_id(client):
    """Test retrieving menu item with invalid ID returns 404."""
    resp = client.get("/api/menu/nonexistent-id-1234")
    assert resp.status_code == 404
    assert resp.get_json()["error"]["code"] == "NOT_FOUND"


def test_menu_featured_filter(client):
    """Test filtering by featured items."""
    resp = client.get("/api/menu?featured=true")
    assert resp.status_code == 200
    items = resp.get_json()["items"]
    assert len(items) > 0
    for item in items:
        assert item["featured"] is True
