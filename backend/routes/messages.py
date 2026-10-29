
from flask import Blueprint, request, jsonify

from models.user import User
from models.message import Message
from models.exchange_request import ExchangeRequest
from models.user import db
from flask_jwt_extended import jwt_required, get_jwt_identity


message_bp = Blueprint("message_bp", __name__)


def are_connected(user_id, other_user_id):
    return ExchangeRequest.query.filter(
        (
            (
                (ExchangeRequest.sender_id == user_id) &
                (ExchangeRequest.receiver_id == other_user_id)
            ) |
            (
                (ExchangeRequest.sender_id == other_user_id) &
                (ExchangeRequest.receiver_id == user_id)
            )
        ),
        ExchangeRequest.status == "accepted"
    ).first() is not None


@message_bp.route("/messages/<int:user_id>/<int:other_user_id>", methods=["GET"])
@jwt_required()
def get_messages(user_id, other_user_id):
    current_user_id = int(get_jwt_identity())

    if current_user_id not in (user_id, other_user_id):
        return jsonify({
            "message": "You are not allowed to access this conversation."
        }), 403
    if user_id == other_user_id:
        return jsonify({"message": "You cannot chat with yourself."}), 400

    if not User.query.get(user_id) or not User.query.get(other_user_id):
        return jsonify({"message": "User not found."}), 404

    if not are_connected(user_id, other_user_id):
        return jsonify({"message": "Messaging is allowed only between accepted connections."}), 403

    messages = Message.query.filter(
        (
            (
                (Message.sender_id == user_id) &
                (Message.receiver_id == other_user_id)
            ) |
            (
                (Message.sender_id == other_user_id) &
                (Message.receiver_id == user_id)
            )
        )
    ).order_by(Message.created_at.asc(), Message.id.asc()).all()

    return jsonify({
        "messages": [
            {
                "id": message.id,
                "sender_id": message.sender_id,
                "receiver_id": message.receiver_id,
                "content": message.content,
                "created_at": message.created_at.isoformat()
            }
            for message in messages
        ]
    }), 200


@message_bp.route("/messages", methods=["POST"])
@jwt_required()
def send_message():
    data = request.get_json(silent=True) or {}

    sender_id = int(get_jwt_identity())
    receiver_id = data.get("receiver_id")
    content = data.get("content", "")

    if not isinstance(sender_id, int) or not isinstance(receiver_id, int):
        return jsonify({"message": "Valid sender and receiver IDs are required."}), 400

    if not isinstance(content, str) or not content.strip():
        return jsonify({"message": "Message cannot be empty."}), 400

    content = content.strip()

    if len(content) > 2000:
        return jsonify({"message": "Message cannot exceed 2000 characters."}), 400

    if sender_id == receiver_id:
        return jsonify({"message": "You cannot message yourself."}), 400

    if not User.query.get(sender_id) or not User.query.get(receiver_id):
        return jsonify({"message": "User not found."}), 404

    if not are_connected(sender_id, receiver_id):
        return jsonify({"message": "Messaging is allowed only between accepted connections."}), 403

    message = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=content
    )

    db.session.add(message)
    db.session.commit()

    return jsonify({
        "message": "Message sent successfully.",
        "data": {
            "id": message.id,
            "sender_id": message.sender_id,
            "receiver_id": message.receiver_id,
            "content": message.content,
            "created_at": message.created_at.isoformat()
        }
    }), 201
