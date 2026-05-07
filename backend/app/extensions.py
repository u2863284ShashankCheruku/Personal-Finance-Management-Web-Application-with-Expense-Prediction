from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS

# ORM for database operations
db = SQLAlchemy()

# Handles DB migrations (schema version control)
migrate = Migrate()

# JWT manager for authentication
jwt = JWTManager()

# Password hashing utility
bcrypt = Bcrypt()

# Enables cross-origin requests (frontend-backend communication)
cors = CORS()