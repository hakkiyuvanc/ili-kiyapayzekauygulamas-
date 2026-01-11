"""Test script - Auth ve Database"""

import sys

sys.path.insert(0, ".")


import requests

BASE_URL = "http://127.0.0.1:8000/api"


def test_auth_flow():
    """Auth akışını test et"""
    print("=" * 70)
    print("AUTHENTİCATİON & DATABASE TEST")
    print("=" * 70)
    print()

    # 1. Kullanıcı kaydı
    print("1️⃣  Yeni kullanıcı kaydı...")
    register_data = {
        "email": "test@example.com",
        "password": "test123456",
        "full_name": "Test User",
        "username": "testuser",
    }

    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        if response.status_code == 201:
            user = response.json()
            print(f"   ✅ Kullanıcı oluşturuldu: {user['email']}")
        elif response.status_code == 400:
            print("   ℹ️  Kullanıcı zaten mevcut")
        else:
            print(f"   ❌ Hata: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Bağlantı hatası: {e}")
        return

    print()

    # 2. Login
    print("2️⃣  Kullanıcı girişi...")
    login_data = {"email": "test@example.com", "password": "test123456"}

    try:
        response = requests.post(f"{BASE_URL}/auth/login-json", json=login_data)
        if response.status_code == 200:
            token_data = response.json()
            token = token_data["access_token"]
            print(f"   ✅ Token alındı: {token[:30]}...")
        else:
            print(f"   ❌ Login başarısız: {response.status_code}")
            return
    except Exception as e:
        print(f"   ❌ Hata: {e}")
        return

    print()

    # 3. Profil bilgisi
    print("3️⃣  Profil bilgisi çekiliyor...")
    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        if response.status_code == 200:
            user = response.json()
            print(f"   ✅ Profil: {user['full_name']} ({user['email']})")
        else:
            print(f"   ❌ Hata: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Hata: {e}")

    print()

    # 4. Analiz yap (database'e kaydet)
    print("4️⃣  Analiz yapılıyor ve database'e kaydediliyor...")
    analysis_data = {
        "text": "Ahmet: Merhaba canım!\nAyşe: Merhaba aşkım, nasılsın?",
        "format_type": "simple",
        "privacy_mode": True,
    }

    try:
        response = requests.post(f"{BASE_URL}/analysis/analyze?save_to_db=true", json=analysis_data)
        if response.status_code == 200:
            result = response.json()
            analysis_id = result.get("analysis_id")
            overall_score = result.get("overall_score")
            print(f"   ✅ Analiz tamamlandı: ID={analysis_id}, Skor={overall_score:.1f}/100")
        else:
            print(f"   ❌ Analiz hatası: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Hata: {e}")

    print()

    # 5. Analiz geçmişi
    print("5️⃣  Analiz geçmişi çekiliyor...")

    try:
        response = requests.get(f"{BASE_URL}/analysis/history?limit=5")
        if response.status_code == 200:
            data = response.json()
            count = data.get("total", 0)
            print(f"   ✅ {count} analiz kaydı bulundu")
            for analysis in data.get("analyses", [])[:3]:
                print(f"      - ID: {analysis['id']}, Skor: {analysis['overall_score']:.1f}")
        else:
            print(f"   ❌ Hata: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Hata: {e}")

    print()
    print("=" * 70)
    print("✅ Test tamamlandı!")
    print()


if __name__ == "__main__":
    test_auth_flow()
