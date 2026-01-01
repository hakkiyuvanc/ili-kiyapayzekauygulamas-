"""File Upload Test Script"""

import requests
import os

BASE_URL = "http://127.0.0.1:8000"


def test_supported_formats():
    """Test getting supported formats"""
    print("\n=== Desteklenen Dosya Formatları ===")
    response = requests.get(f"{BASE_URL}/api/upload/supported-formats")
    print(f"Status: {response.status_code}")
    
    if response.ok:
        data = response.json()
        print(f"Max Size: {data['max_size_mb']}MB")
        print("\nFormatlar:")
        for fmt in data['formats']:
            print(f"  {fmt['extension']} - {fmt['name']}: {fmt['description']}")
    else:
        print(f"Error: {response.text}")


def test_file_upload():
    """Test simple file upload"""
    print("\n=== Dosya Yükleme Testi ===")
    
    # Create test file
    test_content = """Ali: Merhaba nasılsın?
Ayşe: İyiyim sen nasılsın?
Ali: Ben de iyiyim teşekkür ederim
Ayşe: Bugün hava çok güzel
Ali: Evet haklısın, dışarı çıkmayı düşünüyor musun?
Ayşe: Evet, belki akşam yürüyüşe çıkarız
Ali: Harika fikir! Saat kaçta müsaitsin?
Ayşe: 18:00 civarı uygun olur
Ali: Tamam o zaman görüşürüz
Ayşe: Görüşürüz :)"""
    
    # Write to temp file
    temp_file = "test_conversation.txt"
    with open(temp_file, "w", encoding="utf-8") as f:
        f.write(test_content)
    
    try:
        # Upload file
        with open(temp_file, "rb") as f:
            files = {"file": (temp_file, f, "text/plain")}
            response = requests.post(f"{BASE_URL}/api/upload/upload", files=files)
        
        print(f"Status: {response.status_code}")
        
        if response.ok:
            data = response.json()
            print(f"Filename: {data['filename']}")
            print(f"Size: {data['size']} bytes")
            print(f"Format: {data['format_detected']}")
            print(f"Messages: {data.get('message_count', 'N/A')}")
            print(f"Preview: {data['text_preview'][:100]}...")
        else:
            print(f"Error: {response.text}")
            
    finally:
        # Cleanup
        if os.path.exists(temp_file):
            os.remove(temp_file)


def test_upload_and_analyze():
    """Test upload and analyze"""
    print("\n=== Dosya Yükle ve Analiz Et ===")
    
    # Create WhatsApp-like conversation
    whatsapp_content = """25/12/2024, 14:30 - Ali: Merhaba canım nasılsın?
25/12/2024, 14:31 - Ayşe: İyiyim aşkım sen nasılsın?
25/12/2024, 14:32 - Ali: Ben de çok iyiyim, seni özledim
25/12/2024, 14:33 - Ayşe: Ben de seni çok özledim bebeğim
25/12/2024, 14:35 - Ali: Akşam buluşalım mı?
25/12/2024, 14:36 - Ayşe: Tabii ki! Nerede buluşalım?
25/12/2024, 14:37 - Ali: Her zamanki yerimizde olur mu?
25/12/2024, 14:38 - Ayşe: Mükemmel! Saat kaçta?
25/12/2024, 14:40 - Ali: 19:00'da nasıl?
25/12/2024, 14:41 - Ayşe: Harika! Görüşürüz o zaman ❤️
25/12/2024, 14:42 - Ali: Görüşürüz canım ❤️"""
    
    temp_file = "test_whatsapp.txt"
    with open(temp_file, "w", encoding="utf-8") as f:
        f.write(whatsapp_content)
    
    try:
        # Upload and analyze
        with open(temp_file, "rb") as f:
            files = {"file": (temp_file, f, "text/plain")}
            response = requests.post(
                f"{BASE_URL}/api/upload/upload-and-analyze",
                files=files,
                params={"privacy_mode": True, "save_to_db": True}
            )
        
        print(f"Status: {response.status_code}")
        
        if response.ok:
            data = response.json()
            print(f"Analysis ID: {data.get('analysis_id', 'N/A')}")
            print(f"Filename: {data.get('filename', 'N/A')}")
            print(f"\nOverall Score: {data.get('overall_score', 'N/A')}/10")
            
            metrics = data.get('metrics', {})
            print("\nMetrikler:")
            for key, value in metrics.items():
                print(f"  {key}: {value}")
            
            print(f"\nÖzet: {data.get('summary', 'N/A')}")
            
            insights = data.get('insights', [])
            print(f"\nİçgörüler ({len(insights)} adet):")
            for insight in insights[:3]:
                print(f"  - {insight.get('title', 'N/A')}")
                
        else:
            print(f"Error: {response.text}")
            
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)


def test_invalid_file():
    """Test invalid file upload"""
    print("\n=== Geçersiz Dosya Testi ===")
    
    # Create invalid file (wrong extension)
    temp_file = "test.pdf"
    with open(temp_file, "w") as f:
        f.write("Invalid content")
    
    try:
        with open(temp_file, "rb") as f:
            files = {"file": (temp_file, f, "application/pdf")}
            response = requests.post(f"{BASE_URL}/api/upload/upload", files=files)
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)


if __name__ == "__main__":
    print("=" * 50)
    print("File Upload API Test")
    print("=" * 50)
    
    try:
        # Test 1: Get supported formats
        test_supported_formats()
        
        # Test 2: Simple upload
        test_file_upload()
        
        # Test 3: Upload and analyze
        test_upload_and_analyze()
        
        # Test 4: Invalid file
        test_invalid_file()
        
        print("\n" + "=" * 50)
        print("Tüm testler tamamlandı!")
        print("=" * 50)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Server'a bağlanılamıyor!")
        print("Lütfen önce server'ı başlatın: python -m backend.app.main")
    except Exception as e:
        print(f"\n❌ Test hatası: {e}")
        import traceback
        traceback.print_exc()
