# SkillSwap – Learn, Teach, Connect

SkillSwap is a Python full-stack skill exchange platform that connects people who want to learn new skills with people who are willing to teach them.

Users can create accounts, add skills they can teach, select skills they want to learn, discover matching users, send exchange requests, and communicate with accepted connections.

## Features

- User registration and login
- User profile management
- Add and manage teaching and learning skills
- Skill-based user matching
- Send and manage skill exchange requests
- Accept and manage connections
- Private messaging between accepted connections
- JWT-based authentication
- Protected messaging APIs
- Message persistence using a database

## Technology Stack

**Frontend**
- HTML
- CSS
- JavaScript

**Backend**
- Python
- Flask
- Flask REST APIs
- Flask-JWT-Extended

**Database**
- SQLite
- SQLAlchemy

**Tools**
- Visual Studio Code
- Git
- GitHub

## Project Structure

```text
SkillSwap/
│
├── backend/
│   ├── models/
│   │   ├── user.py
│   │   ├── skill.py
│   │   ├── message.py
│   │   └── exchange_request.py
│   │
│   ├── routes/
│   │   ├── auth.py
│   │   ├── skill.py
│   │   ├── exchange.py
│   │   └── messages.py
│   │
│   └── app.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── .gitignore
└── README.MD
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/balaratnakar66-prog/SkillSwap.git
cd SkillSwap
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install Flask Flask-Cors Flask-SQLAlchemy Flask-JWT-Extended python-dotenv
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
JWT_SECRET_KEY=your_secure_random_secret
```

Use your own secure secret key. Never upload your `.env` file to GitHub.

### 5. Start the backend

```bash
python backend/app.py
```

Backend address:

`http://127.0.0.1:5000`

### 6. Start the frontend

Open another terminal in the project folder:

```bash
python -m http.server 5501 --directory frontend
```

Open the application:

`http://127.0.0.1:5501`

## Security

- JWT authentication for protected messaging endpoints
- Server-side sender identity derived from the authenticated token
- Authorization checks for private conversations
- Messaging restricted to accepted connections
- Logout clears stored authentication information
- Environment-based JWT secret configuration

## Future Improvements

- AI-powered skill recommendations
- Real-time messaging
- Notifications for exchange requests
- Cloud database integration
- Production deployment

## Project Status

Core application features and the planned authentication and messaging security checks have been implemented and tested. Production deployment is pending.

## Author

**Balaratnakar Bellapu**

GitHub: [balaratnakar66-prog](https://github.com/balaratnakar66-prog)

---

*SkillSwap – Share Your Skills, Grow Together.*