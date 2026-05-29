"""Stakeholder Pydantic schemas."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class StakeholderType(str, Enum):
    STATE_ASSOCIATION = "state_association"
    SRFI = "srfi"
    CLUB_PARTNER = "club_partner"
    COACH = "coach"
    SPONSOR = "sponsor"
    MEDIA = "media"
    VENDOR = "vendor"
    OTHER = "other"

class StakeholderBase(BaseModel):
    name: str
    stakeholder_type: StakeholderType
    organization: Optional[str] = None
    primary_contact: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    is_active_partner: bool = True
    mou_start_date: Optional[datetime] = None
    mou_end_date: Optional[datetime] = None
    mou_status: str = "active"
    revenue_share_percent: Optional[float] = None
    fixed_cost_monthly: Optional[float] = None
    notes: Optional[str] = None

class StakeholderCreate(StakeholderBase):
    pass

class StakeholderUpdate(BaseModel):
    name: Optional[str] = None
    stakeholder_type: Optional[StakeholderType] = None
    organization: Optional[str] = None
    primary_contact: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    is_active_partner: Optional[bool] = None
    mou_start_date: Optional[datetime] = None
    mou_end_date: Optional[datetime] = None
    mou_status: Optional[str] = None
    revenue_share_percent: Optional[float] = None
    fixed_cost_monthly: Optional[float] = None
    notes: Optional[str] = None

class StakeholderResponse(StakeholderBase):
    id: int
    touchpoint_count: int = 0
    last_touchpoint_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TouchpointBase(BaseModel):
    stakeholder_id: int
    interaction_date: datetime
    interaction_type: str
    subject: str
    details: Optional[str] = None
    response_required: bool = False
    response_received: bool = False
    follow_up_date: Optional[datetime] = None

class TouchpointCreate(TouchpointBase):
    pass

class TouchpointUpdate(BaseModel):
    interaction_date: Optional[datetime] = None
    interaction_type: Optional[str] = None
    subject: Optional[str] = None
    details: Optional[str] = None
    response_required: Optional[bool] = None
    response_received: Optional[bool] = None
    follow_up_date: Optional[datetime] = None

class TouchpointResponse(TouchpointBase):
    id: int
    stakeholder_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class StakeholderList(BaseModel):
    items: List[StakeholderResponse]
    total: int

    class Config:
        from_attributes = True
