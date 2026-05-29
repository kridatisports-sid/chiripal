"""Finance and budget API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta

from ..models import get_db
from ..models.finance import Budget, Transaction
from ..schemas.finance import (
    BudgetCreate, BudgetUpdate, BudgetResponse,
    TransactionCreate, TransactionUpdate, TransactionResponse,
    TransactionList, FinanceDashboardStats
)

router = APIRouter(prefix="/finance", tags=["Finance"])

# Budget endpoints
@router.post("/budgets", response_model=BudgetResponse)
def create_budget(budget: BudgetCreate, db: Session = Depends(get_db)):
    # Deactivate existing active budgets for same fiscal year
    existing = db.query(Budget).filter(
        Budget.fiscal_year == budget.fiscal_year,
        Budget.is_active == True
    ).first()
    if existing:
        existing.is_active = False
        db.commit()

    db_budget = Budget(**budget.model_dump())
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

@router.get("/budgets/current", response_model=BudgetResponse)
def get_current_budget(fiscal_year: Optional[str] = None, db: Session = Depends(get_db)):
    if fiscal_year:
        budget = db.query(Budget).filter(
            Budget.fiscal_year == fiscal_year,
            Budget.is_active == True
        ).first()
    else:
        budget = db.query(Budget).filter(Budget.is_active == True).order_by(Budget.created_at.desc()).first()

    if not budget:
        raise HTTPException(status_code=404, detail="No active budget found")
    return budget

@router.put("/budgets/{budget_id}", response_model=BudgetResponse)
def update_budget(budget_id: int, budget_update: BudgetUpdate, db: Session = Depends(get_db)):
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    update_data = budget_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(budget, field, value)

    db.commit()
    db.refresh(budget)
    return budget

# Transaction endpoints
@router.post("/transactions", response_model=TransactionResponse)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = Transaction(**transaction.model_dump())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    # Update budget spent
    budget = db.query(Budget).filter(Budget.is_active == True).first()
    if budget:
        if transaction.transaction_type == "expense":
            budget.total_spent = (budget.total_spent or 0) + transaction.amount
            # Update category spending
            if transaction.category == "coach_fees" or transaction.category == "venue":
                budget.tournaments_spent = (budget.tournaments_spent or 0) + transaction.amount
            elif transaction.category == "athlete_sponsorship":
                budget.athlete_program_spent = (budget.athlete_program_spent or 0) + transaction.amount
            elif transaction.category == "marketing":
                budget.marketing_spent = (budget.marketing_spent or 0) + transaction.amount
        else:
            budget.total_allocated = (budget.total_allocated or 0) + transaction.amount

        db.commit()

    return db_transaction

@router.get("/transactions", response_model=TransactionList)
def list_transactions(
    skip: int = 0,
    limit: int = 100,
    transaction_type: Optional[str] = None,
    category: Optional[str] = None,
    tournament_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)

    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)
    if category:
        query = query.filter(Transaction.category == category)
    if tournament_id:
        query = query.filter(Transaction.tournament_id == tournament_id)
    if start_date:
        query = query.filter(Transaction.transaction_date >= start_date)
    if end_date:
        query = query.filter(Transaction.transaction_date <= end_date)

    total = query.count()
    items = query.order_by(Transaction.transaction_date.desc()).offset(skip).limit(limit).all()

    return {"items": items, "total": total}

@router.get("/dashboard/stats", response_model=FinanceDashboardStats)
def get_finance_stats(db: Session = Depends(get_db)):
    budget = db.query(Budget).filter(Budget.is_active == True).first()

    if not budget:
        raise HTTPException(status_code=404, detail="No active budget found")

    total_spent = budget.total_spent or 0
    total_budget = budget.total_annual_budget or 0
    remaining = total_budget - total_spent

    # Monthly burn rate (last 3 months)
    three_months_ago = datetime.now() - timedelta(days=90)
    recent_expenses = db.query(func.sum(Transaction.amount)).filter(
        Transaction.transaction_type == "expense",
        Transaction.transaction_date >= three_months_ago
    ).scalar() or 0
    burn_rate = recent_expenses / 3
    months_remaining = remaining / burn_rate if burn_rate > 0 else float('inf')

    # Income vs Expense
    total_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.transaction_type == "income"
    ).scalar() or 0
    total_expenses = db.query(func.sum(Transaction.amount)).filter(
        Transaction.transaction_type == "expense"
    ).scalar() or 0

    # Spending by category
    category_spending = db.query(
        Transaction.category,
        func.sum(Transaction.amount)
    ).filter(Transaction.transaction_type == "expense").group_by(Transaction.category).all()

    spending_by_category = [
        {"category": cat, "amount": float(amount)}
        for cat, amount in category_spending
    ]

    # Budget variance
    category_budgets = {
        "tournaments": budget.tournaments_budget,
        "clinics": budget.clinics_budget,
        "athlete_program": budget.athlete_program_budget,
        "marketing": budget.marketing_budget,
        "operations": budget.operations_budget
    }

    category_spent = {
        "tournaments": budget.tournaments_spent or 0,
        "clinics": budget.clinics_spent or 0,
        "athlete_program": budget.athlete_program_spent or 0,
        "marketing": budget.marketing_spent or 0,
        "operations": budget.operations_spent or 0
    }

    budget_variance = [
        {
            "category": cat,
            "budgeted": float(budgeted),
            "spent": float(spent),
            "variance": float(budgeted - spent),
            "utilization_pct": round((spent / budgeted * 100), 1) if budgeted > 0 else 0
        }
        for cat, budgeted, spent in zip(
            category_budgets.keys(),
            category_budgets.values(),
            category_spent.values()
        )
    ]

    # Recent transactions
    recent = db.query(Transaction).order_by(Transaction.transaction_date.desc()).limit(10).all()

    return {
        "total_budget": float(total_budget),
        "total_spent": float(total_spent),
        "total_remaining": float(remaining),
        "burn_rate_monthly": float(burn_rate),
        "months_remaining": round(months_remaining, 1) if months_remaining != float('inf') else 999,
        "income_vs_expense": {
            "income": float(total_income),
            "expense": float(total_expenses)
        },
        "spending_by_category": spending_by_category,
        "budget_variance_by_category": budget_variance,
        "recent_transactions": recent
    }
