#!/usr/bin/env python3
"""Test the auth flow"""
import requests
import json

BASE_URL = "http://localhost:8000"

# 1. Login
print("1. Attempting login...")
login_response = requests.post(
    f"{BASE_URL}/api/auth/login",
    data={
        "username": "demo@test.com",
        "password": "demo123"
    },
    headers={"Content-Type": "application/x-www-form-urlencoded"}
)

print(f"   Status: {login_response.status_code}")
if login_response.status_code == 200:
    login_data = login_response.json()
    print(f"   ✅ Login successful!")
    print(f"   Token: {login_data['access_token'][:50]}...")
    
    # 2. Get profile
    print("\n2. Getting user profile...")
    token = login_data['access_token']
    profile_response = requests.get(
        f"{BASE_URL}/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"   Status: {profile_response.status_code}")
    print(f"   Response headers: {dict(profile_response.headers)}")
    print(f"   Response text length: {len(profile_response.text)}")
    print(f"   Response text: {profile_response.text}")
    
    if profile_response.status_code == 200:
        try:
            profile_data = profile_response.json()
            print(f"   ✅ Profile retrieved!")
            print(f"   User data: {json.dumps(profile_data, indent=2)}")
        except Exception as e:
            print(f"   ❌ Failed to parse JSON: {e}")
    else:
        print(f"   ❌ Profile request failed: {profile_response.text}")
else:
    print(f"   ❌ Login failed: {login_response.text}")
