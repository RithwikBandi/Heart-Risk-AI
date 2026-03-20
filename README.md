<div align="center">

<img src="frontend/public/favicon.svg" width="64" height="64" alt="CardioAI Logo" />

# CardioAI — Cardiovascular Risk Prediction System

**An end-to-end AI-powered clinical decision-support application.**  
Enter 8 health parameters. Receive an instant ML risk classification with SHAP-based explainability.

[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Motor%20async-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Scikit-learn](https://img.shields.io/badge/scikit--learn-1.8-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)](https://scikit-learn.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-Academic-6366F1?style=flat-square)](./LICENSE)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [ML Model — Research & Development](#ml-model--research--development)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1 — Clone the repository](#1--clone-the-repository)
  - [2 — Start MongoDB](#2--start-mongodb)
  - [3 — Backend setup](#3--backend-setup)
  - [4 — Frontend setup](#4--frontend-setup)
  - [5 — Run the full stack](#5--run-the-full-stack)
- [Running Tests](#running-tests)
- [Pages & Routes](#pages--routes)
- [Authentication Flow](#authentication-flow)
- [Dark Mode Implementation](#dark-mode-implementation)
- [Contributing](#contributing)
- [Author](#author)

---

## Overview

**CardioAI** is a full-stack, production-grade AI application for cardiovascular risk assessment. It accepts a patient's clinical inputs (age, BMI, blood pressure, cholesterol, and lifestyle factors) and returns a **Low / Moderate / High** risk classification — backed by a Logistic Regression model trained on 5,500 clinical records, with SHAP explainability surfacing the reasoning behind every prediction.

This project demonstrates a complete **machine learning deployment pipeline** — from raw dataset validation and iterative model experimentation through to a REST API backend, React SaaS frontend, JWT authentication, and MongoDB persistence.

> ⚠️ **Disclaimer:** This system is for educational and research purposes only. It does not constitute medical advice and must not replace professional clinical judgment.

---

## Key Features

### User-Facing
- **Risk Assessment** — 8-input clinical form with client-side + server-side validation
- **Explainable Results** — SHAP-driven key risk factors, health analysis, protective factors, and personalised recommendations
- **Prediction History** — all past assessments stored per-user and viewable in a sortable table
- **Light / Dark Mode** — production-grade theme system using CSS variables + Tailwind `dark:` classes, persisted in `localStorage`
- **Responsive Design** — mobile-first layout, works on all screen sizes

### Platform
- **JWT Authentication** — secure register / login with bcrypt password hashing, 24-hour token expiry
- **Admin Dashboard** — real-time analytics including total predictions, risk distribution (doughnut chart), predictions over time (line chart), and platform averages
- **Admin Login Portal** — isolated `/admin/login` route with admin-only access enforcement
- **Case Study Page** — full research writeup with interactive model comparison, SHAP/LIME explainability section, decision timeline, and system design
- **Resources Page** — all research notebooks, dataset links, and source code references

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + Vite 8 | SPA framework with HMR dev server |
| **Styling** | Tailwind CSS 3.4 | Utility-first styling, dark mode via `class` strategy |
| **Routing** | React Router DOM 7 | Client-side routing with protected routes |
| **Charts** | Chart.js 4 | Admin dashboard analytics visualisations |
| **Backend** | FastAPI 0.135 | High-performance async REST API |
| **ASGI Server** | Uvicorn | Production-ready ASGI server |
| **Database** | MongoDB + Motor 3 | Async NoSQL persistence for users, predictions, logs |
| **Auth** | python-jose (JWT) + bcrypt | Stateless JWT auth with bcrypt hashing |
| **ML Framework** | Scikit-learn 1.8 | Model training, preprocessing, serialisation |
| **Explainability** | SHAP 0.51 | Global/local feature importance for predictions |
| **Validation** | Pydantic 2 | Request schema validation and serialisation |
| **Testing** | PyTest 9 | Backend unit and API validation tests |
| **Fonts** | Sora + DM Sans (Google) | Display + body font pairing |

---

## System Architecture

```
┌──────────────────────────────────────────────────────┐
│                    User Browser                       │
│              React SPA  (Vite + Tailwind)             │
│                                                       │
│  LandingPage  ──►  /register ──► /login              │
│  /app (Dashboard / Predict / History / Profile)      │
│  /case-study  /resources  /admin/login               │
└────────────────────┬─────────────────────────────────┘
                     │  HTTP/JSON  (CORS enabled)
                     ▼
┌──────────────────────────────────────────────────────┐
│                FastAPI Backend                        │
│                                                       │
│  POST /api/auth/register   POST /api/auth/login      │
│  POST /predict             GET  /api/predictions/history │
│  GET  /api/admin/stats                               │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │           Prediction Pipeline                  │  │
│  │  Input ──► Validation ──► Scaler ──► LR Model  │  │
│  │           ──► SHAP Values ──► Explanation     │  │
│  └────────────────────────────────────────────────┘  │
└──────────┬──────────────────────┬────────────────────┘
           │                      │
           ▼                      ▼
┌─────────────────┐   ┌───────────────────────────┐
│    MongoDB       │   │   ML Model Files           │
│                 │   │                           │
│  users          │   │  model/heart_risk_model.pkl│
│  predictions    │   │  model/scaler.pkl          │
│  model_logs     │   │  (Logistic Regression)     │
└─────────────────┘   └───────────────────────────┘
```

---

## Project Structure

```
Heart Risk AI/
│
├── backend/                        # FastAPI application
│   ├── main.py                     # App factory, CORS, startup/shutdown, /predict endpoint
│   ├── auth.py                     # JWT creation, Bearer dependency, optional auth
│   ├── db.py                       # Motor async MongoDB client (connect/disconnect/get)
│   ├── validation.py               # Server-side input bounds validation (medical limits)
│   ├── model_loader.py             # Load .pkl model + scaler, run inference + SHAP
│   ├── explain.py                  # SHAP → human-readable factors, analysis, recommendations
│   │
│   ├── models/                     # MongoDB document helpers (pure async functions)
│   │   ├── user.py                 # create_user(), authenticate_user()
│   │   ├── prediction.py           # save_prediction()
│   │   └── model_log.py            # log_model_inference()
│   │
│   ├── routes_auth.py              # POST /api/auth/register, POST /api/auth/login
│   ├── routes_predictions.py       # GET  /api/predictions/history
│   ├── routes_admin.py             # GET  /api/admin/stats  (admin-only)
│   │
│   ├── tests/
│   │   ├── test_validation.py      # Unit tests for validation.py bounds logic
│   │   └── test_api_validation.py  # Integration tests for /predict endpoint
│   │
│   └── requirements.txt            # Python dependencies (pinned versions)
│
├── frontend/                       # React + Vite SPA
│   ├── index.html                  # HTML entrypoint
│   ├── vite.config.js              # Vite config (allowedHosts: true for ngrok)
│   ├── tailwind.config.js          # Tailwind: darkMode: "class", custom fonts/colours
│   ├── postcss.config.js
│   ├── package.json
│   │
│   ├── public/
│   │   ├── favicon.svg             # Blue gradient heart icon
│   │   └── icons.svg
│   │
│   └── src/
│       ├── main.jsx                # React root + BrowserRouter
│       ├── App.jsx                 # Route definitions (public + protected)
│       ├── api.js                  # apiFetch() — centralised fetch wrapper with JWT header
│       ├── index.css               # Design system: CSS variables, dark tokens, component classes
│       ├── App.css
│       │
│       ├── hooks/
│       │   └── useTheme.js         # Dark mode hook: localStorage persistence, html.dark class
│       │
│       ├── components/
│       │   ├── AppLayout.jsx       # Authenticated shell: sticky nav, profile, logout, scroll-top
│       │   ├── ProtectedRoute.jsx  # JWT guard — redirects to /login if no token
│       │   └── ThemeToggle.jsx     # Sun/moon toggle button (light-bg / dark-bg variants)
│       │
│       ├── pages/
│       │   ├── LandingPage.jsx     # Public marketing page: hero, features, journey, resources, about
│       │   ├── LoginPage.jsx       # User login form
│       │   ├── RegisterPage.jsx    # User registration with password strength meter
│       │   ├── DashboardPage.jsx   # Authenticated home: stats, quick actions
│       │   ├── PredictionPage.jsx  # 3-group input form, slider controls, animated risk gauge
│       │   ├── HistoryPage.jsx     # Paginated prediction history table
│       │   ├── ProfilePage.jsx     # User info, tips, sign-out confirmation
│       │   ├── AdminDashboard.jsx  # Admin analytics: doughnut + line charts via Chart.js
│       │   ├── AdminLoginPage.jsx  # Isolated admin login (/admin/login) — dark theme
│       │   ├── CaseStudyPage.jsx   # Full research case study: metrics, comparison, XAI, timeline
│       │   └── ResourcesPage.jsx   # Standalone resources page with model comparison bars
│       │
│       └── CustomDropdown.jsx      # Accessible keyboard-navigable select replacement
│ 
├──model/
│     ├── heart_risk_model.pkl        # Trained Logistic Regression model
│     └── scaler.pkl                  # StandardScaler fitted on training data
│ 
└── notebook/
    ├── Dataset_Validation.ipynb            # EDA, missing values, leakage analysis
    ├── Research_Model_Full_Features.ipynb  # Phase 1 — all 5 models on 14 features
    ├── Research_Model_Site_Feature.ipynb   # Phase 2 — same 5 models on 8 site features
    └── Deployment_Model.ipynb              # Final LR model + SHAP + .pkl export

```

---

## ML Model — Research & Development

The ML model was developed through a rigorous, two-phase research process.

### Dataset

| Property | Value |
|----------|-------|
| Source | [Kaggle — Heart Disease Dataset](https://www.kaggle.com/datasets/amirmahdiabbootalebi/heart-disease) |
| Records | 5,500 patients |
| Original features | 16 |
| Target variable | `risk_category` (Low / Medium / High Risk) |
| Class distribution | Low 33.4% · Medium 40.8% · High 25.7% |

**Data cleaning decisions:**
- `patient_id` — removed (non-informative identifier, no predictive value)
- `heart_disease_risk_score` — **removed** (direct target leakage: `risk_category` is derived from this column — including it would produce an invalid model that only works on training data)

### Phase 1 — Full Feature Model (14 features)

| Model | Accuracy | Precision | Recall | F1 Score |
|-------|----------|-----------|--------|----------|
| **Logistic Regression** | **95.09%** | **95.11%** | **95.09%** | **95.10%** |
| Artificial Neural Network | 94.27% | 94.37% | 94.27% | 94.27% |
| XGBoost | 92.55% | 92.58% | 92.55% | 92.56% |
| Gradient Boosting | 91.45% | 91.51% | 91.45% | 91.47% |
| Random Forest | 90.18% | 90.38% | 90.18% | 90.22% |

### Phase 2 — Site Feature Model (8 features, real-world simulation)

Only features collectable via a web form were used:

| Model | Accuracy | Precision | Recall | F1 Score |
|-------|----------|-----------|--------|----------|
| **Logistic Regression** | **94.55%** | **94.54%** | **94.55%** | **94.54%** |
| Artificial Neural Network | 94.27% | 94.29% | 94.27% | 94.28% |
| Gradient Boosting | 93.27% | 93.33% | 93.27% | 93.29% |
| XGBoost | 92.27% | 92.31% | 92.27% | 92.28% |
| Random Forest | 91.54% | 91.60% | 91.54% | 91.56% |

### Final Model Selection

**Logistic Regression** was selected for deployment because:

1. **Highest accuracy** on site features (94.55%) — only 0.54% below the full-feature model
2. **Interpretability** — coefficient-based reasoning compatible with SHAP and LIME
3. **Deployment simplicity** — lightweight, fast inference, minimal overhead
4. **Real-world suitability** — only 8 user-collectable inputs required

ANN was rejected despite comparable accuracy: it is a black-box model requiring complex SHAP integration and is harder to trust in healthcare contexts.

### Research Notebooks

| Notebook | Link |
|----------|------|
| Dataset Validation | [Colab →](https://colab.research.google.com/drive/1MnZ6Q-MATm9FymyJcDxrPxAnfgfAms5g) |
| Full Feature Research | [Colab →](https://colab.research.google.com/drive/1PYu2eG6fNJm5SMuag7_3SZu1m1TWk-Uf) |
| Site Feature Research | [Colab →](https://colab.research.google.com/drive/1sDebUgeDYdjulMOru1E5dnuXFoeG9VRH) |
| Deployment Model | [Colab →](https://colab.research.google.com/drive/1m_ZXY22QOtGOLBPUjvNbqyAiqg2s9FII) |

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | None | Create account. Returns `{ token, user }` |
| `POST` | `/api/auth/login` | None | Login. Returns `{ token, user }` |

**Register / Login request body:**
```json
{
  "name": "Rithwik Reddy",
  "email": "rithwik@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "6601abc...",
    "name": "Rithwik Reddy",
    "email": "rithwik@example.com",
    "isAdmin": false
  }
}
```

---

### Prediction

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/predict` | Optional (JWT) | Run cardiovascular risk prediction |

**Request body:**
```json
{
  "age": 45,
  "bmi": 27.5,
  "systolic_bp": 135,
  "cholesterol_mg_dl": 210,
  "smoking_status": 0,
  "family_history_heart_disease": 1,
  "physical_activity_hours_per_week": 3.5,
  "stress_level": 6
}
```

**Field validation bounds:**

| Field | Type | Min | Max | Values |
|-------|------|-----|-----|--------|
| `age` | float | 18 | 85 | — |
| `bmi` | float | 15.0 | 45.0 | — |
| `systolic_bp` | float | 90 | 200 | — |
| `cholesterol_mg_dl` | float | 120 | 320 | — |
| `smoking_status` | int | — | — | `0` non-smoker · `1` former · `2` current |
| `family_history_heart_disease` | int | — | — | `0` no · `1` yes |
| `physical_activity_hours_per_week` | float | 0.0 | 14.0 | — |
| `stress_level` | int | 1 | 10 | — |

**Response:**
```json
{
  "prediction": "Moderate Risk",
  "key_factors": [
    "Elevated systolic blood pressure (135 mmHg)",
    "Family history of heart disease present"
  ],
  "health_analysis": [
    "BMI indicates overweight range",
    "Cholesterol level is borderline high"
  ],
  "protective_factors": [
    "Non-smoker status is a significant protective factor",
    "Regular physical activity (3.5 hrs/week) is beneficial"
  ],
  "recommended_actions": [
    "Monitor blood pressure regularly and consult a physician",
    "Maintain and increase physical activity levels",
    "Review dietary habits to manage cholesterol"
  ]
}
```

---

### Prediction History

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/predictions/history` | JWT required | Returns last 200 predictions for authenticated user |

---

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/stats` | JWT + `isAdmin: true` | Platform analytics aggregate |

**Response:**
```json
{
  "totalPredictions": 128,
  "lowRiskCount": 43,
  "mediumRiskCount": 52,
  "highRiskCount": 33,
  "averageAge": 48.3,
  "averageCholesterol": 201.7,
  "predictionsOverTime": [
    { "date": "2025-03-18", "count": 12 },
    { "date": "2025-03-19", "count": 24 }
  ]
}
```

---

### Interactive API Docs

FastAPI generates interactive documentation automatically:

- **Swagger UI** → [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc** → [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# ── MongoDB ───────────────────────────────────────────────
MONGO_URI=mongodb://localhost:27017/heart_risk_ai
MONGO_DB_NAME=heart_risk_ai

# ── JWT ───────────────────────────────────────────────────
# Change this to a long random secret in any non-local environment
JWT_SECRET=your-super-secret-key-change-me-in-production
```

> **Security note:** Never commit a real `JWT_SECRET` to version control. Use a minimum 32-character random string in production. Generate one with: `python -c "import secrets; print(secrets.token_hex(32))"`

---

## Getting Started

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.11+ | [python.org](https://python.org) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| MongoDB | 7.0+ | [mongodb.com](https://www.mongodb.com/try/download/community) |
| npm | 9+ | Bundled with Node.js |

---

### 1 — Clone the repository

```bash
git clone https://github.com/RithwikBandi/Heart-Risk-AI.git
cd "heart-risk-ai"
```

---

### 2 — Start MongoDB

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Verify it's running:
brew services list | grep mongodb
```

**Linux (systemd):**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod    # auto-start on boot
sudo systemctl status mongod    # verify
```

**Windows:**
```powershell
# Start via Services or:
net start MongoDB
```

MongoDB will run on `mongodb://localhost:27017` by default — this matches the fallback URI in `backend/db.py`.

---

### 3 — Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Create .env with your secrets
cp .env.example .env    # edit JWT_SECRET
```

**Start the backend server:**
```bash
uvicorn main:app --reload
```

The API will be available at:
- **Base URL** → `http://127.0.0.1:8000`
- **Swagger docs** → `http://127.0.0.1:8000/docs`

---

### 4 — Frontend setup

```bash
# In a new terminal tab
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The React app will be available at `http://localhost:5173`.

---

### 5 — Run the full stack

You need **3 terminal windows** running simultaneously:

| Terminal | Command | URL |
|----------|---------|-----|
| 1 — MongoDB | `brew services start mongodb-community@7.0` | `mongodb://localhost:27017` |
| 2 — Backend | `cd backend && uvicorn main:app --reload` | `http://localhost:8000` |
| 3 — Frontend | `cd frontend && npm run dev` | `http://localhost:5173` |

Open `http://localhost:5173` in your browser. Register an account and start using the app.

---

### Creating an Admin Account

There is no admin registration UI by design. To promote a user to admin, connect to MongoDB directly:

```bash
# Open MongoDB shell
mongosh

# Switch to the app database
use heart_risk_ai

# Promote a user by email
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { isAdmin: true } }
)
```

Admin users can then access the admin dashboard at `/app/admin` or log in via `/admin/login`.

---

## Running Tests

```bash
cd backend

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run a specific test file
pytest tests/test_validation.py -v
pytest tests/test_api_validation.py -v

# Run with coverage (requires pytest-cov)
pip install pytest-cov
pytest --cov=. --cov-report=term-missing
```

Test files:
- `tests/test_validation.py` — unit tests for all input validation bounds (`age`, `bmi`, `bp`, `cholesterol`, `smoking`, etc.)
- `tests/test_api_validation.py` — integration-style tests for the `/predict` endpoint schema

---

## Pages & Routes

### Public routes (no auth required)

| Route | Page | Description |
|-------|------|-------------|
| `/` | `LandingPage` | Marketing page: hero, features, model journey, resources, about |
| `/login` | `LoginPage` | User sign-in form |
| `/register` | `RegisterPage` | User registration with password strength meter |
| `/case-study` | `CaseStudyPage` | Full ML research case study with interactive comparison |
| `/resources` | `ResourcesPage` | Dataset, notebooks, model files |
| `/admin/login` | `AdminLoginPage` | Isolated dark-theme admin portal |

### Protected routes (JWT required)

| Route | Page | Description |
|-------|------|-------------|
| `/app` | `DashboardPage` | Welcome stats, quick action cards |
| `/app/predict` | `PredictionPage` | 3-group input form, sliders, animated risk gauge, SHAP results |
| `/app/history` | `HistoryPage` | Sortable prediction history table with risk badges |
| `/app/profile` | `ProfilePage` | User info, usage tips, sign-out confirmation |
| `/app/admin` | `AdminDashboard` | Analytics: doughnut + line charts, stat cards *(admin only)* |

---

## Authentication Flow

```
User submits /register or /login
        │
        ▼
FastAPI validates body (Pydantic)
        │
        ▼
MongoDB: create_user() or authenticate_user()
  - bcrypt.hashpw() on register
  - bcrypt.checkpw() on login
        │
        ▼
issue_access_token() → JWT (HS256, 24hr expiry)
  payload: { sub: userId, email, isAdmin }
        │
        ▼
Response: { token, user }
        │
        ▼
Frontend: localStorage.setItem("token", ...)
          localStorage.setItem("user", ...)
        │
        ▼
Subsequent requests: Authorization: Bearer <token>
        │
        ▼
get_current_user() / get_current_user_optional()
  → decode JWT → lookup user in MongoDB
```

**Token storage:** JWT is stored in `localStorage`. The `ProtectedRoute` component checks for its presence on every route render and redirects to `/login` if missing.

---

## Dark Mode Implementation

CardioAI uses a **class-based** dark mode strategy (Tailwind `darkMode: "class"`).

**How it works:**

1. `useTheme()` hook (`src/hooks/useTheme.js`) reads `localStorage.getItem("theme")` on mount
2. Applies or removes the `dark` class on `document.documentElement` (`<html>`)
3. Persists preference to `localStorage` on every toggle
4. All pages that use dark mode call `useTheme()` to keep the class active during navigation

**Design tokens** (`src/index.css`):
```css
:root {
  --bg-page: #f8fafc;   /* light page background */
  --surface: #ffffff;   /* card / input background */
  --text-primary: #0f172a;
}

.dark {
  --bg-page: #0a0f1e;   /* deep space navy */
  --surface: #141c2e;   /* elevated card */
  --text-primary: #f0f4ff;
}
```

**ThemeToggle** (`src/components/ThemeToggle.jsx`) accepts `theme` + `onToggle` props and renders a sun (light) or moon (dark) icon button. It supports two visual variants: `light-bg` for white navbars and `dark-bg` for dark hero sections.

---

## Contributing

This project was developed as a top-tier web application. Contributions, suggestions, and feedback are welcome.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: describe your change"
git push origin feature/your-feature-name
# Open a Pull Request
```

**Code style:**
- Backend: follow PEP 8, use type hints, keep routes thin (logic in models/)
- Frontend: functional components only, no class components, Tailwind utilities preferred over inline styles

---

## Author

**Rithwik Bandi (Ricky)**  
Computer Science Student

- GitHub: [@RithwikBandi](https://github.com/RithwikBandi)

---

<div align="center">

**CardioAI** · Heart Risk Prediction · Built with ❤️ by Rithwik (Ricky)

*For educational and research purposes only. Not a substitute for professional medical advice.*

</div>
