"""Tournament Pydantic schemas."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class EventStatus(str, Enum):
    PLANNING = "planning"
    SRFI_APPROVAL_PENDING = "srfi_approval_pending"
    APPROVED = "approved"
    COACH_BOOKING = "coach_booking"
    REGISTRATION_OPEN = "registration_open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class EventType(str, Enum):
    INTERNATIONAL_CAMP = "international_camp"
    STATE_CHAMPIONSHIP = "state_championship"
    PSA_SATELLITE = "psa_satellite"
    OPEN_TOURNAMENT = "open_tournament"
    REGIONAL_EVENT = "regional_event"
    TRAINING_CLINIC = "training_clinic"

class TournamentBase(BaseModel):
    name: str
    event_type: EventType
    status: EventStatus = EventStatus.PLANNING
    start_date: datetime
    end_date: datetime
    registration_deadline: Optional[datetime] = None
    venue: str
    city: str
    state: str = "Gujarat"
    srfi_star_rating: Optional[int] = None
    srfi_approval_status: str = "pending"
    srfi_approval_date: Optional[datetime] = None
    srfi_event_code: Optional[str] = None
    guest_coach_name: Optional[str] = None
    guest_coach_origin: Optional[str] = None
    clinic_days: int = 0
    clinic_pre_event: bool = False
    budget_allocated: float = 0.0
    budget_spent: float = 0.0
    registration_revenue: float = 0.0
    sponsorship_revenue: float = 0.0
    expected_players: int = 0
    registered_players: int = 0
    courts_booked: int = 0
    risk_level: str = "green"
    notes: Optional[str] = None

class TournamentCreate(TournamentBase):
    pass

class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    event_type: Optional[EventType] = None
    status: Optional[EventStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    venue: Optional[str] = None
    city: Optional[str] = None
    srfi_approval_status: Optional[str] = None
    srfi_approval_date: Optional[datetime] = None
    guest_coach_name: Optional[str] = None
    guest_coach_origin: Optional[str] = None
    clinic_days: Optional[int] = None
    clinic_pre_event: Optional[bool] = None
    budget_allocated: Optional[float] = None
    budget_spent: Optional[float] = None
    registration_revenue: Optional[float] = None
    sponsorship_revenue: Optional[float] = None
    expected_players: Optional[int] = None
    registered_players: Optional[int] = None
    courts_booked: Optional[int] = None
    risk_level: Optional[str] = None
    notes: Optional[str] = None

class TournamentResponse(TournamentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TournamentList(BaseModel):
    items: List[TournamentResponse]
    total: int

    class Config:
        from_attributes = True

class TournamentDashboardStats(BaseModel):
    total_events: int
    upcoming_events: int
    completed_events: int
    pending_approvals: int
    total_budget_allocated: float
    total_budget_spent: float
    total_revenue: float
    events_by_status: dict
    events_by_month: dict
