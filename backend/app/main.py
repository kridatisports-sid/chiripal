"""Squash Excellence Program - Main FastAPI Application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .models import Base, engine
from .routers import tournaments, athletes, finance, stakeholders, marketing, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown

app = FastAPI(
    title="Squash Excellence CRM",
    description="Complete tournament, athlete, finance, and stakeholder management for the Squash Excellence Program",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(auth.router, prefix="/api/v1")
app.include_router(tournaments.router, prefix="/api/v1")
app.include_router(athletes.router, prefix="/api/v1")
app.include_router(finance.router, prefix="/api/v1")
app.include_router(stakeholders.router, prefix="/api/v1")
app.include_router(marketing.router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "message": "Squash Excellence CRM API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/v1/auth",
            "tournaments": "/api/v1/tournaments",
            "athletes": "/api/v1/athletes",
            "finance": "/api/v1/finance",
            "stakeholders": "/api/v1/stakeholders",
            "marketing": "/api/v1/marketing"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": __import__("datetime").datetime.now().isoformat()}

@app.on_event("startup")
async def startup():
    init_db()
