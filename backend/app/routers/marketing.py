"""Marketing and content coordination API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta

from ..models import get_db
from ..models.marketing import ContentAsset, SocialPost
from ..schemas.marketing import (
    ContentAssetCreate, ContentAssetUpdate, ContentAssetResponse,
    SocialPostCreate, SocialPostUpdate, SocialPostResponse,
    MarketingDashboardStats
)

router = APIRouter(prefix="/marketing", tags=["Marketing"])

# Content Asset endpoints
@router.post("/assets", response_model=ContentAssetResponse)
def create_asset(asset: ContentAssetCreate, db: Session = Depends(get_db)):
    db_asset = ContentAsset(**asset.model_dump())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.get("/assets")
def list_assets(
    skip: int = 0,
    limit: int = 100,
    content_type: Optional[str] = None,
    tournament_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ContentAsset)

    if content_type:
        query = query.filter(ContentAsset.content_type == content_type)
    if tournament_id:
        query = query.filter(ContentAsset.tournament_id == tournament_id)

    total = query.count()
    items = query.offset(skip).limit(limit).all()

    return {"items": items, "total": total}

@router.get("/assets/{asset_id}", response_model=ContentAssetResponse)
def get_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(ContentAsset).filter(ContentAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.put("/assets/{asset_id}", response_model=ContentAssetResponse)
def update_asset(asset_id: int, asset_update: ContentAssetUpdate, db: Session = Depends(get_db)):
    asset = db.query(ContentAsset).filter(ContentAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    update_data = asset_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(asset, field, value)

    db.commit()
    db.refresh(asset)
    return asset

# Social Post endpoints
@router.post("/posts", response_model=SocialPostResponse)
def create_post(post: SocialPostCreate, db: Session = Depends(get_db)):
    db_post = SocialPost(**post.model_dump())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@router.get("/posts")
def list_posts(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    platform: Optional[str] = None,
    assigned_to: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SocialPost)

    if status:
        query = query.filter(SocialPost.status == status)
    if platform:
        query = query.filter(SocialPost.platform == platform)
    if assigned_to:
        query = query.filter(SocialPost.assigned_to == assigned_to)

    total = query.count()
    items = query.order_by(SocialPost.scheduled_date).offset(skip).limit(limit).all()

    return {"items": items, "total": total}

@router.get("/posts/{post_id}", response_model=SocialPostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(SocialPost).filter(SocialPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.put("/posts/{post_id}", response_model=SocialPostResponse)
def update_post(post_id: int, post_update: SocialPostUpdate, db: Session = Depends(get_db)):
    post = db.query(SocialPost).filter(SocialPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    update_data = post_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(post, field, value)

    db.commit()
    db.refresh(post)
    return post

@router.delete("/posts/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(SocialPost).filter(SocialPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully"}

@router.get("/dashboard/stats", response_model=MarketingDashboardStats)
def get_marketing_stats(db: Session = Depends(get_db)):
    total_assets = db.query(ContentAsset).count()

    asset_type_counts = db.query(ContentAsset.content_type, func.count(ContentAsset.id)).group_by(ContentAsset.content_type).all()
    assets_by_type = {t: c for t, c in asset_type_counts}

    total_posts = db.query(SocialPost).count()

    post_status_counts = db.query(SocialPost.status, func.count(SocialPost.id)).group_by(SocialPost.status).all()
    posts_by_status = {s: c for s, c in post_status_counts}

    post_platform_counts = db.query(SocialPost.platform, func.count(SocialPost.id)).group_by(SocialPost.platform).all()
    posts_by_platform = {p: c for p, c in post_platform_counts}

    upcoming = db.query(SocialPost).filter(
        SocialPost.scheduled_date >= datetime.now(),
        SocialPost.status.in_(["pending", "in_production", "review"])
    ).count()

    pending_approvals = db.query(SocialPost).filter(SocialPost.status == "review").count()

    return {
        "total_assets": total_assets,
        "assets_by_type": assets_by_type,
        "total_posts": total_posts,
        "posts_by_status": posts_by_status,
        "posts_by_platform": posts_by_platform,
        "upcoming_posts": upcoming,
        "pending_approvals": pending_approvals
    }
