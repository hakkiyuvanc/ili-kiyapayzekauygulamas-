#!/usr/bin/env python3
"""Create a simple test user"""
import sqlite3

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

db_path = "/Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-/iliski_analiz.db"

# Simple credentials
email = "demo@test.com"
password = "demo123"
full_name = "Demo User"

# Hash the password
hashed_password = pwd_context.hash(password)

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if user exists
cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
existing = cursor.fetchone()

if existing:
    # Update existing user
    cursor.execute(
        """
        UPDATE users
        SET hashed_password = ?,
            is_verified = 1,
            is_active = 1,
            full_name = ?
        WHERE email = ?
    """,
        (hashed_password, full_name, email),
    )
    print(f"✅ Updated existing user: {email}")
else:
    # Create new user
    cursor.execute(
        """
        INSERT INTO users (email, hashed_password, full_name, is_verified, is_active, created_at)
        VALUES (?, ?, ?, 1, 1, datetime('now'))
    """,
        (email, hashed_password, full_name),
    )
    print(f"✅ Created new user: {email}")

conn.commit()

# Verify it was saved correctly
cursor.execute(
    "SELECT email, is_verified, is_active, full_name FROM users WHERE email = ?", (email,)
)
user = cursor.fetchone()

if user:
    print("\n📋 User details:")
    print(f"   Email: {user[0]}")
    print(f"   Verified: {bool(user[1])}")
    print(f"   Active: {bool(user[2])}")
    print(f"   Full name: {user[3]}")

    # Test the password
    cursor.execute("SELECT hashed_password FROM users WHERE email = ?", (email,))
    hash_result = cursor.fetchone()
    if hash_result and pwd_context.verify(password, hash_result[0]):
        print("\n✅ Password verification: SUCCESS")
    else:
        print("\n❌ Password verification: FAILED")

conn.close()

print("\n🔐 Login credentials:")
print(f"   Email: {email}")
print(f"   Password: {password}")
