"""Rooms and Room Bookings test suite covering suites listing and authenticated booking."""

import pytest
from bson import ObjectId


def test_list_rooms(client):
    """Test public room catalog listing."""
    resp = client.get("/api/rooms")
    assert resp.status_code == 200
    data = resp.get_json()
    assert "rooms" in data
    assert data["count"] >= 4

    first = data["rooms"][0]
    assert "name" in first
    assert "price_per_night" in first
    assert "id" in first


def test_get_room_detail(client):
    """Test fetching room by slug or ID."""
    resp = client.get("/api/rooms/room-1")
    assert resp.status_code == 200
    room = resp.get_json()["room"]
    assert "Maharaja" in room["name"]


def test_create_booking_unauthenticated_rejected(client):
    """Test that room booking requires guest authentication."""
    client.post("/api/auth/logout")
    resp = client.post("/api/bookings", json={
        "room_id": str(ObjectId()),
        "check_in": "2026-10-10",
        "check_out": "2026-10-14",
    })
    assert resp.status_code == 401


def test_create_booking_authenticated_success(authenticated_client):
    """Test creating a room reservation calculates nights, tax, and persists booking."""
    rooms_resp = authenticated_client.get("/api/rooms")
    room = rooms_resp.get_json()["rooms"][0]

    booking_payload = {
        "room_id": room["id"],
        "check_in": "2026-11-01",
        "check_out": "2026-11-04",  # 3 nights
        "guests_adults": 2,
        "guests_children": 1,
        "special_requests": "Sea-facing high floor, please.",
    }

    resp = authenticated_client.post("/api/bookings", json=booking_payload)
    assert resp.status_code == 201
    booking = resp.get_json()["booking"]

    assert booking["nights"] == 3
    expected_subtotal = room["price_per_night"] * 3
    expected_tax = int(round(expected_subtotal * 0.18))
    expected_total = expected_subtotal + expected_tax

    assert booking["subtotal"] == expected_subtotal
    assert booking["tax"] == expected_tax
    assert booking["total"] == expected_total
    assert booking["status"] == "Confirmed"

    # Verify listing user bookings
    list_resp = authenticated_client.get("/api/bookings")
    assert list_resp.status_code == 200
    assert list_resp.get_json()["count"] >= 1

    # Verify cancel booking
    cancel_resp = authenticated_client.patch(f"/api/bookings/{booking['id']}/cancel")
    assert cancel_resp.status_code == 200
    assert cancel_resp.get_json()["booking"]["status"] == "Cancelled"
