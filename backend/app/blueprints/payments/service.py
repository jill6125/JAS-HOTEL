"""Razorpay payment gateway service for order and room booking checkout and verification."""

import hmac
import hashlib
import logging
from typing import Any
from flask import current_app
from app.errors import AppException

logger = logging.getLogger(__name__)


class RazorpayService:
    """Handles Razorpay order generation and HMAC SHA256 signature verification."""

    @staticmethod
    def get_client():
        """Lazily initialize Razorpay client if credentials exist."""
        key_id = current_app.config.get("RAZORPAY_KEY_ID", "").strip()
        key_secret = current_app.config.get("RAZORPAY_KEY_SECRET", "").strip()

        # Check if actual credentials (not default placeholders) are provided
        if not key_id or not key_secret or "placeholder" in key_id.lower():
            return None, key_id, key_secret

        try:
            import razorpay
            client = razorpay.Client(auth=(key_id, key_secret))
            return client, key_id, key_secret
        except ImportError:
            logger.warning("razorpay package is not installed.")
            return None, key_id, key_secret

    @staticmethod
    def create_payment_order(
        amount_inr: int,
        receipt: str,
        notes: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Create a Razorpay payment order.
        Amount is converted to paise (amount_inr * 100).
        If live/test keys are configured, calls Razorpay API;
        otherwise generates a valid mock test gateway order for smooth local development.
        """
        client, key_id, key_secret = RazorpayService.get_client()
        amount_in_paise = int(amount_inr * 100)

        if client:
            try:
                data = {
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "receipt": receipt[:40],
                    "notes": notes or {},
                    "payment_capture": 1,
                }
                rp_order = client.order.create(data=data)
                return {
                    "razorpay_order_id": rp_order["id"],
                    "amount": rp_order["amount"],
                    "currency": rp_order["currency"],
                    "key_id": key_id,
                    "is_simulated": False,
                }
            except Exception as exc:
                logger.error("Razorpay order creation failed: %s", exc)
                raise AppException(
                    code="PAYMENT_GATEWAY_ERROR",
                    message=f"Failed to initiate payment gateway: {str(exc)}",
                    status_code=502,
                )

        # Fallback / Test Simulator mode when keys are not yet configured in .env
        mock_order_id = f"order_test_{receipt.replace('-', '_')}"
        return {
            "razorpay_order_id": mock_order_id,
            "amount": amount_in_paise,
            "currency": "INR",
            "key_id": key_id or "rzp_test_placeholder",
            "is_simulated": True,
        }

    @staticmethod
    def verify_payment_signature(
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
    ) -> bool:
        """
        Verify the Razorpay payment signature via HMAC SHA256.
        generated_signature = hmac.new(key_secret, order_id + "|" + payment_id, sha256).hexdigest()
        """
        client, key_id, key_secret = RazorpayService.get_client()

        # If simulated test mode
        if not client or "placeholder" in key_id.lower():
            # In test mode without real secrets, accept test payment confirmation
            return True

        # Live verification
        try:
            msg = f"{razorpay_order_id}|{razorpay_payment_id}"
            generated_signature = hmac.new(
                key_secret.encode("utf-8"),
                msg.encode("utf-8"),
                hashlib.sha256,
            ).hexdigest()

            return hmac.compare_digest(generated_signature, razorpay_signature)
        except Exception as exc:
            logger.error("Error during signature verification: %s", exc)
            return False
