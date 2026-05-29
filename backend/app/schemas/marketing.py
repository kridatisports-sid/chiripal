"""Marketing Pydantic schemas."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ContentType(str, Enum):
    PHOTO = "photo"
    VIDEO = "video"
    REEL = "reel"
    STORY = "story"
    POSTER = "poster"
    BANNER = "banner"
    PRESS_RELEASE = "press_release"

class Platform(str, Enum):
    INSTAGRAM = "instagram"
    FACEBOOK = "facebook"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    YOUTUBE = "youtube"
    WEBSITE = "website"

class ContentStatus(str, Enum):
    PENDING = "pending"
    IN_PRODUCTION = "in_production"
    REVIEW = "review"
    APPROVED = "approved"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class ContentAssetBase(BaseModel):
    title: str
    content_type: ContentType
    tournament_id: Optional[int] = None
    athlete_id: Optional[int] = None
    file_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    event_name: Optional[str] = None
    captured_by: Optional[str] = None
    capture_date: Optional[datetime] = None
    usage_rights: str = "internal"
    tags: Optional[str] = None

class ContentAssetCreate(ContentAssetBase):
    pass

class ContentAssetUpdate(BaseModel):
    title: Optional[str] = None
    content_type: Optional[ContentType] = None
    file_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    event_name: Optional[str] = None
    captured_by: Optional[str] = None
    capture_date: Optional[datetime] = None
    usage_rights: Optional[str] = None
    tags: Optional[str] = None

class ContentAssetResponse(ContentAssetBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SocialPostBase(BaseModel):
    title: str
    caption: Optional[str] = None
    platform: Platform
    scheduled_date: Optional[datetime] = None
    published_date: Optional[datetime] = None
    status: ContentStatus = ContentStatus.PENDING
    assigned_to: str = "Akash"
    asset_ids: Optional[str] = None
    event_reference: Optional[str] = None
    reach: Optional[int] = None
    engagement: Optional[int] = None
    likes: Optional[int] = None
    shares: Optional[int] = None

class SocialPostCreate(SocialPostBase):
    pass

class SocialPostUpdate(BaseModel):
    title: Optional[str] = None
    caption: Optional[str] = None
    platform: Optional[Platform] = None
    scheduled_date: Optional[datetime] = None
    published_date: Optional[datetime] = None
    status: Optional[ContentStatus] = None
    assigned_to: Optional[str] = None
    asset_ids: Optional[str] = None
    event_reference: Optional[str] = None
    reach: Optional[int] = None
    engagement: Optional[int] = None
    likes: Optional[int] = None
    shares: Optional[int] = None

class SocialPostResponse(SocialPostBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MarketingDashboardStats(BaseModel):
    total_assets: int
    assets_by_type: dict
    total_posts: int
    posts_by_status: dict
    posts_by_platform: dict
    upcoming_posts: int
    pending_approvals: int
