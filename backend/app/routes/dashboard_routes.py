from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity
from ..utils.decorators import jwt_required_custom
from ..models.transaction_model import Transaction
from collections import defaultdict

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/summary', methods=['GET'])
@jwt_required_custom
def get_summary():
    user_id = int(get_jwt_identity())

    transactions = Transaction.query.filter_by(user_id=user_id).all()

    total_expense = 0
    category_data = defaultdict(float)
    monthly_data = defaultdict(float)

    for t in transactions:
        if t.type == "expense":
            total_expense += t.amount
            category_data[t.category] += t.amount

            key = f"{t.date.year}-{t.date.month}"
            monthly_data[key] += t.amount

    return jsonify({
        "total_expense": total_expense,
        "categories": category_data,
        "monthly_trend": monthly_data
    })