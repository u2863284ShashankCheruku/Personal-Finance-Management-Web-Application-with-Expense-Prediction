from flask import Blueprint, jsonify
from ..models.transaction_model import Transaction
from flask_jwt_extended import get_jwt_identity
from ..utils.decorators import jwt_required_custom
from ..services.prediction_service import predict_expenses

prediction_bp = Blueprint('prediction', __name__)

@prediction_bp.route('/', methods=['GET'])
@jwt_required_custom
def predict():
    user_id = int(get_jwt_identity())

    # Fetch user transactions
    transactions = Transaction.query.filter_by(user_id=user_id).all()

    # Filter only expense transactions and prepare data
    # data = [
    #     {"amount": t.amount, "date": t.date}
    #     for t in transactions if t.type == "expense"
    # ]
    data = [
    {"amount": float(t.amount), "date": str(t.date)}
    for t in transactions if t.type == "expense"
    ]

    # Call ML service
    predictions = predict_expenses(data)

    return jsonify({"predictions": predictions})