from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token

from models.user import db, User


auth_bp = Blueprint("auth", __name__)


# =========================
# REGISTER
# =========================

@auth_bp.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({
            "message": "Name, email and password are required"
        }), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({
            "message": "Email already registered"
        }), 409

    hashed_password = generate_password_hash(password)

    new_user = User(
        name=name,
        email=email,
        password=hashed_password,
        bio=data.get("bio")
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "bio": new_user.bio
        }
    }), 201


# =========================
# LOGIN
# =========================

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "message": "Email and password are required"
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({
            "message": "Invalid email or password"
        }), 401

    if not check_password_hash(user.password, password):
        return jsonify({
            "message": "Invalid email or password"
        }), 401
    
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
    "message": "Login successful",
    "access_token": access_token,
    "user": {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "bio": user.bio
    }
}), 200

# =========================
# UPDATE PROFILE
# =========================

@auth_bp.route("/profile/<int:user_id>", methods=["PUT"])
def update_profile(user_id):

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    name = data.get("name")
    bio = data.get("bio")

    if not name:
        return jsonify({
            "message": "Name is required"
        }), 400

    user.name = name
    user.bio = bio

    db.session.commit()

    return jsonify({
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "bio": user.bio
        }
    }), 200