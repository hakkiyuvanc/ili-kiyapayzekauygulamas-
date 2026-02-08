#!/usr/bin/env python3
"""Reset password for test user"""
import sqlite3

from passlib.context import CryptContext

# Initialize password context
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Database path
db_path = "/Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-/iliski_analiz.db"

# User credentials
email = "test@pro.com"
new_password = "test1234"

# Hash the password
hashed_password = pwd_context.hash(new_password)

# Update the database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Update the user's password and ensure they're verified
cursor.execute(
    """
    UPDATE users
    SET hashed_password = ?,
        is_verified = 1,
        is_active = 1
    WHERE email = ?
""",
    (hashed_password, email),
)

conn.commit()

if cursor.rowcount > 0:
    print(f"✅ Password reset successfully for {email}")
    print(f"   New password: {new_password}")
    print("   User is now verified and active")
else:
    print(f"❌ User {email} not found in database")

# Verify the user exists and is set up correctly
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

conn.close()

print("\n🔐 You can now login with:")
print(f"   Email: {email}")
print(f"   Password: {new_password}")
