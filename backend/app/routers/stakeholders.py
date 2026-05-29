"""Stakeholder and association relations API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta

from ..models import get_db
from ..models.stakeholder import Stakeholder, Touchpoint
from ..schemas.stakeholder import (
    StakeholderCreate, StakeholderUpdate, StakeholderResponse,
    TouchpointCreate, TouchpointUpdate, TouchpointResponse,
    StakeholderList
)

router = APIRouter(prefix="/stakeholders", tags=["Stakeholders"])

@router.post("/", response_model=StakeholderResponse)
def create_stakeholder(stakeholder: StakeholderCreate, db: Session = Depends(get_db)):
    db_stakeholder = Stakeholder(**stakeholder.model_dump())
    db.add(db_stakeholder)
    db.commit()
    db.refresh(db_stakeholder)
    return db_stakeholder

@router.get("/", response_model=StakeholderList)
def list_stakeholders(
    skip: int = 0,
    limit: int = 100,
    stakeholder_type: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Stakeholder)

    if stakeholder_type:
        query = query.filter(Stakeholder.stakeholder_type == stakeholder_type)
    if is_active is not None:
        query = query.filter(Stakeholder.is_active_partner == is_active)
    if search:
        query = query.filter(Stakeholder.name.ilike(f"%{search}%"))

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    # Enrich with touchpoint counts
    for item in items:
        item.touchpoint_count = db.query(Touchpoint).filter(Touchpoint.stakeholder_id == item.id).count()
        last_tp = db.query(Touchpoint).filter(Touchpoint.stakeholder_id == item.id).order_by(Touchpoint.interaction_date.desc()).first()
        item.last_touchpoint_date = last_tp.interaction_date if last_tp else None

    return {"items": items, "total": total}

@router.get("/{stakeholder_id}", response_model=StakeholderResponse)
def get_stakeholder(stakeholder_id: int, db: Session = Depends(get_db)):
    stakeholder = db.query(Stakeholder).filter(Stakeholder.id == stakeholder_id).first()
    if not stakeholder:
        raise HTTPException(status_code=404, detail="Stakeholder not found")

    stakeholder.touchpoint_count = db.query(Touchpoint).filter(Touchpoint.stakeholder_id == stakeholder_id).count()
    last_tp = db.query(Touchpoint).filter(Touchpoint.stakeholder_id == stakeholder_id).order_by(Touchpoint.interaction_date.desc()).first()
    stakeholder.last_touchpoint_date = last_tp.interaction_date if last_tp else None

    return stakeholder

@router.put("/{stakeholder_id}", response_model=StakeholderResponse)
def update_stakeholder(stakeholder_id: int, stakeholder_update: StakeholderUpdate, db: Session = Depends(get_db)):
    stakeholder = db.query(Stakeholder).filter(Stakeholder.id == stakeholder_id).first()
    if not stakeholder:
        raise HTTPException(status_code=404, detail="Stakeholder not found")

    update_data = stakeholder_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(stakeholder, field, value)

    db.commit()
    db.refresh(stakeholder)
    return stakeholder

@router.delete("/{stakeholder_id}")
def delete_stakeholder(stakeholder_id: int, db: Session = Depends(get_db)):
    stakeholder = db.query(Stakeholder).filter(Stakeholder.id == stakeholder_id).first()
    if not stakeholder:
        raise HTTPException(status_code=404, detail="Stakeholder not found")
    db.delete(stakeholder)
    db.commit()
    return {"message": "Stakeholder deleted successfully"}

# Touchpoint endpoints
@router.post("/touchpoints", response_model=TouchpointResponse)
def create_touchpoint(touchpoint: TouchpointCreate, db: Session = Depends(get_db)):
    db_touchpoint = Touchpoint(**touchpoint.model_dump())
    db.add(db_touchpoint)
    db.commit()
    db.refresh(db_touchpoint)

    # Enrich response
    stakeholder = db.query(Stakeholder).filter(Stakeholder.id == db_touchpoint.stakeholder_id).first()
    db_touchpoint.stakeholder_name = stakeholder.name if stakeholder else None

    return db_touchpoint

@router.get("/touchpoints/recent")
def get_recent_touchpoints(days: int = 30, db: Session = Depends(get_db)):
    since = datetime.now() - timedelta(days=days)
    touchpoints = db.query(Touchpoint).filter(Touchpoint.interaction_date >= since).order_by(Touchpoint.interaction_date.desc()).all()

    result = []
    for tp in touchpoints:
        stakeholder = db.query(Stakeholder).filter(Stakeholder.id == tp.stakeholder_id).first()
        tp.stakeholder_name = stakeholder.name if stakeholder else None
        result.append(tp)

    return result

@router.get("/touchpoints/follow-ups")
def get_pending_followups(db: Session = Depends(get_db)):
    """Get touchpoints requiring follow-up."""
    touchpoints = db.query(Touchpoint).filter(
        Touchpoint.response_required == True,
        Touchpoint.response_received == False
    ).order_by(Touchpoint.follow_up_date).all()

    result = []
    for tp in touchpoints:
        stakeholder = db.query(Stakeholder).filter(Stakeholder.id == tp.stakeholder_id).first()
        tp.stakeholder_name = stakeholder.name if stakeholder else None
        result.append(tp)

    return result
