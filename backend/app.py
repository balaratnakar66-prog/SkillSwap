from flask import Flask
from flask_cors import CORS
from models.user import db
from models.skill import Skill
from routes.auth import auth_bp
from routes.skill import skill_bp
from models.exchange_request import ExchangeRequest
from routes.exchange import exchange_bp
from routes.messages import message_bp
from models.message import Message
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")


if not app.config["JWT_SECRET_KEY"]:
    raise RuntimeError("JWT_SECRET_KEY is missing from the .env file")

jwt = JWTManager(app)
CORS(app)

# Database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///../database/skillswap.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Connect SQLAlchemy to Flask
db.init_app(app)

# Register routes
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(skill_bp, url_prefix="/api")
app.register_blueprint(exchange_bp, url_prefix="/api")
app.register_blueprint(message_bp, url_prefix="/api")

@app.route("/")
def home():
    return "Welcome to SkillSwap!"


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(debug=True)