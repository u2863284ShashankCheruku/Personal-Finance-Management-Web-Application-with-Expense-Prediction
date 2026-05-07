import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Secret key used for session security and signing
    SECRET_KEY = os.getenv("SECRET_KEY")

    # Database connection string (PostgreSQL or SQLite)
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")

    # Disable modification tracking to reduce overhead
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT secret used to sign authentication tokens
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")