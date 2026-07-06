# 🛠️ Guía de Configuración de Claves y Variables de Entorno

Para habilitar las funciones en vivo de tu plataforma automatizada de leads (AI voice calls, WhatsApp Setter, e email en formato HTML premium), debes configurar las credenciales en tu archivo `.env` ubicado en la carpeta `sol/`.

A continuación, tienes las instrucciones detalladas paso a paso para obtener cada clave:

---

## 1. Contraseña de Aplicación de Gmail (`GMAIL_APP_PASS`)
Google ya no permite que aplicaciones externas envíen correos usando tu contraseña normal de Gmail por motivos de seguridad. Debes generar una **Contraseña de Aplicación de 16 caracteres**:

1. Ve a tu cuenta de Google: [myaccount.google.com](https://myaccount.google.com/).
2. En la barra lateral, haz clic en **Seguridad**.
3. Asegúrate de tener activada la **Verificación en 2 pasos**. Si no lo está, actívala.
4. Haz clic en **Verificación en 2 pasos** de nuevo, desplázate hasta el final de la página y busca la opción **Contraseñas de aplicación**.
5. Escribe un nombre para identificar la aplicación (ej: `SolarNext CRM`) y haz clic en **Crear**.
6. Google generará un código de **16 caracteres en un recuadro amarillo** (ej: `abcd efgh ijkl mnop`).
7. Copia ese código sin espacios y pégalo en tu archivo `.env` en la línea:
   ```env
   GMAIL_APP_PASS=abcdefghijklmnop
   ```

---

## 2. Llave de OpenAI (`OPENAI_API_KEY`)
Requerida para la respuesta inteligente de "Sol" y para extraer datos de los chats.

1. Regístrate o inicia sesión en la plataforma de desarrolladores de OpenAI: [platform.openai.com](https://platform.openai.com/).
2. En la barra de navegación izquierda, dirígete a **API Keys**.
3. Haz clic en **+ Create new secret key** (Crear nueva clave secreta).
4. Dale un nombre (ej: `SolarNext CRM`), haz clic en crear y **copia la clave de inmediato** (no podrás volver a verla).
5. Pégala en tu archivo `.env`:
   ```env
   OPENAI_API_KEY=sk-proj-YOURKEY...
   ```
*(Nota: Asegúrate de tener saldo de recarga en tu cuenta de OpenAI Developer Platform para que la API responda con éxito).*

---

## 3. Asistente de Llamadas de Voz (`VAPI_ASSISTANT_ID`)
Para las llamadas telefónicas de "Sol".

1. Ve a tu panel de Vapi: [dashboard.vapi.ai](https://dashboard.vapi.ai/).
2. Si ya tienes un asistente configurado, entra a su configuración.
3. Copia the **Assistant ID** (un código UUID largo).
4. Pégalo en tu archivo `.env`:
   ```env
   VAPI_ASSISTANT_ID=795ccfaf-220d-4eea-8c2d-ab24d1b3de8c
   ```

---

## 4. API de WhatsApp Cloud (Meta Developers)
Para recibir y enviar mensajes automáticos de WhatsApp en tiempo real.

1. Ve a Meta para Desarrolladores: [developers.facebook.com](https://developers.facebook.com/).
2. Haz clic en **Mis Apps** y crea una nueva aplicación de tipo **Business** (Negocios).
3. Añade el producto **WhatsApp** a tu aplicación.
4. En el panel de WhatsApp (sección *Configuración de API*):
   - Copia el **Phone Number ID** (Identificador de número de teléfono) y pégalo en:
     ```env
     WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
     ```
   - Genera un **Token de Acceso Temporal** (válido por 24h) para pruebas o configura un **Token de Acceso Permanente** (System User Access Token) desde el Administrador Comercial de Meta. Pégalo en:
     ```env
     WHATSAPP_ACCESS_TOKEN=tu_access_token
     ```
5. **Configurar el Webhook:**
   - En la sección *Configuración* de WhatsApp en Meta, haz clic en **Configurar Webhooks**.
   - **URL de Verificación:** Debe apuntar a tu servidor en vivo con la ruta `/api/webhook/whatsapp` (ej. `https://tu-app-solar.onrender.com/api/webhook/whatsapp`).
   - **Token de Verificación:** Escribe el mismo token configurado en tu `.env` (por defecto es `sol_secret_token_123`).
   - Suscríbete al campo **messages** en los Webhooks de la API para recibir los chats entrantes.

---

## 5. Integración de Formularios de Meta Ads (Facebook/Instagram Lead Forms)
Para capturar prospectos de tus anuncios de Facebook e Instagram e ingresarlos al CRM en tiempo real:

1. Ve a Meta para Desarrolladores: [developers.facebook.com](https://developers.facebook.com/).
2. Selecciona tu App de Negocio y haz clic en **Webhooks** en la barra lateral.
3. En el selector superior, elige **Page** (Página) y haz clic en **Subscribe to this object**.
4. Configura el Webhook:
   - **URL de Retorno:** `https://tu-app-solar.onrender.com/api/webhook/facebook` (apunta a tu servidor público).
   - **Token de Verificación:** Escribe el mismo token configurado en tu `.env` (por defecto es `meta_leads_secret_token_123`).
5. Busca el campo **leadgen** en la lista de suscripciones y haz clic en **Subscribe**.
6. **Obtener Token de Acceso (`META_ACCESS_TOKEN`):**
   - Dirígete al Administrador Comercial de Meta (Business Manager) de tu página.
   - Genera un **Token de Acceso de Usuario del Sistema** con los permisos: `leads_retrieval`, `pages_show_list` y `pages_read_engagement`.
   - Copia ese token de larga duración y pégalo en tu archivo `.env`:
     ```env
     META_ACCESS_TOKEN=tu_token_de_acceso_de_meta
     ```

---

## 6. Edición del archivo `.env`
Abre el archivo [.env](file:///c:/Users/elyeh/.gemini/antigravity/playground/entropic-equinox/sol/.env) y rellena los campos en blanco con las claves obtenidas:

```ini
PORT=3000
OPENAI_API_KEY=tu_clave_de_openai
GMAIL_USER=ehbequitysolar@gmail.com
GMAIL_APP_PASS=tu_clave_de_aplicacion_gmail
VAPI_ASSISTANT_ID=795ccfaf-220d-4eea-8c2d-ab24d1b3de8c
HEYGEN_API_KEY=tu_clave_de_heygen
WHATSAPP_ACCESS_TOKEN=tu_token_de_whatsapp
WHATSAPP_PHONE_NUMBER_ID=tu_phone_id_de_whatsapp
WHATSAPP_VERIFICATION_TOKEN=sol_secret_token_123

META_ACCESS_TOKEN=tu_token_de_meta_leads
META_LEADS_VERIFICATION_TOKEN=meta_leads_secret_token_123
```
Una vez rellenado el archivo, reinicia el servidor para aplicar los cambios.
