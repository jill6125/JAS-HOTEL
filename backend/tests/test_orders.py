"""Order test suite covering creation, price verification, tax calculation, history, and cancellation."""

import pytest
from bson import ObjectId


def test_create_order_unauthenticated_rejected(client):
    """Test that creating an order without an authenticated session returns 401."""
    client.post("/api/auth/logout")
    payload = {
        "order_type": "room_service",
        "room_number": "501",
        "items": [{"menu_item_id": str(ObjectId()), "quantity": 1}],
    }
    resp = client.post("/api/orders", json=payload)
    assert resp.status_code == 401
    assert resp.get_json()["error"]["code"] == "UNAUTHENTICATED"


def test_create_order_valid_and_server_price_calculation(authenticated_client):
    """
    CRITICAL SECURITY TEST:
    Verify that the server calculates subtotal, tax (18%), and total authoritatively,
    ignoring any price values submitted by the client.
    """
    # 1. Fetch valid menu items
    menu_resp = authenticated_client.get("/api/menu")
    menu_items = menu_resp.get_json()["items"]
    item1 = menu_items[0]
    item2 = menu_items[1]

    expected_line1 = item1["price"] * 2
    expected_line2 = item2["price"] * 1
    expected_subtotal = expected_line1 + expected_line2
    expected_tax = int(round(expected_subtotal * 0.18))
    expected_total = expected_subtotal + expected_tax

    # Client tries to manipulate price or pass fake total
    order_payload = {
        "order_type": "room_service",
        "room_number": "Royal Suite 702",
        "special_instructions": "Serve on royal silverware please.",
        "items": [
            {
                "menu_item_id": item1["id"],
                "quantity": 2,
                "notes": "Extra crispy",
                "price": 1,  # HACK ATTEMPT: should be ignored!
            },
            {
                "menu_item_id": item2["id"],
                "quantity": 1,
                "price": 5,  # HACK ATTEMPT: should be ignored!
            },
        ],
        "total": 6,  # HACK ATTEMPT: should be ignored!
    }

    create_resp = authenticated_client.post("/api/orders", json=order_payload)
    assert create_resp.status_code == 201

    order = create_resp.get_json()["order"]
    assert order["subtotal"] == expected_subtotal
    assert order["tax"] == expected_tax
    assert order["total"] == expected_total
    assert order["status"] == "pending"
    assert order["room_number"] == "Royal Suite 702"
    assert len(order["items"]) == 2

    # Verify line items snapshot
    assert order["items"][0]["price"] == item1["price"]
    assert order["items"][0]["line_total"] == expected_line1
    assert order["items"][1]["price"] == item2["price"]
    assert order["items"][1]["line_total"] == expected_line2


def test_create_order_invalid_item_rejected(authenticated_client):
    """Test order with nonexistent menu item returns 404."""
    fake_id = str(ObjectId())
    payload = {
        "order_type": "room_service",
        "room_number": "401",
        "items": [{"menu_item_id": fake_id, "quantity": 1}],
    }
    resp = authenticated_client.post("/api/orders", json=payload)
    assert resp.status_code == 404
    assert resp.get_json()["error"]["code"] == "ITEM_NOT_FOUND"


def test_create_order_unavailable_item_rejected(authenticated_client, mock_db):
    """Test ordering a sold-out/unavailable item returns 422."""
    # Find a menu item and mark available=False
    item = mock_db.menu_items.find_one()
    mock_db.menu_items.update_one({"_id": item["_id"]}, {"$set": {"available": False}})

    payload = {
        "order_type": "room_service",
        "room_number": "305",
        "items": [{"menu_item_id": str(item["_id"]), "quantity": 1}],
    }
    resp = authenticated_client.post("/api/orders", json=payload)
    assert resp.status_code == 422
    assert resp.get_json()["error"]["code"] == "ITEM_UNAVAILABLE"


def test_create_order_invalid_quantity_rejected(authenticated_client):
    """Test that zero or negative quantities are rejected."""
    menu_resp = authenticated_client.get("/api/menu")
    item = menu_resp.get_json()["items"][0]

    payload = {
        "order_type": "room_service",
        "room_number": "101",
        "items": [{"menu_item_id": item["id"], "quantity": 0}],
    }
    resp = authenticated_client.post("/api/orders", json=payload)
    assert resp.status_code == 422
    assert "items.0.quantity" in resp.get_json()["error"]["fields"]


def test_order_history_isolation(client):
    """Test that order history returns only orders belonging to current user."""
    # User A
    client.post("/api/auth/signup", json={
        "name": "User A",
        "email": "userA@test.com",
        "password": "Password123!",
    })
    menu_resp = client.get("/api/menu")
    item = menu_resp.get_json()["items"][0]

    order_a_resp = client.post("/api/orders", json={
        "order_type": "room_service",
        "room_number": "101",
        "items": [{"menu_item_id": item["id"], "quantity": 1}],
    })
    order_a_id = order_a_resp.get_json()["order"]["id"]

    # Logout User A and Signup User B
    client.post("/api/auth/logout")
    client.post("/api/auth/signup", json={
        "name": "User B",
        "email": "userB@test.com",
        "password": "Password123!",
    })

    # User B list orders -> should be empty
    list_b = client.get("/api/orders")
    assert list_b.status_code == 200
    assert list_b.get_json()["count"] == 0

    # User B trying to access User A's order -> 404
    detail_b = client.get(f"/api/orders/{order_a_id}")
    assert detail_b.status_code == 404


def test_order_cancellation(authenticated_client):
    """Test cancelling an order in pending state succeeds, and cancelling twice or late fails."""
    menu_resp = authenticated_client.get("/api/menu")
    item = menu_resp.get_json()["items"][0]

    order_resp = authenticated_client.post("/api/orders", json={
        "order_type": "room_service",
        "room_number": "202",
        "items": [{"menu_item_id": item["id"], "quantity": 1}],
    })
    order_id = order_resp.get_json()["order"]["id"]

    # 1. Cancel order
    cancel_resp = authenticated_client.patch(f"/api/orders/{order_id}/cancel")
    assert cancel_resp.status_code == 200
    assert cancel_resp.get_json()["order"]["status"] == "cancelled"

    # 2. Attempt to cancel again -> should fail
    cancel_again_resp = authenticated_client.patch(f"/api/orders/{order_id}/cancel")
    assert cancel_again_resp.status_code == 400
    assert cancel_again_resp.get_json()["error"]["code"] == "ORDER_CANNOT_BE_CANCELLED"
