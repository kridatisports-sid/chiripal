"""Athlete Pydantic schemas."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class AthleteStatus(str, Enum):
    PROSPECT = "prospect"
    TRIAL = "trial"
    ACTIVE = "active"
    INACTIVE = "inactive"
    GRADUATED = "graduated"

class AthleteTier(str, Enum):
    EMERGING = "emerging"
    DEVELOPMENT = "development"
    ELITE = "elite"
    PREMIER = "premier"

class AthleteBase(BaseModel):
    full_name: str
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    hometown: Optional[str] = None
    state: Optional[str] = None
    status: AthleteStatus = AthleteStatus.PROSPECT
    tier: AthleteTier = AthleteTier.EMERGING
    jersey_number: Optional[str] = None
    onboarding_date: Optional[datetime] = None
    contract_expiry: Optional[datetime] = None
    monthly_stipend: float = 0.0
    equipment_budget: float = 0.0
    travel_budget: float = 0.0
    total_funded: float = 0.0
    psa_ranking: Optional[int] = None
    srfi_ranking: Optional[int] = None
    national_ranking: Optional[int] = None
    tournaments_played: int = 0
    tournaments_won: int = 0
    last_tournament_date: Optional[datetime] = None
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    jersey_compliance: bool = True
    social_media_tags: Optional[str] = None

class AthleteCreate(AthleteBase):
    pass

class AthleteUpdate(BaseModel):
    full_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    hometown: Optional[str] = None
    state: Optional[str] = None
    status: Optional[AthleteStatus] = None
    tier: Optional[AthleteTier] = None
    jersey_number: Optional[str] = None
    onboarding_date: Optional[datetime] = None
    contract_expiry: Optional[datetime] = None
    monthly_stipend: Optional[float] = None
    equipment_budget: Optional[float] = None
    travel_budget: Optional[float] = None
    psa_ranking: Optional[int] = None
    srfi_ranking: Optional[int] = None
    national_ranking: Optional[int] = None
    tournaments_played: Optional[int] = None
    tournaments_won: Optional[int] = None
    last_tournament_date: Optional[datetime] = None
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    jersey_compliance: Optional[bool] = None
    social_media_tags: Optional[str] = None

class AthleteResponse(AthleteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AthleteList(BaseModel):
    items: List[AthleteResponse]
    total: int

    class Config:
        from_attributes = True

class AthleteDashboardStats(BaseModel):
    total_athletes: int
    active_athletes: int
    total_monthly_commitment: float
    athletes_by_tier: dict
    athletes_by_status: dict
    upcoming_contract_renewals: int
