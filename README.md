# 🏸 Squash Excellence CRM

A complete, production-ready CRM and Dashboard system for managing the Squash Excellence Program — tournaments, athletes, finances, stakeholders, and marketing coordination.

## 📋 Features

### 5 Core Modules
- **🏆 Tournaments & Events** — SRFI tournament lifecycle, camp management, clinic coordination
- **👤 Athletes (Champions Program)** — Sponsored athlete tracking, rankings, jersey compliance, contract management
- **💰 Finance** — Budget tracking, burn rate analysis, transaction logging, variance reporting
- **🤝 Stakeholders** — Association relations, MOU tracking, touchpoint logging, follow-up management
- **📸 Marketing** — Content asset library, social media calendar, Akash coordination

### Dashboard for Ronak
- Real-time budget burn visualization
- Tournament risk indicators (Green/Amber/Red)
- Upcoming 6-month calendar
- Pending stakeholder follow-ups
- Content pipeline status

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Clone & Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Run Backend
```bash
python run.py
# API runs at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### 3. Seed Demo Data
```bash
python seed_data.py
```

### 4. Setup Frontend
```bash
cd ../frontend
npm install
```

### 5. Run Frontend
```bash
npm run dev
# Dashboard at http://localhost:3000
```

### 6. Login
- **Email:** `admin@squash-excellence.com`
- **Password:** `squash2026`

## 🏗️ Architecture

```
squash-excellence-crm/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── routers/         # FastAPI endpoints
│   │   └── main.py          # App entry point
│   ├── requirements.txt
│   ├── run.py
│   └── seed_data.py
├── frontend/
│   ├── src/
│   │   ├── pages/           # Route pages
│   │   ├── components/      # Reusable components
│   │   ├── api.js           # API client
│   │   └── AuthContext.jsx  # Auth state
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔧 Configuration

### Environment Variables
Create `.env` files as needed:

**Backend** (`backend/.env`):
```
DATABASE_URL=sqlite:///./squash_excellence.db
# For PostgreSQL: postgresql://user:pass@localhost/squash_db
```

**Frontend** (`frontend/.env`):
```
VITE_API_URL=http://localhost:8000/api/v1
```

## 📊 API Endpoints

| Module | Endpoint | Description |
|--------|----------|-------------|
| Auth | `POST /api/v1/auth/login` | JWT authentication |
| Auth | `POST /api/v1/auth/seed` | Create default user |
| Tournaments | `GET /api/v1/tournaments/` | List all events |
| Tournaments | `GET /api/v1/tournaments/dashboard/stats` | Dashboard stats |
| Tournaments | `GET /api/v1/tournaments/calendar/upcoming` | 6-month calendar |
| Athletes | `GET /api/v1/athletes/` | List athletes |
| Athletes | `GET /api/v1/athletes/dashboard/stats` | Program stats |
| Finance | `GET /api/v1/finance/dashboard/stats` | Financial health |
| Finance | `GET /api/v1/finance/budgets/current` | Current budget |
| Stakeholders | `GET /api/v1/stakeholders/` | List partners |
| Stakeholders | `GET /api/v1/stakeholders/touchpoints/follow-ups` | Pending actions |
| Marketing | `GET /api/v1/marketing/dashboard/stats` | Content pipeline |

## 🔄 Deployment

### Docker (Coming Soon)
```bash
docker-compose up --build
```

### Production Build
```bash
# Frontend
cd frontend
npm run build
# Serve dist/ folder

# Backend
cd backend
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 📱 Mobile Responsive
The dashboard is fully responsive and works on desktop, tablet, and mobile devices.

## 🔐 Security
- JWT-based authentication
- Password hashing with bcrypt
- CORS configured for frontend
- SQLite by default (upgrade to PostgreSQL for production)

## 📝 License
Internal use only — Squash Excellence Program.

---

**Built for:** Ronak & the Squash Excellence Program Team
**Developer:** Program Manager Dashboard
