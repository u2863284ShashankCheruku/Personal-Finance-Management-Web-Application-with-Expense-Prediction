from flask import Blueprint, request, jsonify
from ..models.budget_model import Budget
from ..extensions import db
from flask_jwt_extended import get_jwt_identity
from ..utils.decorators import jwt_required_custom

budget_bp = Blueprint('budget', __name__)

@budget_bp.route('/', methods=['POST'])
@jwt_required_custom
def set_budget():
    data = request.get_json()
    user_id = int(get_jwt_identity())

    # Check if budget already exists for user
    budget = Budget.query.filter_by(user_id=user_id).first()

    if budget:
        # Update existing budget
        budget.monthly_limit = data['monthly_limit']
    else:
        # Create new budget entry
        budget = Budget(user_id=user_id, monthly_limit=data['monthly_limit'])
        db.session.add(budget)

    db.session.commit()
    return jsonify({"msg": "Budget set"})


@budget_bp.route('/', methods=['GET'])
@jwt_required_custom
def get_budget():
    user_id = int(get_jwt_identity())

    # Fetch user's budget
    budget = Budget.query.filter_by(user_id=user_id).first()

    return jsonify({"budget": budget.monthly_limit if budget else 0})