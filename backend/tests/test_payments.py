"""Payment tests covering Razorpay config, order creation, and verification."""

import pytest
from bson import ObjectId


def test_payment_config(client):
    """Test public endpoint retrieving payment configuration."""
    resp = client.get("/api/payments/config")
    assert resp.status_code == 200
    data = resp.get_json()
    assert "key_id" in data
    assert data["currency"] == "INR"


def test_payment_create_order_unauthenticated(client):
    """Test creating payment order without auth returns 401."""
    client.post("/api/auth/logout")
    resp = client.post("/api/payments/create-order", json={
        "reference_id": str(ObjectId()),
        "type": "dining_order",
    })
    assert resp.status_code == 401


def test_payment_create_and_verify_dining_order(authenticated_client, mock_db):
    """Test generating a Razorpay test order for a dining order and verifying payment."""
    # 1. Place a dining order
    menu_resp = authenticated_client.get("/api/menu")
    item = menu_resp.get_json()["items"][0]

    order_resp = authenticated_client.post("/api/orders", json={
        "order_type": "room_service",
        "room_number": "601",
        "items": [{"menu_item_id": item["id"], "quantity": 1}],
    })
    order_id = order_resp.get_json()["order"]["id"]

    # 2. Create Razorpay Payment Order
    pay_order_resp = authenticated_client.post("/api/payments/create-order", json={
        "reference_id": order_id,
        "type": "dining_order",
    })
    assert pay_order_resp.status_code == 200
    pay_data = pay_order_resp.get_json()
    assert "razorpay_order_id" in pay_data
    assert pay_data["amount"] > 0

    # 3. Verify Payment
    verify_resp = authenticated_client.post("/api/payments/verify", json={
        "reference_id": order_id,
        "type": "dining_order",
        "razorpay_order_id": pay_data["razorpay_order_id"],
        "razorpay_payment_id": "pay_test_123456789",
        "razorpay_signature": "sig_test_dummy",
    })
    assert verify_resp.status_code == 200
    verify_data = verify_resp.get_json()
    assert verify_data["payment_status"] == "Paid"
    assert verify_data["transaction_id"] == "pay_test_123456789"

    # 4. Check order updated
    order_check = authenticated_client.get(f"/api/orders/{order_id}")
    assert order_check.get_json()["order"]["payment_status"] == "Paid"
