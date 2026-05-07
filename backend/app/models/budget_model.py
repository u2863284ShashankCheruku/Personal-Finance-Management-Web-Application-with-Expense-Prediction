from ..extensions import db

class Budget(db.Model):
    __tablename__ = 'budgets'

    id = db.Column(db.Integer, primary_key=True)

    # One-to-one relation with user
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False,
        unique=True  # Ensures one budget per user
    )

    # Monthly spending limit
    monthly_limit = db.Column(db.Float, nullable=False)