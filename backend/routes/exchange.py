from flask import Blueprint, request, jsonify

from models.exchange_request import ExchangeRequest
from models.user import db, User
from models.skill import Skill

exchange_bp = Blueprint("exchange", __name__)


exchange_bp = Blueprint("exchange", __name__)


# =========================
# CREATE EXCHANGE REQUEST
# =========================

# =========================
# GET RECEIVED EXCHANGE REQUESTS
# =========================

@exchange_bp.route("/requests/received/<int:user_id>", methods=["GET"])
def get_received_requests(user_id):

    requests = ExchangeRequest.query.filter_by(
        receiver_id=user_id
    ).all()

    result = []

    for req in requests:

        sender = User.query.get(req.sender_id)

        if sender:
            result.append({
                "request_id": req.id,
                "sender_id": sender.id,
                "sender_name": sender.name,
                "skill": req.skill,
                "status": req.status
            })

    return jsonify({
        "user_id": user_id,
        "requests": result
    }), 200

@exchange_bp.route("/requests", methods=["POST"])
def create_request():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    sender_id = data.get("sender_id")
    receiver_id = data.get("receiver_id")
    skill = data.get("skill")

    if not sender_id or not receiver_id or not skill:
        return jsonify({
            "message": "sender_id, receiver_id and skill are required"
        }), 400

    if sender_id == receiver_id:
        return jsonify({
            "message": "You cannot send a request to yourself"
        }), 400

    sender = User.query.get(sender_id)
    receiver = User.query.get(receiver_id)

    if not sender:
        return jsonify({
            "message": "Sender not found"
        }), 404

    if not receiver:
        return jsonify({
            "message": "Receiver not found"
        }), 404

        # Prevent duplicate pending requests
    existing_request = ExchangeRequest.query.filter_by(
        sender_id=sender_id,
        receiver_id=receiver_id,
        skill=skill,
        status="pending"
    ).first()

    if existing_request:
        return jsonify({
            "message": "You already have a pending request for this skill"
        }), 400

    new_request = ExchangeRequest(
        sender_id=sender_id,
        receiver_id=receiver_id,
        skill=skill,
        status="pending"
    )

    db.session.add(new_request)
    db.session.commit()

    return jsonify({
        "message": "Exchange request sent successfully",
        "request": {
            "id": new_request.id,
            "sender_id": new_request.sender_id,
            "receiver_id": new_request.receiver_id,
            "skill": new_request.skill,
            "status": new_request.status
        }
    }), 201
# =========================
# UPDATE EXCHANGE REQUEST
# =========================

@exchange_bp.route("/requests/<int:request_id>", methods=["PUT"])
def update_request(request_id):

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    status = data.get("status")

    if status not in ["accepted", "rejected"]:
        return jsonify({
            "message": "Status must be accepted or rejected"
        }), 400

    exchange_request = ExchangeRequest.query.get(request_id)

    if not exchange_request:
        return jsonify({
            "message": "Exchange request not found"
        }), 404

    if exchange_request.status != "pending":
        return jsonify({
            "message": "Request has already been processed"
        }), 400

    exchange_request.status = status

    db.session.commit()

    return jsonify({
        "message": f"Exchange request {status} successfully",
        "request": {
            "id": exchange_request.id,
            "sender_id": exchange_request.sender_id,
            "receiver_id": exchange_request.receiver_id,
            "skill": exchange_request.skill,
            "status": exchange_request.status
        }
    }), 200
# =========================
# GET SENT EXCHANGE REQUESTS
# =========================

@exchange_bp.route("/requests/sent/<int:user_id>", methods=["GET"])
def get_sent_requests(user_id):

    requests = ExchangeRequest.query.filter_by(
        sender_id=user_id
    ).all()

    result = []

    for req in requests:

        receiver = User.query.get(req.receiver_id)

        if receiver:
            result.append({
                "request_id": req.id,
                "receiver_id": receiver.id,
                "receiver_name": receiver.name,
                "skill": req.skill,
                "status": req.status
            })

    return jsonify({
        "user_id": user_id,
        "requests": result
    }), 200

# =========================
# GET MY CONNECTIONS
# =========================

@exchange_bp.route("/connections/<int:user_id>", methods=["GET"])
def get_connections(user_id):

    requests = ExchangeRequest.query.filter(
        (
            (ExchangeRequest.sender_id == user_id) |
            (ExchangeRequest.receiver_id == user_id)
        ),
        ExchangeRequest.status == "accepted"
    ).all()

    connections = []

    seen_users = set()

    for exchange in requests:

        if exchange.sender_id == user_id:
            connection_id = exchange.receiver_id
        else:
            connection_id = exchange.sender_id

        connection_user = User.query.get(connection_id)

        if not connection_user:
            continue

        if connection_id in seen_users:
            continue

        seen_users.add(connection_id)

        teach_skills = Skill.query.filter_by(
            user_id=connection_user.id,
            type="teach"
        ).all()

        learn_skills = Skill.query.filter_by(
            user_id=connection_user.id,
            type="learn"
        ).all()

        connections.append({
            "user_id": connection_user.id,
            "name": connection_user.name,
            "email": connection_user.email,
            "bio": connection_user.bio,
            "teach": [skill.name for skill in teach_skills],
            "learn": [skill.name for skill in learn_skills]
        })

    return jsonify({
        "connections": connections
    }), 200