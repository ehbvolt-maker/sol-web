import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:3000"

endpoints = [
    ("/api/ping", "GET"),
    ("/api/leads", "GET"),
    ("/api/gallery", "GET"),
    ("/api/whatsapp/chats", "GET"),
    ("/api/appointments", "GET"),
    ("/api/voice-calls", "GET"),
    ("/api/webhook/facebook", "GET"),
    ("/api/webhook/whatsapp", "GET"),
    ("/api/marketing/avatars", "GET"),
    ("/api/marketing/videos", "GET"),
]

print("=== VERIFICACIÓN DE TODOS LOS ENDPOINTS DEL BACKEND ===")
passed = 0
failed = 0

for ep, method in endpoints:
    url = f"{BASE_URL}{ep}"
    try:
        req = urllib.request.Request(url, method=method)
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f"[OK 200] {method} {ep}")
            passed += 1
    except urllib.error.HTTPError as e:
        print(f"[HTTP {e.code}] {method} {ep} - {e.reason}")
        failed += 1
    except Exception as e:
        print(f"[FAIL] {method} {ep} - {str(e)}")
        failed += 1

print(f"\nResumen: {passed} PASADOS | {failed} FALLADOS")
