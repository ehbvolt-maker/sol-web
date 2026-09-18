import sys
import json
import urllib.request
import urllib.parse
from dotenv import dotenv_values

env_path = 'c:/Users/elyeh/.gemini/antigravity/playground/entropic-equinox/sol/.env'
env = dotenv_values(env_path)
token = env.get('META_ACCESS_TOKEN')

if len(sys.argv) > 1 and sys.argv[1].strip():
    token = sys.argv[1].strip()

page_id = '739996699200833'

print("Creating high-quality leadgen form for Florida Solar...")

form_data = {
    'name': 'Florida Solar - Calificacion Propietarios 2026',
    'locale': 'es_LA',
    'privacy_policy': json.dumps({
        'url': 'https://ehbvolt-maker.github.io/sol-web/privacy.html',
        'link_text': 'Politica de Privacidad Oficial'
    }),
    'follow_up_action_url': 'https://wa.me/13058136159?text=Hola,%20acabo%20de%20calificar%20en%20el%20formulario%20y%20deseo%20ver%20el%20estudio%20de%20mi%20techo',
    'questions': json.dumps([
        {
            'type': 'CUSTOM',
            'key': 'question_owner',
            'label': '¿Es usted el dueño o propietario de la vivienda en Florida?',
            'options': [
                {'key': 'si_dueno', 'value': 'Sí, soy dueño de casa unifamiliar o townhome'},
                {'key': 'no_rento', 'value': 'No, soy inquilino o rento'}
            ]
        },
        {
            'type': 'CUSTOM',
            'key': 'question_bill',
            'label': '¿Cuánto paga aproximadamente al mes en su factura de luz con FPL o su compañía?',
            'options': [
                {'key': 'menos_100', 'value': 'Menos de $100 dólares al mes'},
                {'key': '100_200', 'value': 'Entre $100 y $200 dólares al mes'},
                {'key': '200_350', 'value': 'Entre $200 y $350 dólares al mes'},
                {'key': 'mas_350', 'value': 'Más de $350 dólares al mes (Lead VIP)'}
            ]
        },
        {
            'type': 'CUSTOM',
            'key': 'question_location',
            'label': '¿En qué zona de Florida se encuentra su propiedad?',
            'options': [
                {'key': 'sur_fl', 'value': 'Sur de Florida (Miami, Broward, Palm Beach)'},
                {'key': 'centro_fl', 'value': 'Centro de Florida (Orlando, Tampa, Kissimmee)'},
                {'key': 'otra_fl', 'value': 'Otra zona de Florida'},
                {'key': 'fuera_fl', 'value': 'Fuera del estado de Florida'}
            ]
        },
        {'type': 'FULL_NAME'},
        {'type': 'PHONE'},
        {'type': 'EMAIL'},
        {'type': 'STREET_ADDRESS'},
        {'type': 'ZIP'}
    ]),
    'context_card': json.dumps({
        'title': 'Programa de Medicion Neta Florida 2026',
        'content': [
            'Evaluación satelital gratuita en 30 segundos.',
            'Cero costo inicial ($0 Down) para propietarios calificados.',
            'Elimine su factura variable y congele su tarifa eléctrica.'
        ],
        'style': 'LIST_STYLE',
        'button_text': 'Verificar mi calificacion'
    }),
    'thank_you_page': json.dumps({
        'title': '¡Felicidades! Su solicitud ha sido recibida',
        'body': 'Un consultor revisará la vista satelital de su techo para calcular su ahorro. Toque el botón abajo para atención inmediata por WhatsApp.',
        'button_text': 'Chatear por WhatsApp',
        'button_type': 'VIEW_WEBSITE',
        'website_url': 'https://wa.me/13058136159?text=Hola,%20acabo%20de%20completar%20el%20formulario%20de%20Florida%20Solar'
    })
}

post_data = urllib.parse.urlencode({
    'access_token': token,
    **form_data
}).encode('utf-8')

url = f"https://graph.facebook.com/v20.0/{page_id}/leadgen_forms"
req = urllib.request.Request(url, data=post_data, method='POST')

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print("SUCCESS! Leadgen Form Created:")
        print(json.dumps(res, indent=2))
        new_form_id = res.get('id')
        print(f"\nNEW FORM ID: {new_form_id}")
except urllib.error.HTTPError as e:
    err = e.read().decode('utf-8')
    print(f"HTTP Error {e.code}: {err}")
