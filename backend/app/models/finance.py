"""Financial tracking models."""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"

class TransactionCategory(str, enum.Enum):
    VENUE = "venue"
    COACH_FEES = "coach_fees"
    TRAVEL = "travel"
    ACCOMMODATION = "accommodation"
    EQUIPMENT = "equipment"
    MARKETING = "marketing"
    ATHLETE_SPONSORSHIP = "athlete_sponsorship"
    REGISTRATION = "registration"
    SPONSORSHIP = "sponsorship"
    CLUB_PARTNERSHIP = "club_partnership"
    SRFI_FEES = "srfi_fees"
    MISCELLANEOUS = "miscellaneous"

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    fiscal_year = Column(String, nullable=False)  # e.g., "2025-26"
    total_annual_budget = Column(Float, default=0.0)
    total_allocated = Column(Float, default=0.0)
    total_spent = Column(Float, default=0.0)
    total_remaining = Column(Float, default=0.0)

    # Category breakdowns
    tournaments_budget = Column(Float, default=0.0)
    tournaments_spent = Column(Float, default=0.0)

    clinics_budget = Column(Float, default=0.0)
    clinics_spent = Column(Float, default=0.0)

    athlete_program_budget = Column(Float, default=0.0)
    athlete_program_spent = Column(Float, default=0.0)

    marketing_budget = Column(Float, default=0.0)
    marketing_spent = Column(Float, default=0.0)

    operations_budget = Column(Float, default=0.0)
    operations_spent = Column(Float, default=0.0)

    # Fixed costs
    coach_salary_monthly = Column(Float, default=0.0)
    club_revenue_split = Column(Float, default=20.0)  # 20% to club
    akash_retainer = Column(Float, default=0.0)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    # Links
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id"), nullable=True)

    # Details
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    category = Column(Enum(TransactionCategory), nullable=False)

    # Meta
    payment_method = Column(String, nullable=True)
    vendor_payee = Column(String, nullable=True)
    receipt_url = Column(String, nullable=True)
    approved_by = Column(String, nullable=True)

    # Date
    transaction_date = Column(DateTime, nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relations
    tournament = relationship("Tournament", back_populates="transactions")
