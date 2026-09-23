import sys
import json
import urllib.request
import urllib.parse
import re
import os
from dotenv import dotenv_values

sys.stdout.reconfigure(encoding='utf-8')

env_path = r'c:\Users\elyeh\.gemini\antigravity\playground\entropic-equinox\sol\.env'
env = dotenv_values(env_path)

token = env.get('META_PAGE_ACCESS_TOKEN') or env.get('META_ACCESS_TOKEN')
if len(sys.argv) > 1 and sys.argv[1].strip():
    token = sys.argv[1].strip()

page_id = env.get('META_PAGE_ID', '739996699200833')

print("==================================================================")
print("🚀 CREACIÓN AUTOMÁTICA DE FORMULARIO DE ALTA INTENCIÓN EN META")
print("==================================================================")

if not token:
    print("❌ Falta META_ACCESS_TOKEN. Pasa el token como parámetro:")
    print("   python deploy_high_intent_form.py <TU_TOKEN>")
    sys.exit(1)

form_payload = {
    'name': 'Florida Solar 2026 - Propietarios Calificados (High Intent)',
    'locale': 'es_LA',
    'privacy_policy': json.dumps({
        'url': 'https://ehbvolt-maker.github.io/sol-web/privacy.html',
        'link_text': 'Política de Privacidad Oficial Florida Solar'
    }),
    'follow_up_action_url': 'https://wa.me/13058136159?text=Hola,%20acabo%20de%20calificar%20en%20Meta%20Ads%20para%20el%20estudio%20satelital%20de%20mi%20techo',
    'questions': json.dumps([
        {
            'type': 'CUSTOM',
            'key': 'question_owner',
            'label': '¿Es usted el dueño o propietario registrado de la propiedad en Florida?',
            'options': [
                {'key': 'si_dueno', 'value': 'Sí, soy dueño de casa unifamiliar o townhome'},
                {'key': 'no_rento', 'value': 'No, soy inquilino o rento (No califica)'}
            ]
        },
        {
            'type': 'CUSTOM',
            'key': 'question_bill',
            'label': '¿Cuánto paga aproximadamente al mes en su factura de luz con FPL o su compañía eléctrica?',
            'options': [
                {'key': 'menos_100', 'value': 'Menos de $100 dólares al mes'},
                {'key': '100_200', 'value': 'Entre $100 y $200 dólares al mes'},
                {'key': '200_350', 'value': 'Entre $200 y $350 dólares al mes'},
                {'key': 'mas_350', 'value': 'Más de $350 dólares al mes (Lead VIP)'}
            ]
        },
        {
            'type': 'CUSTOM',
            'key': 'question_roof_age',
            'label': '¿Qué antigüedad aproximada tiene el techo de su propiedad?',
            'options': [
                {'key': 'techo_nuevo', 'value': 'Menos de 10 años (Excelente estado)'},
                {'key': 'techo_medio', 'value': 'Entre 10 y 20 años'},
                {'key': 'techo_antiguo', 'value': 'Más de 20 años (Deseo evaluar cambio)'}
            ]
        },
        {'type': 'FULL_NAME'},
        {'type': 'PHONE'},
        {'type': 'EMAIL'},
        {'type': 'STREET_ADDRESS'},
        {'type': 'ZIP'}
    ]),
    'context_card': json.dumps({
        'title': 'Programa de Incentivos Solares Florida 2026',
        'content': [
            'Evaluación satelital del techo en 30 segundos sin costo.',
            'Cero cuota inicial ($0 Down) para propietarios calificados.',
            'Elimina la tarifa variable de FPL y congela tu costo mensual.',
            'Opción de batería de respaldo para temporada de huracanes.'
        ],
        'style': 'LIST_STYLE',
        'button_text': 'Verificar si mi propiedad califica'
    }),
    'thank_you_page': json.dumps({
        'title': '¡Felicidades! Su solicitud ha sido aprobada para análisis',
        'body': 'Uno de nuestros ingenieros solares revisará la orientación y sombra de su techo mediante satélite. Para agilizar su estudio y ver su ahorro ahora mismo, toque el botón de WhatsApp abajo.',
        'button_text': 'Chatear por WhatsApp con un Consultor',
        'button_type': 'VIEW_WEBSITE',
        'website_url': 'https://wa.me/13058136159?text=Hola%20Eliecer,%20acabo%20de%20completar%20el%20formulario%20de%20Florida%20Solar%20y%20deseo%20ver%20el%20estudio%20satelital%20de%20mi%20techo'
    })
}

post_data = urllib.parse.urlencode({
    'access_token': token,
    **form_payload
}).encode('utf-8')

url = f"https://graph.facebook.com/v20.0/{page_id}/leadgen_forms"
req = urllib.request.Request(url, data=post_data, method='POST')

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        new_form_id = res.get('id')
        print(f"\n🎉 ¡ÉXITO! Formulario creado correctamente en Meta Ads:")
        print(f"   ID del Formulario: {new_form_id}")
        print(f"   Página Vinculada: {page_id}")
        
        # Actualizar .env
        with open(env_path, 'r', encoding='utf-8') as f:
            env_content = f.read()
        
        if 'META_LEADGEN_FORM_ID=' in env_content:
            env_content = re.sub(r'META_LEADGEN_FORM_ID=.*', f'META_LEADGEN_FORM_ID={new_form_id}', env_content)
        else:
            env_content += f"\nMETA_LEADGEN_FORM_ID={new_form_id}\n"
            
        with open(env_path, 'w', encoding='utf-8') as f:
            f.write(env_content)
            
        print(f"✅ Archivo sol/.env actualizado con META_LEADGEN_FORM_ID={new_form_id}")
except urllib.error.HTTPError as e:
    err_txt = e.read().decode('utf-8')
    print(f"\n❌ Error HTTP de Meta ({e.code}):")
    try:
        err_json = json.loads(err_txt)
        msg = err_json.get('error', {}).get('message', err_txt)
        print(f"   Mensaje: {msg}")
    except:
        print(f"   Detalle: {err_txt}")
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
