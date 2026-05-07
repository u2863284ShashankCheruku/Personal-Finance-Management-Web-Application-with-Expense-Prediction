from ..extensions import db
from datetime import datetime

class Transaction(db.Model):
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)

    # Foreign key linking transaction to user
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False,
        index=True
    )

    # Transaction amount
    amount = db.Column(db.Float, nullable=False)

    # Expense category (food, rent, etc.)
    category = db.Column(db.String(50), nullable=False)

    # Type: income or expense
    type = db.Column(db.String(10), nullable=False)

    # Timestamp of transaction
    date = db.Column(db.DateTime, default=datetime.utcnow, index=True)