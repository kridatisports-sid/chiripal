"""Marketing and content coordination model."""
from sqlalchemy import Column, Integer, String, DateTime, Text, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class ContentType(str, enum.Enum):
    PHOTO = "photo"
    VIDEO = "video"
    REEL = "reel"
    STORY = "story"
    POSTER = "poster"
    BANNER = "banner"
    PRESS_RELEASE = "press_release"

class Platform(str, enum.Enum):
    INSTAGRAM = "instagram"
    FACEBOOK = "facebook"
    TWITTER = "twitter"
    LINKEDIN = "linkedin"
    YOUTUBE = "youtube"
    WEBSITE = "website"

class ContentStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PRODUCTION = "in_production"
    REVIEW = "review"
    APPROVED = "approved"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class ContentAsset(Base):
    __tablename__ = "content_assets"

    id = Column(Integer, primary_key=True, index=True)

    # Links
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id"), nullable=True)

    # Asset Details
    title = Column(String, nullable=False)
    content_type = Column(Enum(ContentType), nullable=False)
    file_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)

    # Event Context
    event_name = Column(String, nullable=True)
    captured_by = Column(String, nullable=True)  # photographer/videographer
    capture_date = Column(DateTime, nullable=True)

    # Usage
    usage_rights = Column(String, default="internal")
    tags = Column(String, nullable=True)

    # Relations
    tournament = relationship("Tournament", back_populates="content_assets")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SocialPost(Base):
    __tablename__ = "social_posts"

    id = Column(Integer, primary_key=True, index=True)

    # Content
    title = Column(String, nullable=False)
    caption = Column(Text, nullable=True)
    platform = Column(Enum(Platform), nullable=False)

    # Scheduling
    scheduled_date = Column(DateTime, nullable=True)
    published_date = Column(DateTime, nullable=True)

    # Status
    status = Column(Enum(ContentStatus), default=ContentStatus.PENDING)
    assigned_to = Column(String, default="Akash")  # Freelance manager

    # Links
    asset_ids = Column(String, nullable=True)  # Comma-separated asset IDs
    event_reference = Column(String, nullable=True)

    # Performance (manual entry)
    reach = Column(Integer, nullable=True)
    engagement = Column(Integer, nullable=True)
    likes = Column(Integer, nullable=True)
    shares = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
