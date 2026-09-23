import sys
import json
import urllib.request
import urllib.parse
from dotenv import dotenv_values

sys.stdout.reconfigure(encoding='utf-8')

env_path = r'c:\Users\elyeh\.gemini\antigravity\playground\entropic-equinox\sol\.env'
env = dotenv_values(env_path)

token = env.get('META_ACCESS_TOKEN')
if len(sys.argv) > 1 and sys.argv[1].strip():
    token = sys.argv[1].strip()

page_id = env.get('META_PAGE_ID', '739996699200833')
pixel_id = env.get('META_PIXEL_ID', '719698207899781')

print("=========================================================")
print("🚀 DIAGNÓSTICO PROFESIONAL DE META ADS & TOKENS")
print("=========================================================")

if not token:
    print("❌ ERROR: No se encontró META_ACCESS_TOKEN en sol/.env ni como argumento.")
    print("Uso: python test_meta_token.py <TU_NUEVO_TOKEN>")
    sys.exit(1)

def api_call(endpoint, params=None):
    query = {'access_token': token}
    if params:
        query.update(params)
    url = f"https://graph.facebook.com/v20.0/{endpoint}?{urllib.parse.urlencode(query)}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            return True, json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        try:
            return False, json.loads(err_body)
        except:
            return False, {"error": {"message": err_body, "code": e.code}}
    except Exception as e:
        return False, {"error": {"message": str(e)}}

# 1. Validar Token (/me)
ok, me = api_call("me", {"fields": "id,name,email"})
if not ok:
    err = me.get("error", {})
    print(f"\n❌ TOKEN INVÁLIDO O EXPIRADO:")
    print(f"   Mensaje: {err.get('message')}")
    print(f"   Código: {err.get('code')} | Subcódigo: {err.get('error_subcode')}")
    print("\n👉 SOLUCIÓN: Genera un 'System User Token' permanente en Business Manager con permisos:")
    print("   ads_management, ads_read, leads_retrieval, pages_show_list, pages_read_engagement, pages_manage_ads")
    sys.exit(1)

print(f"\n✅ TOKEN ACTIVO Y AUTENTICADO:")
print(f"   Usuario/App: {me.get('name')} (ID: {me.get('id')})")

# 2. Permisos y Debug del Token
ok, debug = api_call("debug_token", {"input_token": token})
if ok:
    data = debug.get('data', {})
    scopes = data.get('scopes', [])
    expires_at = data.get('expires_at')
    exp_str = "NUNCA (Token Permanente de Sistema)" if expires_at == 0 else f"Expira en epoch: {expires_at}"
    print(f"   Tipo de Token: {data.get('type')}")
    print(f"   Expiración: {exp_str}")
    print(f"   Permisos (Scopes): {', '.join(scopes)}")

# 3. Cuentas Publicitarias
ok, adaccs = api_call("me/adaccounts", {"fields": "id,account_id,name,account_status,currency,amount_spent,balance"})
if ok:
    acc_list = adaccs.get('data', [])
    print(f"\n📊 CUENTAS PUBLICITARIAS ASOCIADAS ({len(acc_list)}):")
    for acc in acc_list:
        status_map = {1: "ACTIVA", 2: "DESACTIVADA", 3: "NO ASIGNADA", 7: "PENDIENTE REVISIÓN"}
        st = status_map.get(acc.get('account_status'), f"Status {acc.get('account_status')}")
        print(f"   • {acc.get('name')} (ID: {acc.get('id')}) | Estado: {st} | Moneda: {acc.get('currency')} | Gasto Histórico: ${acc.get('amount_spent')}")
        
        # Campañas
        ok_camp, camps = api_call(f"{acc.get('id')}/campaigns", {
            "fields": "id,name,status,effective_status,objective,daily_budget,lifetime_budget",
            "limit": "10"
        })
        if ok_camp:
            print(f"     Campañas encontradas ({len(camps.get('data', []))}):")
            for c in camps.get('data', []):
                print(f"       - [{c.get('effective_status')}] {c.get('name')} (Obj: {c.get('objective')})")
else:
    print(f"⚠️ No se pudieron listar cuentas publicitarias: {adaccs.get('error', {}).get('message')}")

# 4. Formularios de Clientes Potenciales de la Página
page_token = env.get('META_PAGE_ACCESS_TOKEN') or token
def page_api_call(endpoint, params=None):
    query = {'access_token': page_token}
    if params:
        query.update(params)
    url = f"https://graph.facebook.com/v20.0/{endpoint}?{urllib.parse.urlencode(query)}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            return True, json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        return False, {"error": {"message": str(e)}}

ok, forms = page_api_call(f"{page_id}/leadgen_forms", {"fields": "id,name,status,leads_count,created_time"})
if ok:
    f_list = forms.get('data', [])
    print(f"\n📋 FORMULARIOS LEADGEN EN PÁGINA {page_id} ({len(f_list)}):")
    for f in f_list:
        print(f"   • [{f.get('status')}] {f.get('name')} (ID: {f.get('id')}) - Total Leads Capturados: {f.get('leads_count', 0)}")
else:
    print(f"⚠️ Error consultando formularios de la página: {forms.get('error', {}).get('message')}")

print("\n=========================================================")
print("🏁 Fin del diagnóstico.")
