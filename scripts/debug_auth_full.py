import requests

BASE_URL = "http://localhost:8000"


def debug_auth():
    print("-" * 50)
    print("DEBUGGING AUTH FLOW")
    print("-" * 50)

    # 1. Login
    print("1. Attempting Login...")
    payload = {
        "username": "test@pro.com",
        "password": "test1234",
    }  # Ensure this user exists and is verified!
    # If not sure, use a known user or create one.

    # Try with a known test user if previous scripts made one
    # Or create a new one

    try:
        resp = requests.post(f"{BASE_URL}/api/auth/login", data=payload)
    except Exception as e:
        print(f"Login connection failure: {e}")
        return

    if resp.status_code != 200:
        print(f"Login Failed: {resp.status_code} - {resp.text}")
        if resp.status_code == 403:
            print("User not verified.")
        return

    data = resp.json()
    token = data.get("access_token")
    print(f"Login Success. Token: {token[:20]}...")

    # 2. Get Profile (Me)
    print("\n2. Attempting /me endpoint...")
    headers = {"Authorization": f"Bearer {token}"}

    try:
        me_resp = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    except Exception as e:
        print(f"Me connection failure: {e}")
        return

    if me_resp.status_code != 200:
        print(f"Get Profile Failed: {me_resp.status_code} - {me_resp.text}")
        print("CRITICAL: Backend is rejecting the token it just issued!")
    else:
        print("Get Profile Success!")
        print(me_resp.json())

    print("-" * 50)


if __name__ == "__main__":
    debug_auth()
