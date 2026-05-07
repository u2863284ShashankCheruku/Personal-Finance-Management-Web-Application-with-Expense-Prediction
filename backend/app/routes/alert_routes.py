from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity
from ..utils.decorators import jwt_required_custom
from ..models.transaction_model import Transaction
from ..models.budget_model import Budget
from ..services.prediction_service import predict_expenses

alert_bp = Blueprint('alerts', __name__)

@alert_bp.route('/', methods=['GET'])
@jwt_required_custom
def get_alerts():
    user_id = int(get_jwt_identity())

    # Get user transactions
    transactions = Transaction.query.filter_by(user_id=user_id).all()

    data = [
        {"amount": float(t.amount), "date": t.date}
        for t in transactions if t.type == "expense"
    ]

    # Get predictions
    predictions = predict_expenses(data)

    # Get budget
    budget = Budget.query.filter_by(user_id=user_id).first()

    if not budget:
        return jsonify({"message": "No budget set", "alerts": []})

    alerts = []

    # Compare predictions with budget
    for i, p in enumerate(predictions):
        if p > budget.monthly_limit:
            alerts.append({
                "month_index": i + 1,
                "predicted": p,
                "budget": budget.monthly_limit,
                "warning": "You may exceed your budget"
            })

    return jsonify({
        "alerts": alerts,
        "predictions": predictions
    })