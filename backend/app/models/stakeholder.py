"""Stakeholder and association relations model."""
from sqlalchemy import Column, Integer, String, DateTime, Text, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class StakeholderType(str, enum.Enum):
    STATE_ASSOCIATION = "state_association"
    SRFI = "srfi"
    CLUB_PARTNER = "club_partner"
    COACH = "coach"
    SPONSOR = "sponsor"
    MEDIA = "media"
    VENDOR = "vendor"
    OTHER = "other"

class Stakeholder(Base):
    __tablename__ = "stakeholders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    stakeholder_type = Column(Enum(StakeholderType), nullable=False)
    organization = Column(String, nullable=True)

    # Contact
    primary_contact = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    # Partnership
    is_active_partner = Column(Boolean, default=True)
    mou_start_date = Column(DateTime, nullable=True)
    mou_end_date = Column(DateTime, nullable=True)
    mou_status = Column(String, default="active")  # active, expiring, expired, renewing

    # Financial
    revenue_share_percent = Column(Float, nullable=True)
    fixed_cost_monthly = Column(Float, nullable=True)

    # Notes
    notes = Column(Text, nullable=True)

    # Relations
    touchpoints = relationship("Touchpoint", back_populates="stakeholder")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Touchpoint(Base):
    __tablename__ = "touchpoints"

    id = Column(Integer, primary_key=True, index=True)
    stakeholder_id = Column(Integer, ForeignKey("stakeholders.id"), nullable=False)

    # Interaction
    interaction_date = Column(DateTime, nullable=False)
    interaction_type = Column(String, nullable=False)  # email, call, meeting, approval_request
    subject = Column(String, nullable=False)
    details = Column(Text, nullable=True)

    # Status
    response_required = Column(Boolean, default=False)
    response_received = Column(Boolean, default=False)
    follow_up_date = Column(DateTime, nullable=True)

    # Relations
    stakeholder = relationship("Stakeholder", back_populates="touchpoints")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
