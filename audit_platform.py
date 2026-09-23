import urllib.request
import json
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')
BASE_URL = "http://localhost:3000"

def log_result(module, test_name, success, detail):
    status_str = "✅ PASS" if success else "❌ FAIL"
    print(f"[{status_str}] {module} | {test_name}: {detail}")

print("==================================================================")
print("   AUDITORÍA INTEGRAL DE ÁREAS FUNCIONALES DEL CRM SOLAR (SOL)   ")
print("==================================================================")
print(f"Fecha y Hora: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")

passed_count = 0
failed_count = 0

def run_test(module, test_name, fn):
    global passed_count, failed_count
    try:
        ok, msg = fn()
        if ok:
            passed_count += 1
            log_result(module, test_name, True, msg)
        else:
            failed_count += 1
            log_result(module, test_name, False, msg)
    except Exception as e:
        failed_count += 1
        log_result(module, test_name, False, str(e))

# 1. SERVIDOR & HEALTHCHECK
def test_ping():
    req = urllib.request.Request(f"{BASE_URL}/api/ping")
    with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        return resp.status == 200, f"Status 200 - Backend Activo ('{data.get('message', 'ok')}')"

run_test("Servidor Backend", "Healthcheck API (/api/ping)", test_ping)

# 2. DASHBOARD Y FRONTEND
def test_dashboard():
    req = urllib.request.Request(f"{BASE_URL}/dashboard.html")
    with urllib.request.urlopen(req, timeout=5) as resp:
        return resp.status == 200, "Dashboard HTML5 servido correctamente (200 OK)"

run_test("Frontend", "Carga del Dashboard (/dashboard.html)", test_dashboard)

# 3. BASE DE DATOS Y LEADS
def test_leads():
    req = urllib.request.Request(f"{BASE_URL}/api/leads")
    with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        leads = data.get('leads', [])
        return resp.status == 200, f"SQLite Conectado - Total Leads en DB: {len(leads)}"

run_test("Base de Datos & Leads", "Consulta de Leads (/api/leads)", test_leads)

# 4. INTELIGENCIA ARTIFICIAL (OPENAI GPT-4o)
def test_ai_chat():
    payload = json.dumps({"message": "Hola Sol, prueba de auditoría"}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/api/chat-ai", data=payload, headers={'Content-Type': 'application/json'})
    start = time.time()
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        elapsed = round(time.time() - start, 2)
        reply = data.get('response', '')
        return resp.status == 200 and len(reply) > 0, f"GPT-4o respondió en {elapsed}s: '{reply[:60]}...'"

run_test("Inteligencia Artificial", "Motor de IA Sol (/api/chat-ai)", test_ai_chat)

# 5. BOT SIMULADOR DE WHATSAPP
def test_whatsapp_sim():
    payload = json.dumps({"phone": "3050001122", "message": "Consulta de paneles solares"}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/api/whatsapp/simulate", data=payload, headers={'Content-Type': 'application/json'})
    start = time.time()
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        elapsed = round(time.time() - start, 2)
        return resp.status == 200, f"Chatbot WhatsApp activo ({elapsed}s) - Lead ID creado: {data.get('leadState', {}).get('id')}"

run_test("Canales de Mensajería", "Simulador Bot WhatsApp (/api/whatsapp/simulate)", test_whatsapp_sim)

# 6. HISTORIAL DE CHATS WHATSAPP
def test_whatsapp_chats():
    req = urllib.request.Request(f"{BASE_URL}/api/whatsapp/chats")
    with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        chats = data.get('chats', [])
        return resp.status == 200, f"Módulo WhatsApp activo - Total de chats registrados: {len(chats)}"

run_test("Canales de Mensajería", "Registro de Chats (/api/whatsapp/chats)", test_whatsapp_chats)

# 7. LLAMADAS DE VOZ VAPI
def test_voice_calls():
    req = urllib.request.Request(f"{BASE_URL}/api/voice-calls")
    with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        calls = data.get('calls', [])
        return resp.status == 200, f"Módulo VAPI activo - Historial de llamadas: {len(calls)}"

run_test("Llamadas por Voz (VAPI)", "Registro de Llamadas (/api/voice-calls)", test_voice_calls)

# 8. SISTEMA DE CITAS
def test_appointments():
    req = urllib.request.Request(f"{BASE_URL}/api/appointments")
    with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        apps = data.get('appointments', [])
        return resp.status == 200, f"Módulo Agenda activo - Citas agendadas: {len(apps)}"

run_test("Gestión de Agenda", "Consulta de Citas (/api/appointments)", test_appointments)

# 9. GALERÍA DE PROYECTOS
def test_gallery():
    req = urllib.request.Request(f"{BASE_URL}/api/gallery")
    with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        photos = data.get('photos', [])
        return resp.status == 200, f"Galería activa - Fotos de instalaciones disponibles: {len(photos)}"

run_test("Contenido & Multimedia", "Galería de Instalaciones (/api/gallery)", test_gallery)

# 10. RECURSOS Y AVATARES DIGITALES
def test_avatars():
    req = urllib.request.Request(f"{BASE_URL}/avatars.json")
    with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        return resp.status == 200, f"Catálogo de Avatares activo - Total avatares: {len(data)}"

run_test("Contenido & Multimedia", "Catálogo de Avatares (/avatars.json)", test_avatars)

# 11. WEBHOOK META ADS (CON TOKEN DE VERIFICACIÓN)
def test_meta_webhook():
    token = "meta_leads_secret_token_123"
    url = f"{BASE_URL}/api/webhook/facebook?hub.verify_token={token}&hub.challenge=TEST1234&hub.mode=subscribe"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=5) as resp:
        content = resp.read().decode('utf-8')
        return resp.status == 200 and content == "TEST1234", "Webhook Meta Lead Ads verificado exitosamente (Token OK)"

run_test("Integraciones Meta / FB", "Validación Webhook Lead Ads (/api/webhook/facebook)", test_meta_webhook)

# 12. WEBHOOK WHATSAPP (CON TOKEN DE VERIFICACIÓN)
def test_whatsapp_webhook():
    token = "sol_secret_token_123"
    url = f"{BASE_URL}/api/webhook/whatsapp?hub.verify_token={token}&hub.challenge=WA_TEST5678&hub.mode=subscribe"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=5) as resp:
        content = resp.read().decode('utf-8')
        return resp.status == 200 and content == "WA_TEST5678", "Webhook WhatsApp Meta verificado exitosamente (Token OK)"

run_test("Integraciones Meta / FB", "Validación Webhook WhatsApp (/api/webhook/whatsapp)", test_whatsapp_webhook)

print("\n==================================================================")
print(f"   RESUMEN FINAL: {passed_count} PRUEBAS EXITOSAS | {failed_count} FALLIDAS")
print("==================================================================")

if failed_count == 0:
    print("\n🎉 ¡TODAS LAS ÁREAS FUNCIONALES SE ENCUENTRAN TRABAJANDO CON ÉXITO! 🎉")
else:
    print(f"\n⚠️ Atención: Se detectaron {failed_count} áreas con problemas.")
