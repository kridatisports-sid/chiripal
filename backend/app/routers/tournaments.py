"""Tournament management API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import datetime, timedelta

from ..models import get_db
from ..models.tournament import Tournament
from ..schemas.tournament import (
    TournamentCreate, TournamentUpdate, TournamentResponse, 
    TournamentList, TournamentDashboardStats
)

router = APIRouter(prefix="/tournaments", tags=["Tournaments"])

@router.post("/", response_model=TournamentResponse)
def create_tournament(tournament: TournamentCreate, db: Session = Depends(get_db)):
    db_tournament = Tournament(**tournament.model_dump())
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    return db_tournament

@router.get("/", response_model=TournamentList)
def list_tournaments(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    event_type: Optional[str] = None,
    city: Optional[str] = None,
    upcoming: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Tournament)

    if status:
        query = query.filter(Tournament.status == status)
    if event_type:
        query = query.filter(Tournament.event_type == event_type)
    if city:
        query = query.filter(Tournament.city == city)
    if upcoming:
        query = query.filter(Tournament.start_date >= datetime.now())

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return {"items": items, "total": total}

@router.get("/{tournament_id}", response_model=TournamentResponse)
def get_tournament(tournament_id: int, db: Session = Depends(get_db)):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament

@router.put("/{tournament_id}", response_model=TournamentResponse)
def update_tournament(tournament_id: int, tournament_update: TournamentUpdate, db: Session = Depends(get_db)):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    update_data = tournament_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tournament, field, value)

    db.commit()
    db.refresh(tournament)
    return tournament

@router.delete("/{tournament_id}")
def delete_tournament(tournament_id: int, db: Session = Depends(get_db)):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    db.delete(tournament)
    db.commit()
    return {"message": "Tournament deleted successfully"}

@router.get("/dashboard/stats", response_model=TournamentDashboardStats)
def get_tournament_stats(db: Session = Depends(get_db)):
    total = db.query(Tournament).count()
    upcoming = db.query(Tournament).filter(Tournament.start_date >= datetime.now()).count()
    completed = db.query(Tournament).filter(Tournament.status == "completed").count()
    pending_approvals = db.query(Tournament).filter(Tournament.srfi_approval_status == "pending").count()

    budget_allocated = db.query(func.sum(Tournament.budget_allocated)).scalar() or 0
    budget_spent = db.query(func.sum(Tournament.budget_spent)).scalar() or 0
    total_revenue = db.query(func.sum(Tournament.registration_revenue + Tournament.sponsorship_revenue)).scalar() or 0

    # Events by status
    status_counts = db.query(Tournament.status, func.count(Tournament.id)).group_by(Tournament.status).all()
    events_by_status = {status: count for status, count in status_counts}

    # Events by month
    month_counts = db.query(
        extract('month', Tournament.start_date),
        func.count(Tournament.id)
    ).group_by(extract('month', Tournament.start_date)).all()
    events_by_month = {int(month): count for month, count in month_counts}

    return {
        "total_events": total,
        "upcoming_events": upcoming,
        "completed_events": completed,
        "pending_approvals": pending_approvals,
        "total_budget_allocated": float(budget_allocated),
        "total_budget_spent": float(budget_spent),
        "total_revenue": float(total_revenue),
        "events_by_status": events_by_status,
        "events_by_month": events_by_month
    }

@router.get("/calendar/upcoming")
def get_upcoming_calendar(days: int = 180, db: Session = Depends(get_db)):
    """Get upcoming events for the next N days (default 6 months)."""
    start = datetime.now()
    end = start + timedelta(days=days)

    events = db.query(Tournament).filter(
        Tournament.start_date >= start,
        Tournament.start_date <= end
    ).order_by(Tournament.start_date).all()

    return events
