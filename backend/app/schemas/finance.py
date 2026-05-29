"""Finance Pydantic schemas."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"

class TransactionCategory(str, Enum):
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

class BudgetBase(BaseModel):
    fiscal_year: str
    total_annual_budget: float = 0.0
    tournaments_budget: float = 0.0
    clinics_budget: float = 0.0
    athlete_program_budget: float = 0.0
    marketing_budget: float = 0.0
    operations_budget: float = 0.0
    coach_salary_monthly: float = 0.0
    club_revenue_split: float = 20.0
    akash_retainer: float = 0.0

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    total_annual_budget: Optional[float] = None
    tournaments_budget: Optional[float] = None
    clinics_budget: Optional[float] = None
    athlete_program_budget: Optional[float] = None
    marketing_budget: Optional[float] = None
    operations_budget: Optional[float] = None
    coach_salary_monthly: Optional[float] = None
    club_revenue_split: Optional[float] = None
    akash_retainer: Optional[float] = None

class BudgetResponse(BudgetBase):
    id: int
    total_allocated: float
    total_spent: float
    total_remaining: float
    tournaments_spent: float
    clinics_spent: float
    athlete_program_spent: float
    marketing_spent: float
    operations_spent: float
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    description: str
    amount: float
    transaction_type: TransactionType
    category: TransactionCategory
    tournament_id: Optional[int] = None
    athlete_id: Optional[int] = None
    payment_method: Optional[str] = None
    vendor_payee: Optional[str] = None
    receipt_url: Optional[str] = None
    approved_by: Optional[str] = None
    transaction_date: datetime

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    transaction_type: Optional[TransactionType] = None
    category: Optional[TransactionCategory] = None
    payment_method: Optional[str] = None
    vendor_payee: Optional[str] = None
    receipt_url: Optional[str] = None
    approved_by: Optional[str] = None
    transaction_date: Optional[datetime] = None

class TransactionResponse(TransactionBase):
    id: int
    recorded_at: datetime

    class Config:
        from_attributes = True

class TransactionList(BaseModel):
    items: List[TransactionResponse]
    total: int

    class Config:
        from_attributes = True

class FinanceDashboardStats(BaseModel):
    total_budget: float
    total_spent: float
    total_remaining: float
    burn_rate_monthly: float
    months_remaining: float
    income_vs_expense: dict
    spending_by_category: List[dict]
    budget_variance_by_category: List[dict]
    recent_transactions: List[TransactionResponse]
