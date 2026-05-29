"""Seed initial data for the Squash Excellence Program."""
import requests
import json
from datetime import datetime, timedelta

BASE_URL = "https://legendary-space-yodel-wrwp79rw4xj5cpwg-8000.app.github.dev/api/v1"

def seed():
    # Create default user
    print("Creating default user...")
    try:
        requests.post(f"{BASE_URL}/auth/seed")
        print("✅ Default user created: admin@squash-excellence.com / squash2026")
    except Exception as e:
        print(f"User may already exist: {e}")

    # Login to get token
    print("\nAuthenticating...")
    auth_res = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": "admin@squash-excellence.com", "password": "squash2026"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    token = auth_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    print("✅ Authenticated")

    # Set budget
    print("\nSetting budget...")
    budget_data = {
        "fiscal_year": "2025-26",
        "total_annual_budget": 2500000,
        "tournaments_budget": 800000,
        "clinics_budget": 300000,
        "athlete_program_budget": 600000,
        "marketing_budget": 200000,
        "operations_budget": 400000,
        "coach_salary_monthly": 45000,
        "club_revenue_split": 20,
        "akash_retainer": 15000
    }
    requests.post(f"{BASE_URL}/finance/budgets", json=budget_data, headers=headers)
    print("✅ Budget set")

    # Create tournaments
    print("\nCreating tournaments...")
    tournaments = [
        {
            "name": "International Camp with Andrew Shoukry",
            "event_type": "international_camp",
            "status": "approved",
            "start_date": (datetime(2026, 6, 15)).isoformat(),
            "end_date": (datetime(2026, 6, 22)).isoformat(),
            "venue": "JVPG Club",
            "city": "Mumbai",
            "state": "Maharashtra",
            "guest_coach_name": "Andrew Shoukry",
            "guest_coach_origin": "Egypt",
            "clinic_days": 7,
            "clinic_pre_event": False,
            "budget_allocated": 350000,
            "budget_spent": 280000,
            "expected_players": 40,
            "registered_players": 38,
            "risk_level": "green",
            "notes": "Egypt Junior National Coach. Kunwar Pal coordinating logistics."
        },
        {
            "name": "Gujarat State Closed Championship",
            "event_type": "state_championship",
            "status": "srfi_approval_pending",
            "start_date": (datetime(2026, 7, 10)).isoformat(),
            "end_date": (datetime(2026, 7, 13)).isoformat(),
            "venue": "Sports Club",
            "city": "Ahmedabad",
            "state": "Gujarat",
            "srfi_star_rating": 1,
            "srfi_approval_status": "pending",
            "budget_allocated": 120000,
            "expected_players": 80,
            "registered_players": 45,
            "risk_level": "amber",
            "notes": "SRFI approval pending. Need to follow up with state association for logo usage."
        },
        {
            "name": "PSA Satellite",
            "event_type": "psa_satellite",
            "status": "planning",
            "start_date": (datetime(2026, 8, 5)).isoformat(),
            "end_date": (datetime(2026, 8, 9)).isoformat(),
            "venue": "Sports Club",
            "city": "Ahmedabad",
            "state": "Gujarat",
            "srfi_star_rating": 3,
            "srfi_approval_status": "pending",
            "budget_allocated": 500000,
            "expected_players": 60,
            "registered_players": 0,
            "risk_level": "green",
            "notes": "3 Star PSA Satellite. Major event for Gujarat squash visibility."
        },
        {
            "name": "Baroda Squash Open",
            "event_type": "open_tournament",
            "status": "planning",
            "start_date": (datetime(2026, 9, 12)).isoformat(),
            "end_date": (datetime(2026, 9, 15)).isoformat(),
            "venue": "Baroda Shakti Sports",
            "city": "Vadodara",
            "state": "Gujarat",
            "srfi_star_rating": 2,
            "guest_coach_name": "TBD",
            "guest_coach_origin": "Mumbai",
            "clinic_days": 2,
            "clinic_pre_event": True,
            "budget_allocated": 200000,
            "expected_players": 70,
            "registered_players": 0,
            "risk_level": "green",
            "notes": "2-day pre-tournament clinic with coach from Mumbai. Coordinate with Kunwar Pal."
        },
        {
            "name": "Rajkot Regional (AGSRA Event)",
            "event_type": "regional_event",
            "status": "planning",
            "start_date": (datetime(2026, 10, 18)).isoformat(),
            "end_date": (datetime(2026, 10, 20)).isoformat(),
            "venue": "HRC College / TGES School",
            "city": "Rajkot",
            "state": "Gujarat",
            "budget_allocated": 150000,
            "expected_players": 50,
            "registered_players": 0,
            "risk_level": "green",
            "notes": "AGSRA regional event. Need to confirm venue availability."
        },
        {
            "name": "Ahmedabad Squash Open",
            "event_type": "open_tournament",
            "status": "planning",
            "start_date": (datetime(2026, 12, 5)).isoformat(),
            "end_date": (datetime(2026, 12, 8)).isoformat(),
            "venue": "Sports Club",
            "city": "Ahmedabad",
            "state": "Gujarat",
            "srfi_star_rating": 2,
            "budget_allocated": 250000,
            "expected_players": 90,
            "registered_players": 0,
            "risk_level": "green",
            "notes": "Year-end flagship event at Sports Club. Rent-free court access confirmed."
        }
    ]

    for t in tournaments:
        res = requests.post(f"{BASE_URL}/tournaments/", json=t, headers=headers)
        if res.status_code == 200:
            print(f"  ✅ {t['name']}")
        else:
            print(f"  ❌ {t['name']}: {res.text}")

    # Create athletes
    print("\nCreating athletes...")
    athletes = [
        {
            "full_name": "Arjun Patel",
            "hometown": "Ahmedabad",
            "state": "Gujarat",
            "status": "active",
            "tier": "elite",
            "monthly_stipend": 25000,
            "equipment_budget": 50000,
            "travel_budget": 75000,
            "total_funded": 300000,
            "psa_ranking": 245,
            "srfi_ranking": 12,
            "tournaments_played": 8,
            "tournaments_won": 2,
            "jersey_compliance": True,
            "social_media_tags": "@arjunpatel_sq",
            "bio": "Top-ranked Gujarat player, active on PSA circuit"
        },
        {
            "full_name": "Priya Sharma",
            "hometown": "Vadodara",
            "state": "Gujarat",
            "status": "active",
            "tier": "development",
            "monthly_stipend": 15000,
            "equipment_budget": 30000,
            "travel_budget": 40000,
            "total_funded": 150000,
            "srfi_ranking": 28,
            "tournaments_played": 5,
            "tournaments_won": 1,
            "jersey_compliance": True,
            "bio": "Rising star from Baroda, strong technical foundation"
        },
        {
            "full_name": "Rahul Mehta",
            "hometown": "Rajkot",
            "state": "Gujarat",
            "status": "trial",
            "tier": "emerging",
            "monthly_stipend": 8000,
            "tournaments_played": 2,
            "jersey_compliance": True,
            "bio": "New prospect from Rajkot regional program"
        },
        {
            "full_name": "Sneha Iyer",
            "hometown": "Mumbai",
            "state": "Maharashtra",
            "status": "active",
            "tier": "premier",
            "monthly_stipend": 40000,
            "equipment_budget": 75000,
            "travel_budget": 100000,
            "total_funded": 500000,
            "psa_ranking": 156,
            "national_ranking": 8,
            "tournaments_played": 12,
            "tournaments_won": 4,
            "jersey_compliance": True,
            "social_media_tags": "@snehaiyer",
            "bio": "Premier athlete, national team prospect"
        }
    ]

    for a in athletes:
        res = requests.post(f"{BASE_URL}/athletes/", json=a, headers=headers)
        if res.status_code == 200:
            print(f"  ✅ {a['full_name']}")
        else:
            print(f"  ❌ {a['full_name']}: {res.text}")

    # Create stakeholders
    print("\nCreating stakeholders...")
    stakeholders = [
        {
            "name": "Gujarat State Squash Association",
            "stakeholder_type": "state_association",
            "organization": "GSSA",
            "primary_contact": "Secretary",
            "email": "secretary@gssa.in",
            "is_active_partner": True,
            "mou_start_date": (datetime(2025, 1, 1)).isoformat(),
            "mou_end_date": (datetime(2028, 12, 31)).isoformat(),
            "mou_status": "active",
            "notes": "3-year MOU active. Passive operationally but critical for approvals."
        },
        {
            "name": "Sports Club of Gujarat",
            "stakeholder_type": "club_partner",
            "organization": "Sports Club Gujarat",
            "primary_contact": "Club Manager",
            "email": "manager@sportsclubgujarat.com",
            "is_active_partner": True,
            "mou_status": "active",
            "revenue_share_percent": 20,
            "fixed_cost_monthly": 0,
            "notes": "80/20 revenue split. Rent-free court access for tournaments. 1 coach stationed."
        },
        {
            "name": "Kunwar Pal",
            "stakeholder_type": "coach",
            "primary_contact": "Kunwar Pal",
            "email": "kunwar@squash-excellence.com",
            "is_active_partner": True,
            "notes": "Technical & operational heartbeat. Manages coaches, player backgrounds, tournament logistics, SRFI approvals."
        },
        {
            "name": "Akash (Freelance)",
            "stakeholder_type": "media",
            "organization": "Freelance",
            "primary_contact": "Akash",
            "email": "akash@socialmedia.in",
            "is_active_partner": True,
            "fixed_cost_monthly": 15000,
            "notes": "Social media manager on freelance retainer. Manages all platform content."
        }
    ]

    for s in stakeholders:
        res = requests.post(f"{BASE_URL}/stakeholders/", json=s, headers=headers)
        if res.status_code == 200:
            print(f"  ✅ {s['name']}")
        else:
            print(f"  ❌ {s['name']}: {res.text}")

    # Create transactions
    print("\nCreating sample transactions...")
    transactions = [
        {"description": "Andrew Shoukry camp fees", "amount": 200000, "transaction_type": "expense", "category": "coach_fees", "vendor_payee": "Andrew Shoukry", "transaction_date": (datetime(2026, 5, 20)).isoformat()},
        {"description": "JVPG Club venue booking", "amount": 80000, "transaction_type": "expense", "category": "venue", "vendor_payee": "JVPG Club Mumbai", "transaction_date": (datetime(2026, 5, 18)).isoformat()},
        {"description": "Arjun Patel monthly stipend - May", "amount": 25000, "transaction_type": "expense", "category": "athlete_sponsorship", "vendor_payee": "Arjun Patel", "transaction_date": (datetime(2026, 5, 1)).isoformat()},
        {"description": "Sneha Iyer monthly stipend - May", "amount": 40000, "transaction_type": "expense", "category": "athlete_sponsorship", "vendor_payee": "Sneha Iyer", "transaction_date": (datetime(2026, 5, 1)).isoformat()},
        {"description": "Sports Club coach salary - May", "amount": 45000, "transaction_type": "expense", "category": "coach_fees", "vendor_payee": "Sports Club", "transaction_date": (datetime(2026, 5, 1)).isoformat()},
        {"description": "Akash social media retainer - May", "amount": 15000, "transaction_type": "expense", "category": "marketing", "vendor_payee": "Akash", "transaction_date": (datetime(2026, 5, 1)).isoformat()},
        {"description": "Gujarat State Championship registration fees", "amount": 45000, "transaction_type": "income", "category": "registration", "transaction_date": (datetime(2026, 5, 25)).isoformat()},
    ]

    for tx in transactions:
        res = requests.post(f"{BASE_URL}/finance/transactions", json=tx, headers=headers)
        if res.status_code == 200:
            print(f"  ✅ {tx['description']}")
        else:
            print(f"  ❌ {tx['description']}: {res.text}")

    print("\n🎉 Seed complete! Access the dashboard at http://localhost:3000")
    print("   Login: admin@squash-excellence.com / squash2026")

if __name__ == "__main__":
    seed()
