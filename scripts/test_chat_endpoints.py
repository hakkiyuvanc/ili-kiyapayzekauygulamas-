import requests

BASE_URL = "http://localhost:8000"


def test_chat():
    # 1. Login
    login_resp = requests.post(
        f"{BASE_URL}/api/auth/login", data={"username": "test@pro.com", "password": "test1234"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Session
    print("Creating session...")
    resp = requests.post(
        f"{BASE_URL}/api/chat/sessions", json={"title": "Test Chat"}, headers=headers
    )
    if resp.status_code != 200:
        print("Create session failed:", resp.text)
        return
    session = resp.json()
    sid = session["id"]
    print(f"Session created: {sid}")

    # 3. Send Message
    print("Sending message...")
    msg_resp = requests.post(
        f"{BASE_URL}/api/chat/sessions/{sid}/messages",
        json={"role": "user", "content": "Merhaba, ilişkimde sorunlar var."},
        headers=headers,
    )
    if msg_resp.status_code != 200:
        print("Send message failed:", msg_resp.text)
        return
    print("AI Response:", msg_resp.json()["content"])


if __name__ == "__main__":
    test_chat()
