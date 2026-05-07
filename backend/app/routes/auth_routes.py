from flask import Blueprint, request, jsonify
from ..models.user_model import User
from ..extensions import db
from ..utils.security import hash_password, verify_password
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "User already exists"}), 400

    # Create new user with hashed password
    user = User(
        name=data['name'],
        email=data['email'],
        password=hash_password(data['password'])
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "User created"}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # Fetch user by email
    user = User.query.filter_by(email=data['email']).first()

    # Validate credentials
    if not user or not verify_password(data['password'], user.password):
        return jsonify({"msg": "Invalid credentials"}), 401

    # Generate JWT token with user ID as identity
    token = create_access_token(identity=str(user.id))

    return jsonify({"access_token": token})