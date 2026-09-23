import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
BASE_URL = "http://localhost:3000"

def get(path):
    try:
        req = urllib.request.Request(f"{BASE_URL}{path}")
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = resp.read().decode('utf-8')
            try:
                return resp.status, json.loads(data)
            except:
                return resp.status, data[:100]
    except Exception as e:
        return 0, str(e)

def post(path, payload):
    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(f"{BASE_URL}{path}", data=data, method="POST")
        req.add_header('Content-Type', 'application/json')
        with urllib.request.urlopen(req, timeout=5) as resp:
            res_data = resp.read().decode('utf-8')
            try:
                return resp.status, json.loads(res_data)
            except:
                return resp.status, res_data[:100]
    except Exception as e:
        return 0, str(e)

print("=== AUDITORÍA PROACTIVA DE FUNCIONALIDAD DEL CRM ===")

print("\n1. Obteniendo Lista de Leads (/api/leads)...")
st, data = get("/api/leads")
print(f"Status {st} | Leads contados: {len(data.get('leads', [])) if isinstance(data, dict) else 'N/A'}")

print("\n2. Obteniendo Galería de Instalaciones (/api/gallery)...")
st, data = get("/api/gallery")
print(f"Status {st} | Fotos contadas: {len(data.get('photos', [])) if isinstance(data, dict) else 'N/A'}")

print("\n3. Obteniendo Chats de WhatsApp (/api/whatsapp/chats)...")
st, data = get("/api/whatsapp/chats")
print(f"Status {st} | Chats contados: {len(data.get('chats', [])) if isinstance(data, dict) else 'N/A'}")

print("\n4. Obteniendo Llamadas de Voz VAPI (/api/voice-calls)...")
st, data = get("/api/voice-calls")
print(f"Status {st} | Llamadas contadas: {len(data.get('calls', [])) if isinstance(data, dict) else 'N/A'}")

print("\n5. Obteniendo Citas (/api/appointments)...")
st, data = get("/api/appointments")
print(f"Status {st} | Citas contadas: {len(data.get('appointments', [])) if isinstance(data, dict) else 'N/A'}")

print("\n6. Obteniendo Videos de Marketing (/api/marketing/videos)...")
st, data = get("/api/marketing/videos")
print(f"Status {st} | Videos contados: {len(data.get('videos', [])) if isinstance(data, dict) else 'N/A'}")

print("\n7. Simulando Mensaje de Chat AI con Sol (/api/chat-ai)...")
st, data = post("/api/chat-ai", {"message": "Hola Sol, ¿cuánto puedo ahorrar con paneles solares en Florida?"})
print(f"Status {st} | Respuesta Sol: {str(data)[:120]}...")

print("\n8. Probando Simulación de Chat de WhatsApp (/api/whatsapp/simulate)...")
st, data = post("/api/whatsapp/simulate", {"phone": "305-555-0199", "message": "Quiero cotización para Puronics"})
print(f"Status {st} | Respuesta WhatsApp Bot: {str(data)[:120]}...")

print("\n=== FIN DE AUDITORÍA DE FUNCIONALIDADES DE LA PLATAFORMA ===")
