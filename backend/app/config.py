import os
from datetime import timedelta
from dotenv import load_dotenv

# Load .env file from the backend folder if present
load_dotenv()


class Config:
    """Base application configuration."""

    FLASK_ENV = os.getenv("FLASK_ENV", "production")
    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"
    TESTING = False

    SECRET_KEY = os.getenv("SECRET_KEY", "jas-hotel-default-secret-key-change-me")

    # MongoDB connection
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB = os.getenv("MONGODB_DB", "jas_hotel")

    # CORS configuration
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

    # Session cookie security settings
    SESSION_COOKIE_NAME = "jas_hotel_session"
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "0") == "1"
    SESSION_COOKIE_SAMESITE = os.getenv("SESSION_COOKIE_SAMESITE", "Lax")
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)

    # Tax calculation (18% GST by default for luxury hotel dining & hospitality in India)
    DINING_TAX_RATE = float(os.getenv("DINING_TAX_RATE", "0.18"))
    ROOM_TAX_RATE = float(os.getenv("ROOM_TAX_RATE", "0.18"))

    # Razorpay payment gateway credentials (for upcoming integration)
    RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")


class DevelopmentConfig(Config):
    DEBUG = True
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_SAMESITE = "Lax"


class TestingConfig(Config):
    TESTING = True
    DEBUG = True
    SECRET_KEY = "test-secret-key-jas-hotel"
    MONGODB_DB = "jas_hotel_test"
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_SAMESITE = "Lax"


class ProductionConfig(Config):
    DEBUG = False
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_SAMESITE = "None"  # When frontend and backend are on different domains with HTTPS


config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}
