"""Athlete (Champions Program) API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta

from ..models import get_db
from ..models.athlete import Athlete
from ..schemas.athlete import (
    AthleteCreate, AthleteUpdate, AthleteResponse,
    AthleteList, AthleteDashboardStats
)

router = APIRouter(prefix="/athletes", tags=["Athletes"])

@router.post("/", response_model=AthleteResponse)
def create_athlete(athlete: AthleteCreate, db: Session = Depends(get_db)):
    db_athlete = Athlete(**athlete.model_dump())
    db.add(db_athlete)
    db.commit()
    db.refresh(db_athlete)
    return db_athlete

@router.get("/", response_model=AthleteList)
def list_athletes(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    tier: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Athlete)

    if status:
        query = query.filter(Athlete.status == status)
    if tier:
        query = query.filter(Athlete.tier == tier)
    if search:
        query = query.filter(Athlete.full_name.ilike(f"%{search}%"))

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return {"items": items, "total": total}

@router.get("/{athlete_id}", response_model=AthleteResponse)
def get_athlete(athlete_id: int, db: Session = Depends(get_db)):
    athlete = db.query(Athlete).filter(Athlete.id == athlete_id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    return athlete

@router.put("/{athlete_id}", response_model=AthleteResponse)
def update_athlete(athlete_id: int, athlete_update: AthleteUpdate, db: Session = Depends(get_db)):
    athlete = db.query(Athlete).filter(Athlete.id == athlete_id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")

    update_data = athlete_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(athlete, field, value)

    db.commit()
    db.refresh(athlete)
    return athlete

@router.delete("/{athlete_id}")
def delete_athlete(athlete_id: int, db: Session = Depends(get_db)):
    athlete = db.query(Athlete).filter(Athlete.id == athlete_id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail="Athlete not found")
    db.delete(athlete)
    db.commit()
    return {"message": "Athlete deleted successfully"}

@router.get("/dashboard/stats", response_model=AthleteDashboardStats)
def get_athlete_stats(db: Session = Depends(get_db)):
    total = db.query(Athlete).count()
    active = db.query(Athlete).filter(Athlete.status == "active").count()

    monthly_commitment = db.query(func.sum(Athlete.monthly_stipend)).scalar() or 0

    tier_counts = db.query(Athlete.tier, func.count(Athlete.id)).group_by(Athlete.tier).all()
    athletes_by_tier = {tier: count for tier, count in tier_counts}

    status_counts = db.query(Athlete.status, func.count(Athlete.id)).group_by(Athlete.status).all()
    athletes_by_status = {status: count for status, count in status_counts}

    # Contract renewals in next 90 days
    renewal_threshold = datetime.now() + timedelta(days=90)
    upcoming_renewals = db.query(Athlete).filter(
        Athlete.contract_expiry <= renewal_threshold,
        Athlete.contract_expiry >= datetime.now()
    ).count()

    return {
        "total_athletes": total,
        "active_athletes": active,
        "total_monthly_commitment": float(monthly_commitment),
        "athletes_by_tier": athletes_by_tier,
        "athletes_by_status": athletes_by_status,
        "upcoming_contract_renewals": upcoming_renewals
    }
