#!/usr/bin/env python3
"""Debug authentication issue"""
import sqlite3
import sys

sys.path.insert(0, "/Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-")

# Import the exact same password context as the backend
from passlib.context import CryptContext

# This should match backend/app/core/security.py
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Database path
db_path = "/Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-/iliski_analiz.db"

# Test credentials
email = "test@pro.com"
test_password = "test1234"

# Get the user from database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute(
    "SELECT email, hashed_password, is_verified, is_active FROM users WHERE email = ?", (email,)
)
user = cursor.fetchone()

if user:
    print(f"✅ User found: {user[0]}")
    print(f"   Verified: {bool(user[2])}")
    print(f"   Active: {bool(user[3])}")
    print(f"   Hash: {user[1][:80]}...")

    # Test password verification
    print(f"\n🔐 Testing password '{test_password}'...")

    try:
        is_valid = pwd_context.verify(test_password, user[1])
        print(f"   Result: {'✅ VALID' if is_valid else '❌ INVALID'}")

        if not is_valid:
            # Try to identify the issue
            print("\n🔍 Debugging:")
            print(f"   - Password to test: '{test_password}'")
            print(f"   - Password length: {len(test_password)}")
            print(f"   - Hash algorithm: {user[1].split('$')[1] if '$' in user[1] else 'unknown'}")

            # Try some common variations
            variations = [
                "test1234",
                "Test1234",
                "TEST1234",
                " test1234",
                "test1234 ",
            ]

            print("\n   Testing variations:")
            for var in variations:
                try:
                    if pwd_context.verify(var, user[1]):
                        print(f"      ✅ '{var}' WORKS!")
                    else:
                        print(f"      ❌ '{var}' failed")
                except:
                    print(f"      ❌ '{var}' error")

    except Exception as e:
        print(f"   ❌ Error: {e}")
else:
    print(f"❌ User {email} not found")

conn.close()
