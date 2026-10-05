"""Flask Application Factory for JAS Hotel."""

import logging
import os
from typing import Type
from flask import Flask
from app.config import Config, config_by_name
from app.db.client import init_db
from app.db.indexes import create_indexes
from app.errors import register_error_handlers
from app.extensions import cors
from app.middleware import register_middleware

# Configure standard logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def create_app(config_class: Type[Config] | None = None) -> Flask:
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)

    # Determine configuration environment
    if config_class is None:
        env_name = os.getenv("FLASK_ENV", "development").lower()
        config_class = config_by_name.get(env_name, config_by_name["development"])

    app.config.from_object(config_class)

    # Initialize CORS with credentials and specific origin
    cors_origins = [app.config.get("FRONTEND_ORIGIN", "http://localhost:5173")]
    cors.init_app(
        app,
        origins=cors_origins,
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "Accept"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    )

    # Initialize Database connection (skip if testing with mongomock or already initialized)
    if not app.config.get("TESTING"):
        try:
            db = init_db(
                uri=app.config["MONGODB_URI"],
                db_name=app.config["MONGODB_DB"],
            )
            # Create indexes on startup
            create_indexes(db)
            logger.info("Connected to MongoDB database: %s", app.config["MONGODB_DB"])
        except Exception as exc:
            logger.warning(
                "MongoDB connection deferred or unreachable on initial boot: %s. "
                "Ensure mongod is running on %s",
                exc,
                app.config["MONGODB_URI"],
            )

    # Register error handlers and middleware
    register_error_handlers(app)
    register_middleware(app)

    # Register Blueprints
    from app.blueprints.auth.routes import auth_bp
    from app.blueprints.menu.routes import menu_bp
    from app.blueprints.orders.routes import orders_bp
    from app.blueprints.rooms.routes import rooms_bp
    from app.blueprints.payments.routes import payments_bp
    from app.blueprints.health import health_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(menu_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(rooms_bp)
    app.register_blueprint(payments_bp)
    app.register_blueprint(health_bp)

    logger.info("JAS Hotel Flask application factory initialized.")
    return app
