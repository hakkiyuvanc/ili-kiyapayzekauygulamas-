#!/usr/bin/env python3
"""Test password verification"""
import sqlite3

from passlib.context import CryptContext

# Initialize password context
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
    print(f"   Hashed password (first 50 chars): {user[1][:50]}...")

    # Test password verification
    print("\n🔐 Testing password verification...")
    print(f"   Password to test: {test_password}")

    try:
        is_valid = pwd_context.verify(test_password, user[1])
        if is_valid:
            print("   ✅ Password verification SUCCESSFUL!")
        else:
            print("   ❌ Password verification FAILED!")
            print(f"   The password '{test_password}' does not match the hash in the database")
    except Exception as e:
        print(f"   ❌ Error during verification: {e}")
else:
    print(f"❌ User {email} not found in database")

conn.close()
