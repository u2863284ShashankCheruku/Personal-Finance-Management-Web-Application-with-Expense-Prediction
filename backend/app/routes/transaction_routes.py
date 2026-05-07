from flask import Blueprint, request, jsonify
from ..models.transaction_model import Transaction
from ..extensions import db
from flask_jwt_extended import get_jwt_identity
from ..utils.decorators import jwt_required_custom
from datetime import datetime

transaction_bp = Blueprint('transactions', __name__)

@transaction_bp.route('/', methods=['POST'])
@jwt_required_custom
def add_transaction():
    data = request.get_json()
    user_id = int(get_jwt_identity())

    # Validate required fields
    required_fields = ['amount', 'category', 'type', 'date']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    # Validate date format
    try:
        date = datetime.strptime(data['date'], "%Y-%m-%d")
    except:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    # Create transaction
    transaction = Transaction(
        user_id=user_id,
        amount=float(data['amount']),
        category=data['category'],
        type=data['type'],
        date=date
    )

    db.session.add(transaction)
    db.session.commit()

    return jsonify({"msg": "Transaction added"}), 201


@transaction_bp.route('/', methods=['GET'])
@jwt_required_custom
def get_transactions():
    user_id = int(get_jwt_identity())

    transactions = Transaction.query.filter_by(user_id=user_id).all()

    return jsonify([
        {
            "id": t.id,
            "amount": t.amount,
            "category": t.category,
            "type": t.type,
            "date": t.date.strftime("%Y-%m-%d")  #  clean format
        } for t in transactions
    ])


@transaction_bp.route('/<int:transaction_id>', methods=['PUT'])
@jwt_required_custom
def update_transaction(transaction_id):
    user_id = int(get_jwt_identity())
    
    # Find the transaction
    transaction = Transaction.query.filter_by(
        id=transaction_id,
        user_id=user_id
    ).first()
    
    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404
    
    data = request.get_json()
    
    # Update fields if provided
    if 'amount' in data:
        transaction.amount = float(data['amount'])
    
    if 'category' in data:
        transaction.category = data['category']
    
    if 'type' in data:
        transaction.type = data['type']
    
    if 'date' in data:
        try:
            transaction.date = datetime.strptime(data['date'], "%Y-%m-%d")
        except:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    db.session.commit()
    
    return jsonify({"msg": "Transaction updated"}), 200


@transaction_bp.route('/<int:transaction_id>', methods=['DELETE'])
@jwt_required_custom
def delete_transaction(transaction_id):
    user_id = int(get_jwt_identity())
    
    # Find the transaction
    transaction = Transaction.query.filter_by(
        id=transaction_id,
        user_id=user_id
    ).first()
    
    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404
    
    db.session.delete(transaction)
    db.session.commit()
    
    return jsonify({"msg": "Transaction deleted"}), 200