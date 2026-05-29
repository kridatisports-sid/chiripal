"""Tournament and event management model."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class EventStatus(str, enum.Enum):
    PLANNING = "planning"
    SRFI_APPROVAL_PENDING = "srfi_approval_pending"
    APPROVED = "approved"
    COACH_BOOKING = "coach_booking"
    REGISTRATION_OPEN = "registration_open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class EventType(str, enum.Enum):
    INTERNATIONAL_CAMP = "international_camp"
    STATE_CHAMPIONSHIP = "state_championship"
    PSA_SATELLITE = "psa_satellite"
    OPEN_TOURNAMENT = "open_tournament"
    REGIONAL_EVENT = "regional_event"
    TRAINING_CLINIC = "training_clinic"

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    event_type = Column(Enum(EventType), nullable=False)
    status = Column(Enum(EventStatus), default=EventStatus.PLANNING)

    # Dates
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    registration_deadline = Column(DateTime, nullable=True)

    # Location
    venue = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, default="Gujarat")

    # SRFI Details
    srfi_star_rating = Column(Integer, nullable=True)  # 1, 2, 3 star
    srfi_approval_status = Column(String, default="pending")
    srfi_approval_date = Column(DateTime, nullable=True)
    srfi_event_code = Column(String, nullable=True)

    # Coach & Clinic
    guest_coach_name = Column(String, nullable=True)
    guest_coach_origin = Column(String, nullable=True)  # Mumbai, Delhi, etc.
    clinic_days = Column(Integer, default=0)
    clinic_pre_event = Column(Boolean, default=False)

    # Financial
    budget_allocated = Column(Float, default=0.0)
    budget_spent = Column(Float, default=0.0)
    registration_revenue = Column(Float, default=0.0)
    sponsorship_revenue = Column(Float, default=0.0)

    # Operations
    expected_players = Column(Integer, default=0)
    registered_players = Column(Integer, default=0)
    courts_booked = Column(Integer, default=0)

    # Risk & Notes
    risk_level = Column(String, default="green")  # green, amber, red
    notes = Column(Text, nullable=True)

    # Relations
    transactions = relationship("Transaction", back_populates="tournament")
    content_assets = relationship("ContentAsset", back_populates="tournament")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
