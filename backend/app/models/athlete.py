"""Champions Program athlete model."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class AthleteStatus(str, enum.Enum):
    PROSPECT = "prospect"
    TRIAL = "trial"
    ACTIVE = "active"
    INACTIVE = "inactive"
    GRADUATED = "graduated"

class AthleteTier(str, enum.Enum):
    EMERGING = "emerging"
    DEVELOPMENT = "development"
    ELITE = "elite"
    PREMIER = "premier"

class Athlete(Base):
    __tablename__ = "athletes"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    date_of_birth = Column(DateTime, nullable=True)
    gender = Column(String, nullable=True)

    # Contact
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    hometown = Column(String, nullable=True)
    state = Column(String, nullable=True)

    # Program Details
    status = Column(Enum(AthleteStatus), default=AthleteStatus.PROSPECT)
    tier = Column(Enum(AthleteTier), default=AthleteTier.EMERGING)
    jersey_number = Column(String, nullable=True)
    onboarding_date = Column(DateTime, nullable=True)
    contract_expiry = Column(DateTime, nullable=True)

    # Sponsorship
    monthly_stipend = Column(Float, default=0.0)
    equipment_budget = Column(Float, default=0.0)
    travel_budget = Column(Float, default=0.0)
    total_funded = Column(Float, default=0.0)

    # Performance
    psa_ranking = Column(Integer, nullable=True)
    srfi_ranking = Column(Integer, nullable=True)
    national_ranking = Column(Integer, nullable=True)

    # Tracking
    tournaments_played = Column(Integer, default=0)
    tournaments_won = Column(Integer, default=0)
    last_tournament_date = Column(DateTime, nullable=True)

    # Media
    photo_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)

    # Compliance
    jersey_compliance = Column(Boolean, default=True)
    social_media_tags = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
