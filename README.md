# FinTrack Pro — Personal Finance Manager with Expense Prediction

A full-stack personal finance app to log income/expenses, set monthly budgets, view analytics, and receive 3-month expense forecasts with proactive budget alerts.

## Features
- User registration and JWT authentication
- Add / edit / delete transactions (income & expense)
- Monthly budget management and usage tracking
- Dashboard: total expense, category breakdown, monthly trend
- ML-based 3-month expense predictions and budget alerts
- Responsive React + TypeScript frontend

## Tech Stack
- Backend: Python, Flask, Flask-JWT-Extended, SQLAlchemy
- ML: pandas, scikit-learn (linear regression)
- Frontend: React, TypeScript, Vite, Tailwind CSS, Recharts
- Database: PostgreSQL (recommended) or SQLite for quick local tests

## Quickstart (development)

Prerequisites:
- Python 3.9+
- Node.js 18+ (npm)
- PostgreSQL (optional for production)

1) Backend (Windows PowerShell)
```powershell
# create and activate venv (one-time)
python -m venv backend\venv
backend\venv\Scripts\Activate.ps1

# install python dependencies
pip install -r backend\requirements.txt

# create a local env file (do NOT commit - keep it private)
# create backend\.env with these keys:
# SECRET_KEY=your_secret_key
# DATABASE_URL=sqlite:///dev.db          # or your postgres url
# JWT_SECRET_KEY=your_jwt_secret
```

2) Run backend
```powershell
# with venv active
python backend\run.py
# Flask app listens on http://127.0.0.1:5000 by default
```

3) Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend runs with Vite on http://localhost:3000 (see console)
```

## Environment files
- Keep real secrets only in `backend/.env` (ignored by git).
- Add safe examples to `backend/.env.example` and `frontend/.env.example`.

Example `backend/.env` (local only):
```
SECRET_KEY=replace_with_a_random_string
DATABASE_URL=sqlite:///dev.db
JWT_SECRET_KEY=replace_with_random_jwt_secret
```

## API (high level)
- `POST /api/auth/register` — { name, email, password }
- `POST /api/auth/login` — { email, password } → returns `access_token`
- `GET/POST /api/transactions/` — auth required; add/list transactions
- `PUT/DELETE /api/transactions/<id>` — update/delete user's transaction
- `GET/ api/budget/` & `POST /api/budget/` — get/set monthly limit
- `GET /api/predict/` — returns next 3 months expense predictions
- `GET /api/alerts/` — returns alerts comparing predictions vs budget
- `GET /api/dashboard/summary` — totals, categories, monthly trend

Sample curl (replace TOKEN):
```bash
curl -H "Authorization: Bearer TOKEN" http://127.0.0.1:5000/api/predict/
```

## Notes & Best Practices
- `backend/.env` must never be committed. `.gitignore` already excludes it.
- If you ever commit secrets, rotate them immediately and remove them from history.
- Use PostgreSQL for production and run migrations with Flask-Migrate.
- Add tests and CI before sharing publicly if required.

## How to contribute / run locally
1. Fork / clone the repo
2. Create a branch: `git checkout -b feat/your-feature`
3. Make changes, run tests, open a PR


