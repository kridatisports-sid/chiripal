from fastapi import FastAPI, Depends, HTTPException, status, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import sqlite3
import os

# Configuration
SECRET_KEY = "squash-excellence-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

app = FastAPI(title="Squash Excellence CRM API")

# CORS - Allow all origins for GitHub Codespaces
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API router with v1 prefix
api_router = APIRouter(prefix="/api/v1")

# Database setup
DB_PATH = os.path.join(os.path.dirname(__file__), "squash_crm.db")

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            full_name TEXT,
            role TEXT DEFAULT 'user',
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Members table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT,
            membership_type TEXT DEFAULT 'standard',
            status TEXT DEFAULT 'active',
            join_date DATE,
            expiry_date DATE,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Programs/Events table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS programs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            program_type TEXT,
            start_date DATE,
            end_date DATE,
            max_participants INTEGER,
            status TEXT DEFAULT 'upcoming',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Bookings/Court reservations
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER,
            court_number INTEGER,
            booking_date DATE,
            start_time TIME,
            end_time TIME,
            status TEXT DEFAULT 'confirmed',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (member_id) REFERENCES members (id)
        )
    """)
    
    # Campaigns/Marketing
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS campaigns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            campaign_type TEXT,
            status TEXT DEFAULT 'draft',
            audience TEXT,
            content TEXT,
            scheduled_date TIMESTAMP,
            sent_count INTEGER DEFAULT 0,
            open_count INTEGER DEFAULT 0,
            click_count INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Insert default admin user
    hashed_password = pwd_context.hash("squash2026")
    cursor.execute("""
        INSERT OR IGNORE INTO users (email, hashed_password, full_name, role)
        VALUES (?, ?, ?, ?)
    """, ("admin@squash-excellence.com", hashed_password, "Admin User", "admin"))
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# Pydantic Models
class User(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "user"
    is_active: bool = True

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class MemberBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    membership_type: str = "standard"
    status: str = "active"
    join_date: Optional[str] = None
    expiry_date: Optional[str] = None
    notes: Optional[str] = None

class MemberCreate(MemberBase):
    pass

class Member(MemberBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProgramBase(BaseModel):
    name: str
    description: Optional[str] = None
    program_type: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    max_participants: Optional[int] = None
    status: str = "upcoming"

class ProgramCreate(ProgramBase):
    pass

class Program(ProgramBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class CampaignBase(BaseModel):
    name: str
    campaign_type: Optional[str] = "email"
    status: Optional[str] = "draft"
    audience: Optional[str] = None
    content: Optional[str] = None
    scheduled_date: Optional[str] = None

class CampaignCreate(CampaignBase):
    pass

class Campaign(CampaignBase):
    id: int
    sent_count: int = 0
    open_count: int = 0
    click_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db: sqlite3.Connection, email: str):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    if user:
        return UserInDB(**dict(user))
    return None

def authenticate_user(db: sqlite3.Connection, email: str, password: str):
    user = get_user(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: sqlite3.Connection = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = get_user(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Auth Routes
@api_router.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: sqlite3.Connection = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/auth/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# Dashboard Stats
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_active_user), db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    # Total members
    cursor.execute("SELECT COUNT(*) as count FROM members")
    total_members = cursor.fetchone()["count"]
    
    # Active members
    cursor.execute("SELECT COUNT(*) as count FROM members WHERE status = 'active'")
    active_members = cursor.fetchone()["count"]
    
    # Today's bookings
    today = datetime.now().strftime("%Y-%m-%d")
    cursor.execute("SELECT COUNT(*) as count FROM bookings WHERE booking_date = ?", (today,))
    today_bookings = cursor.fetchone()["count"]
    
    # Upcoming programs
    cursor.execute("SELECT COUNT(*) as count FROM programs WHERE status = 'upcoming'")
    upcoming_programs = cursor.fetchone()["count"]
    
    # Recent members (last 5)
    cursor.execute("SELECT * FROM members ORDER BY created_at DESC LIMIT 5")
    recent_members = [dict(row) for row in cursor.fetchall()]
    
    # Recent bookings (last 5)
    cursor.execute("""
        SELECT b.*, m.first_name, m.last_name 
        FROM bookings b 
        LEFT JOIN members m ON b.member_id = m.id 
        ORDER BY b.created_at DESC LIMIT 5
    """)
    recent_bookings = [dict(row) for row in cursor.fetchall()]
    
    return {
        "total_members": total_members,
        "active_members": active_members,
        "today_bookings": today_bookings,
        "upcoming_programs": upcoming_programs,
        "recent_members": recent_members,
        "recent_bookings": recent_bookings
    }

# Members Routes
@api_router.get("/members", response_model=List[Member])
async def get_members(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    if search:
        cursor.execute("""
            SELECT * FROM members 
            WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?
            ORDER BY created_at DESC LIMIT ? OFFSET ?
        """, (f"%{search}%", f"%{search}%", f"%{search}%", limit, skip))
    else:
        cursor.execute("SELECT * FROM members ORDER BY created_at DESC LIMIT ? OFFSET ?", (limit, skip))
    members = [dict(row) for row in cursor.fetchall()]
    return members

@api_router.post("/members", response_model=Member)
async def create_member(
    member: MemberCreate,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO members (first_name, last_name, email, phone, membership_type, status, join_date, expiry_date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        member.first_name, member.last_name, member.email, member.phone,
        member.membership_type, member.status, member.join_date, member.expiry_date, member.notes
    ))
    db.commit()
    member_id = cursor.lastrowid
    cursor.execute("SELECT * FROM members WHERE id = ?", (member_id,))
    return dict(cursor.fetchone())

@api_router.get("/members/{member_id}", response_model=Member)
async def get_member(
    member_id: int,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM members WHERE id = ?", (member_id,))
    member = cursor.fetchone()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return dict(member)

@api_router.put("/members/{member_id}", response_model=Member)
async def update_member(
    member_id: int,
    member: MemberCreate,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("""
        UPDATE members 
        SET first_name = ?, last_name = ?, email = ?, phone = ?, 
            membership_type = ?, status = ?, join_date = ?, expiry_date = ?, notes = ?
        WHERE id = ?
    """, (
        member.first_name, member.last_name, member.email, member.phone,
        member.membership_type, member.status, member.join_date, member.expiry_date, member.notes,
        member_id
    ))
    db.commit()
    cursor.execute("SELECT * FROM members WHERE id = ?", (member_id,))
    updated = cursor.fetchone()
    if not updated:
        raise HTTPException(status_code=404, detail="Member not found")
    return dict(updated)

@api_router.delete("/members/{member_id}")
async def delete_member(
    member_id: int,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("DELETE FROM members WHERE id = ?", (member_id,))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Member deleted successfully"}

# Programs Routes
@api_router.get("/programs", response_model=List[Program])
async def get_programs(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM programs ORDER BY created_at DESC LIMIT ? OFFSET ?", (limit, skip))
    return [dict(row) for row in cursor.fetchall()]

@api_router.post("/programs", response_model=Program)
async def create_program(
    program: ProgramCreate,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO programs (name, description, program_type, start_date, end_date, max_participants, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        program.name, program.description, program.program_type,
        program.start_date, program.end_date, program.max_participants, program.status
    ))
    db.commit()
    program_id = cursor.lastrowid
    cursor.execute("SELECT * FROM programs WHERE id = ?", (program_id,))
    return dict(cursor.fetchone())

@api_router.get("/programs/{program_id}", response_model=Program)
async def get_program(
    program_id: int,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM programs WHERE id = ?", (program_id,))
    program = cursor.fetchone()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return dict(program)

@api_router.put("/programs/{program_id}", response_model=Program)
async def update_program(
    program_id: int,
    program: ProgramCreate,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("""
        UPDATE programs 
        SET name = ?, description = ?, program_type = ?, start_date = ?, end_date = ?, max_participants = ?, status = ?
        WHERE id = ?
    """, (
        program.name, program.description, program.program_type,
        program.start_date, program.end_date, program.max_participants, program.status,
        program_id
    ))
    db.commit()
    cursor.execute("SELECT * FROM programs WHERE id = ?", (program_id,))
    updated = cursor.fetchone()
    if not updated:
        raise HTTPException(status_code=404, detail="Program not found")
    return dict(updated)

@api_router.delete("/programs/{program_id}")
async def delete_program(
    program_id: int,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("DELETE FROM programs WHERE id = ?", (program_id,))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Program not found")
    return {"message": "Program deleted successfully"}

# Bookings Routes
@api_router.get("/bookings")
async def get_bookings(
    skip: int = 0,
    limit: int = 100,
    date: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    if date:
        cursor.execute("""
            SELECT b.*, m.first_name, m.last_name 
            FROM bookings b 
            LEFT JOIN members m ON b.member_id = m.id 
            WHERE b.booking_date = ?
            ORDER BY b.start_time LIMIT ? OFFSET ?
        """, (date, limit, skip))
    else:
        cursor.execute("""
            SELECT b.*, m.first_name, m.last_name 
            FROM bookings b 
            LEFT JOIN members m ON b.member_id = m.id 
            ORDER BY b.booking_date DESC, b.start_time LIMIT ? OFFSET ?
        """, (limit, skip))
    return [dict(row) for row in cursor.fetchall()]

@api_router.post("/bookings")
async def create_booking(
    booking: dict,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO bookings (member_id, court_number, booking_date, start_time, end_time, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        booking.get("member_id"), booking.get("court_number"), booking.get("booking_date"),
        booking.get("start_time"), booking.get("end_time"), booking.get("status", "confirmed"), booking.get("notes")
    ))
    db.commit()
    booking_id = cursor.lastrowid
    cursor.execute("SELECT * FROM bookings WHERE id = ?", (booking_id,))
    return dict(cursor.fetchone())

@api_router.delete("/bookings/{booking_id}")
async def delete_booking(
    booking_id: int,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("DELETE FROM bookings WHERE id = ?", (booking_id,))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking deleted successfully"}

# Campaigns/Marketing Routes
@api_router.get("/campaigns", response_model=List[Campaign])
async def get_campaigns(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM campaigns ORDER BY created_at DESC LIMIT ? OFFSET ?", (limit, skip))
    return [dict(row) for row in cursor.fetchall()]

@api_router.post("/campaigns", response_model=Campaign)
async def create_campaign(
    campaign: CampaignCreate,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO campaigns (name, campaign_type, status, audience, content, scheduled_date)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        campaign.name, campaign.campaign_type, campaign.status,
        campaign.audience, campaign.content, campaign.scheduled_date
    ))
    db.commit()
    campaign_id = cursor.lastrowid
    cursor.execute("SELECT * FROM campaigns WHERE id = ?", (campaign_id,))
    return dict(cursor.fetchone())

@api_router.put("/campaigns/{campaign_id}")
async def update_campaign(
    campaign_id: int,
    campaign: CampaignCreate,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("""
        UPDATE campaigns 
        SET name = ?, campaign_type = ?, status = ?, audience = ?, content = ?, scheduled_date = ?
        WHERE id = ?
    """, (
        campaign.name, campaign.campaign_type, campaign.status,
        campaign.audience, campaign.content, campaign.scheduled_date,
        campaign_id
    ))
    db.commit()
    cursor.execute("SELECT * FROM campaigns WHERE id = ?", (campaign_id,))
    updated = cursor.fetchone()
    if not updated:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return dict(updated)

@api_router.delete("/campaigns/{campaign_id}")
async def delete_campaign(
    campaign_id: int,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("DELETE FROM campaigns WHERE id = ?", (campaign_id,))
    db.commit()
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"message": "Campaign deleted successfully"}

# ============================================================
# FRONTEND ALIASES - Maps frontend route names to backend data
# ============================================================

# Tournaments -> Programs
@api_router.get("/tournaments", response_model=List[Program])
async def get_tournaments(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    return await get_programs(skip=skip, limit=limit, current_user=current_user, db=db)

@api_router.get("/tournaments/{program_id}", response_model=Program)
async def get_tournament(
    program_id: int,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    return await get_program(program_id=program_id, current_user=current_user, db=db)

@api_router.post("/tournaments", response_model=Program)
async def create_tournament(
    program: ProgramCreate,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    return await create_program(program=program, current_user=current_user, db=db)

@api_router.put("/tournaments/{program_id}", response_model=Program)
async def update_tournament(
    program_id: int,
    program: ProgramCreate,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    return await update_program(program_id=program_id, program=program, current_user=current_user, db=db)

@api_router.delete("/tournaments/{program_id}")
async def delete_tournament(
    program_id: int,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    return await delete_program(program_id=program_id, current_user=current_user, db=db)

# Athletes -> Members
@api_router.get("/athletes", response_model=List[Member])
async def get_athletes(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    return await get_members(skip=skip, limit=limit, search=search, current_user=current_user, db=db)

@api_router.get("/athletes/{member_id}", response_model=Member)
async def get_athlete(
    member_id: int,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    return await get_member(member_id=member_id, current_user=current_user, db=db)

@api_router.post("/athletes", response_model=Member)
async def create_athlete(
    member: MemberCreate,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    return await create_member(member=member, current_user=current_user, db=db)

@api_router.put("/athletes/{member_id}", response_model=Member)
async def update_athlete(
    member_id: int,
    member: MemberCreate,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    return await update_member(member_id=member_id, member=member, current_user=current_user, db=db)

@api_router.delete("/athletes/{member_id}")
async def delete_athlete(
    member_id: int,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    return await delete_member(member_id=member_id, current_user=current_user, db=db)

# Finance -> Bookings (using bookings as financial records)
@api_router.get("/finance")
async def get_finance(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    return await get_bookings(skip=skip, limit=limit, current_user=current_user, db=db)

# Stakeholders -> Members (subset view)
@api_router.get("/stakeholders", response_model=List[Member])
async def get_stakeholders(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    return await get_members(skip=skip, limit=limit, current_user=current_user, db=db)

# Tournament dashboard stats alias
@api_router.get("/tournaments/dashboard/stats")
async def get_tournament_stats(
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    return await get_dashboard_stats(current_user=current_user, db=db)

# Tournament calendar alias
@api_router.get("/tournaments/calendar/upcoming")
async def get_tournament_calendar(
    current_user: User = Depends(get_current_active_user),
    db: sqlite3.Connection = Depends(get_db)
):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM programs WHERE status = 'upcoming' ORDER BY start_date LIMIT 10")
    return [dict(row) for row in cursor.fetchall()]

# Include the router
app.include_router(api_router)

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Squash Excellence CRM API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)