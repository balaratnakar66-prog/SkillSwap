from flask import Blueprint, request, jsonify

from models.user import db, User
from models.skill import Skill


skill_bp = Blueprint("skill", __name__)


@skill_bp.route("/skills", methods=["POST"])
def add_skill():
    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    name = data.get("name")
    skill_type = data.get("type")
    user_id = data.get("user_id")

    if not name or not skill_type or not user_id:
        return jsonify({
            "message": "Name, type and user_id are required"
        }), 400

    if skill_type not in ["teach", "learn"]:
        return jsonify({
            "message": "Type must be either teach or learn"
        }), 400

    skill = Skill(
        name=name,
        type=skill_type,
        user_id=user_id
    )

    db.session.add(skill)
    db.session.commit()

    return jsonify({
        "message": "Skill added successfully",
        "skill": {
            "id": skill.id,
            "name": skill.name,
            "type": skill.type,
            "user_id": skill.user_id
        }
    }), 201
@skill_bp.route("/skills/<int:user_id>", methods=["GET"])
def get_user_skills(user_id):
    skills = Skill.query.filter_by(user_id=user_id).all()

    teach_skills = []
    learn_skills = []

    for skill in skills:
        if skill.type == "teach":
            teach_skills.append(skill.name)
        elif skill.type == "learn":
            learn_skills.append(skill.name)

    return jsonify({
        "user_id": user_id,
        "teach": teach_skills,
        "learn": learn_skills
    }), 200
@skill_bp.route("/matches/<int:user_id>", methods=["GET"])
def find_matches(user_id):

    # Get the skills this user wants to learn
    learning_skills = Skill.query.filter_by(
        user_id=user_id,
        type="learn"
    ).all()

    if not learning_skills:
        return jsonify({
            "user_id": user_id,
            "matches": []
        }), 200

    # Find the skill names the user wants to learn
    wanted_skills = [skill.name.lower() for skill in learning_skills]

    # Find other users who can teach those skills
    teaching_skills = Skill.query.filter(
        Skill.type == "teach",
        Skill.user_id != user_id
    ).all()
    matches = []
    seen_users = set()

    for skill in teaching_skills:
        if skill.name.lower() in wanted_skills:
            if skill.user_id in seen_users:
                continue

            user = User.query.get(skill.user_id)

            if user:
                seen_users.add(user.id)

                matches.append({
                    "user_id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "teaches": skill.name,
                    "you_want_to_learn": skill.name,
                    "status": "Available"
                })

    return jsonify({
        "user_id": user_id,
        "matches": matches
    }), 200