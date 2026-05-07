from ..extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'  # Explicit table name for PostgreSQL consistency

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)

    # Unique email ensures no duplicate accounts
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)

    # Store hashed password only
    password = db.Column(db.String(255), nullable=False)

    # Timestamp of account creation
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to transactions (one-to-many)
    transactions = db.relationship(
        'Transaction',
        backref='user',
        lazy=True,
        cascade="all, delete-orphan"
    )

    # Relationship to budget (one-to-one)
    budget = db.relationship(
        'Budget',
        backref='user',
        uselist=False,
        cascade="all, delete-orphan"
    )