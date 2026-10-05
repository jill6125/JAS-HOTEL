"""Centralized MongoDB client management for JAS Hotel."""

import logging
from pymongo import MongoClient
from pymongo.database import Database

logger = logging.getLogger(__name__)

_mongo_client: MongoClient | None = None
_database: Database | None = None


def init_db(uri: str, db_name: str) -> Database:
    """Initialize and return a persistent MongoClient connection and database instance."""
    global _mongo_client, _database
    if _mongo_client is None:
        logger.info("Initializing MongoClient connection to %s", uri)
        _mongo_client = MongoClient(
            uri,
            serverSelectionTimeoutMS=4000,
            connectTimeoutMS=4000,
            maxPoolSize=50,
            minPoolSize=5,
        )
    _database = _mongo_client[db_name]
    return _database


def get_db() -> Database:
    """Retrieve the initialized MongoDB database instance."""
    global _database
    if _database is None:
        raise RuntimeError("Database has not been initialized. Call init_db() first.")
    return _database


def get_client() -> MongoClient:
    """Retrieve the raw MongoClient instance."""
    global _mongo_client
    if _mongo_client is None:
        raise RuntimeError("MongoClient has not been initialized.")
    return _mongo_client


def close_db() -> None:
    """Close the active MongoClient connection."""
    global _mongo_client, _database
    if _mongo_client is not None:
        _mongo_client.close()
        _mongo_client = None
        _database = None
        logger.info("MongoClient connection closed.")
