require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { OpenAI } = require('openai');
const multer = require('multer');
const crypto = require('crypto');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key');


// Funciones de normalización y hashing para la API de Conversiones de Meta (CAPI)
function normalizeEmail(email) {
    if (!email) return '';
    return email.trim().toLowerCase();
}

function normalizePhone(phone) {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, ''); // eliminar todo lo que no sea número
    if (cleaned.length === 10) {
        cleaned = '1' + cleaned; // asumir código de país de USA/FL si tiene 10 dígitos
    }
    return cleaned;
}

function hashSha256(data) {
    if (!data) return '';
    return crypto.createHash('sha256').update(data).digest('hex');
}

// Función para enviar eventos a la API de Conversiones de Meta (CAPI)
async function sendMetaConversionsAPI(lead, eventName) {
    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
        console.warn('[Meta CAPI Warning] META_PIXEL_ID o META_ACCESS_TOKEN no configurado en el archivo .env. Omitiendo reporte CAPI.');
        return;
    }

    try {
        const normalizedEmail = normalizeEmail(lead.email);
        const normalizedPhone = normalizePhone(lead.phone);

        const userData = {};
        if (normalizedEmail) {
            userData.em = hashSha256(normalizedEmail);
        }
        if (normalizedPhone) {
            userData.ph = hashSha256(normalizedPhone);
        }
        if (lead.leadgen_id) {
            userData.lead_id = lead.leadgen_id;
        }

        const payload = {
            data: [
                {
                    event_name: eventName,
                    event_time: Math.floor(Date.now() / 1000),
                    action_source: "system_generated",
                    user_data: userData,
                    custom_data: {
                        lead_event_source: "crm"
                    }
                }
            ]
        };

        const url = `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`;
        console.log(`[Meta CAPI] Enviando evento '${eventName}' para el Lead ID ${lead.id || 'N/A'}...`);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const resData = await response.json();
        if (resData.error) {
            console.error('[Meta CAPI Error]:', resData.error.message);
        } else {
            console.log(`[Meta CAPI Success]: Evento '${eventName}' reportado exitosamente.`, JSON.stringify(resData));
        }
    } catch (error) {
        console.error('[Meta CAPI Exception]:', error.message);
    }
}

// Configuración de Multer para subir archivos a la carpeta assets
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'assets'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'gallery-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage });

// Configuración de OpenAI (Requiere API Key en .env o entorno)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-openai-key-for-startup',
});

// Configuración de HeyGen
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

// Configuración de Make.com
const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/p73ls3ukkbtd6szgpznx7hu96ax1k624';

// Configuración de Email (Gmail SMTP cargado desde .env)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER || 'ehbequitysolar@gmail.com',
        pass: process.env.GMAIL_APP_PASS || 'TU_PASSWORD_DE_APLICACION_AQUI'
    }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serving static frontend files
app.use(express.static(path.join(__dirname)));

// Database setup
const db = new sqlite3.Database('./leads.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            phone TEXT,
            address TEXT,
            email TEXT UNIQUE,
            zipcode TEXT,
            bill_over_100 TEXT,
            credit_score TEXT,
            roof_type TEXT,
            is_owner TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS chat_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_message TEXT,
            bot_response TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
        db.run(`CREATE TABLE IF NOT EXISTS gallery_photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            title TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS whatsapp_chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT,
            sender TEXT,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS purchase_tokens (
            token TEXT PRIMARY KEY,
            email TEXT,
            status TEXT DEFAULT 'pending',
            downloaded_at DATETIME,
            device_ip TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id INTEGER,
            appointment_time TEXT, -- Formato ISO YYYY-MM-DDTHH:MM:SS
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(lead_id) REFERENCES leads(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS voice_calls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vapi_call_id TEXT UNIQUE,
            phone TEXT,
            customer_name TEXT,
            duration TEXT, -- duración en segundos
            recording_url TEXT, -- enlace al audio MP3 de la llamada
            summary TEXT, -- resumen por IA de la llamada
            transcript TEXT, -- transcripción completa de la conversación
            status TEXT, -- 'qualified', 'not_qualified', 'pending'
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS marketing_videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            heygen_video_id TEXT UNIQUE,
            script TEXT,
            avatar_id TEXT,
            video_url TEXT, -- URL final provista por HeyGen
            status TEXT, -- 'processing', 'completed', 'failed'
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Migración dinámica: Agregar la columna leadgen_id a la tabla leads si no existe
        db.run(`ALTER TABLE leads ADD COLUMN leadgen_id TEXT`, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error('Error adding leadgen_id column to leads table:', err.message);
            } else if (!err) {
                console.log('Added column leadgen_id to leads table successfully.');
            }
        });
    }
});

// Setup Marketing Routes with db access
const setupMarketingRoutes = require('./marketing');
setupMarketingRoutes(app, openai, db);

// API Routes

// Endpoint de Keep-Alive para evitar que Render se duerma
app.get('/api/ping', (req, res) => {
    res.status(200).json({ status: 'alive', timestamp: new Date() });
});

// 1. Capture Leads (POST)
app.post('/api/leads', (req, res) => {
    const { name, phone, address, email, zipcode, bill_over_100, credit_score, roof_type, is_owner, leadgen_id } = req.body;
    
    if (!email || !name || !phone) {
        return res.status(400).json({ error: 'Nombre, teléfono y email son requeridos' });
    }

    const query = `INSERT INTO leads (name, phone, address, email, zipcode, bill_over_100, credit_score, roof_type, is_owner, leadgen_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [name, phone, address || '', email || null, zipcode || '', bill_over_100 || '', credit_score || '', roof_type || '', is_owner || '', leadgen_id || null], function(err) {
        if (err) {
            if(err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: 'Este correo ya fue registrado anteriormente.' });
            }
            return res.status(500).json({ error: err.message });
        }
        
        const leadId = this.lastID;
        const leadObj = { id: leadId, name, phone, email, leadgen_id };

        // Enviar evento Lead a Meta Conversions API
        sendMetaConversionsAPI(leadObj, 'Lead');

        // Si califica, enviar evento QualifiedLead
        const isQualified = (is_owner === 'yes' || is_owner === 'Sí' || is_owner === 'si') && 
                            (bill_over_100 === 'yes' || bill_over_100 === 'Sí' || bill_over_100 === 'si') && 
                            (credit_score === 'yes' || credit_score === 'Sí' || credit_score === 'si');
        if (isQualified) {
            sendMetaConversionsAPI(leadObj, 'QualifiedLead');
        }

        // Enviar Correo Electrónico Automático al Administrador (HTML Premium)
        const mailOptions = {
            from: `Equity Solar <${process.env.GMAIL_USER || 'ehbequitysolar@gmail.com'}>`,
            to: process.env.GMAIL_USER || 'ehbequitysolar@gmail.com',
            subject: `☀️ NUEVO LEAD SOLAR: ${name}`,
            text: `Felicidades! Tienes un nuevo prospecto solar.\n\nNombre: ${name}\nTeléfono: ${phone}\nEmail: ${email}`,
            html: generateAdminEmailHTML({ name, phone, address, email, zipcode, is_owner, bill_over_100, credit_score, roof_type })
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar correo de alerta:', error.message);
            } else {
                console.log('Correo de alerta enviado al admin:', info.response);
            }
        });

        // Enviar Correo de Bienvenida al Cliente (HTML Premium)
        if (email && email.trim() !== '') {
            const clientMailOptions = {
                from: `Equity Solar <${process.env.GMAIL_USER || 'ehbequitysolar@gmail.com'}>`,
                to: email,
                subject: `☀️ ¡Bienvenido a Equity Solar! Tu precalificación solar está en proceso`,
                text: `¡Hola ${name}! Gracias por tu interés en los programas de renta solar de Equity Solar. Sol, nuestra asesora inteligente, está trabajando en tu cotización.`,
                html: generateClientEmailHTML({ name })
            };
            
            transporter.sendMail(clientMailOptions, (error, info) => {
                if (error) {
                    console.error('Error al enviar correo de bienvenida al cliente:', error.message);
                } else {
                    console.log('Correo de bienvenida enviado al cliente:', info.response);
                }
            });
        }

        // Enviar Alerta de Lead a Make.com
        (async () => {
            try {
                await fetch(MAKE_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: 'new_lead',
                        name: name,
                        phone: phone,
                        address: address,
                        email: email,
                        zipcode: zipcode,
                        bill_over_100: bill_over_100,
                        credit_score: credit_score,
                        roof_type: roof_type,
                        is_owner: is_owner
                    })
                });
                console.log('[Make.com] Webhook de nuevo lead enviado con éxito.');
            } catch (webhookError) {
                console.error('[Make.com] Error enviando webhook de lead:', webhookError.message);
            }
        })();

        res.status(201).json({ success: true, id: leadId, message: 'Lead guardado con éxito' });
    });
});

// 1.5 Get All Leads (GET)
app.get('/api/leads', (req, res) => {
    db.all(`SELECT * FROM leads ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ leads: rows });
    });
});

// 2. Save Chat Logs (POST)
app.post('/api/chat', (req, res) => {
    const { user_message, bot_response } = req.body;
    const query = `INSERT INTO chat_logs (user_message, bot_response) VALUES (?, ?)`;
    db.run(query, [user_message, bot_response], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ success: true });
    });
});

// 2.5 Gallery API
app.get('/api/gallery', (req, res) => {
    db.all(`SELECT * FROM gallery_photos ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ photos: rows });
    });
});

app.post('/api/gallery', upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    
    const filename = req.file.filename;
    const title = '';
    const description = '';
    const query = `INSERT INTO gallery_photos (filename, title, description) VALUES (?, ?, ?)`;
    db.run(query, [filename, title, description], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ success: true, id: this.lastID, filename, title, description });
    });
});

// 3. AI Chat endpoint for Web client
app.post('/api/chat-ai', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Mensaje es requerido' });
    }
    
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `Eres Sol, una asesora virtual e influencer experta en energía solar de la empresa EQUITY SOLAR. Responde de manera amigable, profesional y persuasiva.
Aquí tienes una lista de respuestas rápidas frecuentes:
•	"¿Cuánto cuesta?": "Justamente para eso es la consulta. El costo depende de su consumo actual, pero recuerde que el objetivo es que pague menos de lo que paga hoy de luz y sin inversión inicial, eliminando completamente su factura actual con la compañía eléctrica."

Información de la Empresa (Referencia)
•	Empresa: EQUITY SOLAR
•	Ubicación: Miami, FL (Equity solar) y Orlando. Trabajamos en toda Florida.
•	Servicios: Paneles solares (residencial/comercial), baterías, techos, eficiencia energética, cargadores EV, aire acondicionad, tratamiento de agua, remodelación de interiores y driveway, además puertas y ventanas contra impacto.
•	Reputación: 4.9 estrellas en satisfacción al cliente.
•	Contacto: (305) 813-6159 | ehbequitysolar.com`
                },
                { role: "user", content: message }
            ]
        });
        res.json({ response: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error de OpenAI:', error.message);
        res.status(500).json({ error: 'Error procesando inteligencia artificial.' });
    }
});

// Función Rastreador de Estado de Video (Polling) para enviar a Make.com
async function pollHeyGenVideoStatus(videoId, script) {
    const maxAttempts = 30; // ~7.5 minutos de espera máx (30 intentos * 15 seg)
    const pollIntervalMs = 15000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`[Rastreador HeyGen] Revisando video ${videoId}... (Intento ${attempt}/${maxAttempts})`);
            
            const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
                headers: { 'X-Api-Key': HEYGEN_API_KEY }
            });
            const data = await response.json();

            if (data && data.data) {
                const status = data.data.status;
                if (status === 'completed' || status === 'completed_success') {
                    const videoUrl = data.data.video_url;
                    console.log(`[Rastreador HeyGen] Video ${videoId} Terminado! URL: ${videoUrl}`);
                    
                    // Enviar paquete final a Make.com
                    console.log(`[Make.com] Enviando video al Webhook de automatización...`);
                    await fetch(MAKE_WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event: 'video_ready',
                            video_id: videoId,
                            video_url: videoUrl,
                            script: script,
                            avatar_id: "Annie_Casual_Standing_Front_public",
                            presenter: "Sol"
                        })
                    });
                    console.log(`[Make.com] Webhook enviado con éxito! Make.com publicará el video en breve.`);
                    return;
                } else if (status === 'failed' || status === 'error') {
                    console.error(`[Rastreador HeyGen] El renderizado falló para el video ${videoId}. Revisa tus créditos en HeyGen.`);
                    return;
                }
            }
        } catch (error) {
            console.error(`[Rastreador HeyGen] Error al comunicarse con la API:`, error.message);
        }

        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
    
    console.error(`[Rastreador HeyGen] Timeout. El video ${videoId} tardó demasiado tiempo en renderizarse.`);
}

// 4. Marketing Video Generator (OpenAI + HeyGen)
app.post('/api/generate-marketing-video', async (req, res) => {
    if (HEYGEN_API_KEY === 'TU_HEYGEN_API_KEY_AQUI' || !HEYGEN_API_KEY) {
        return res.status(500).json({ error: 'Falta configurar la HeyGen API Key' });
    }

    try {
        const promptCompletions = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Eres el Director de Marketing de Equity Solar en Florida. Escribe un guion para un video corto de TikTok/Reels de máximo 30 segundos (unas 60-70 palabras). El tono debe ser entusiasta, directo y vender el programa de renta solar donde se elimina la factura de luz a 0 costo inicial. Menciona el número 305-813-6159 al final. Devuelve SOLO el texto que el presentador dirá, sin acotaciones escénicas ni hashtags." },
                { role: "user", content: "Genera un nuevo guion educativo persuasivo para atraer nuevos dueños de casa a nuestro programa." }
            ]
        });
        
        const videoScript = promptCompletions.choices[0].message.content.trim();
        console.log("Guion Generado por OpenAI:\n", videoScript);

        const heygenPayload = {
            video_inputs: [
                {
                    character: {
                        type: "avatar",
                        avatar_id: "Annie_Casual_Standing_Front_public"
                    },
                    voice: {
                        type: "text",
                        input_text: videoScript,
                        voice_id: "8217ce4716a34615a75beec0685dbba8"
                    }
                }
            ],
            test: false
        };

        const heygenResponse = await fetch('https://api.heygen.com/v2/video/generate', {
            method: 'POST',
            headers: {
                'X-Api-Key': HEYGEN_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(heygenPayload)
        });

        const heygenData = await heygenResponse.json();

        if (heygenData.error) {
            throw new Error(`Error de HeyGen: ${JSON.stringify(heygenData.error)}`);
        }

        const videoId = heygenData.data.video_id;
        pollHeyGenVideoStatus(videoId, videoScript);

        res.json({ 
            success: true, 
            message: 'Video enviado a HeyGen para renderizado. El Rastreador alertará a Make.com cuando esté terminado.', 
            video_id: videoId,
            script: videoScript
        });

    } catch (error) {
        console.error('Error generando video:', error.message);
        res.status(500).json({ error: 'Error en el proceso de generación de video.' });
    }
});

// Endpoint auxiliar para revisar si el video de HeyGen ya terminó de renderizarse
app.get('/api/video-status/:id', async (req, res) => {
    try {
        const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${req.params.id}`, {
            headers: { 'X-Api-Key': HEYGEN_API_KEY }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error revisando el estado del video.' });
    }
});

// ==========================================
// WHATSAPP AI SETTER & SIMULATION SYSTEM
// ==========================================

async function sendWhatsAppMessage(phone, text) {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!token || !phoneId) {
        console.log(`[WhatsApp API Simulado] Enviando a ${phone}: "${text}"`);
        return;
    }
    
    try {
        const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: phone,
                type: "text",
                text: { body: text }
            })
        });
        const data = await response.json();
        console.log('[WhatsApp API Response]:', data);
    } catch (err) {
        console.error('[WhatsApp API Send Error]:', err.message);
    }
}

async function processWhatsAppAI(phone, userMessage) {
    // 1. Save user message
    await new Promise((resolve, reject) => {
        db.run(`INSERT INTO whatsapp_chats (phone, sender, message) VALUES (?, ?, ?)`, [phone, 'user', userMessage], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // 2. Fetch history
    const chatHistory = await new Promise((resolve, reject) => {
        db.all(`SELECT * FROM whatsapp_chats WHERE phone = ? ORDER BY created_at DESC LIMIT 15`, [phone], (err, rows) => {
            if (err) reject(err);
            else resolve(rows.reverse());
        });
    });

    const todayStr = new Date().toISOString().split('T')[0];

    // 3. Prepare AI Prompt
    const openaiMessages = [
        {
            role: "system",
            content: `Eres Sol, una carismática asesora experta en energía solar de la empresa EQUITY SOLAR en Florida ( Miami, Orlando, etc.).
Tu objetivo es charlar con el cliente de manera muy amigable y empática para precalificarlo.
Para precalificar a un cliente, necesitas obtener de forma sutil durante la conversación:
1. Nombre
2. Si es dueño de casa (homeowner) - (es requisito que sea dueño de casa para calificar).
3. Si su factura de electricidad promedio es mayor a $100 (si paga menos, no califica).
4. Si su puntuación de crédito (credit score) está por encima de 650 (aproximadamente, para calificar al financiamiento a tasa cero inicial).
5. Dirección, Código Postal (ZIP) y Correo Electrónico.

Reglas importantes de conversación:
- Habla en español de Florida (un tono latino, profesional pero muy cercano, entusiasta y positivo).
- NO hagas todas las preguntas juntas. Ve haciendo una o dos preguntas a la vez en el flujo natural de la charla.
- Sé breve y directa (máximo 2 párrafos cortos por respuesta).
- Si te preguntan el costo, diles que depende del consumo actual y que justamente para darles el cálculo exacto necesitas saber cuánto pagan de luz y si son dueños de la casa. El objetivo es que paguen menos de lo que pagan hoy, sin inversión inicial.
- UNA VEZ QUE EL CLIENTE CALIFIQUE (es dueño de casa, paga > $100 de luz, y tiene buen crédito), felicítalo y ofrécele agendar una llamada/consulta de 15 minutos para coordinar su diseño gratuito. Pregúntale qué día y hora le queda mejor. Hoy es ${todayStr} (usa esta fecha para interpretar expresiones relativas como "mañana", "el lunes", etc.).`
        }
    ];

    chatHistory.forEach(msg => {
        openaiMessages.push({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.message
        });
    });

    // 4. Generate bot response
    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: openaiMessages
    });
    const botReply = chatCompletion.choices[0].message.content.trim();

    // 5. Save bot message
    await new Promise((resolve, reject) => {
        db.run(`INSERT INTO whatsapp_chats (phone, sender, message) VALUES (?, ?, ?)`, [phone, 'bot', botReply], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // 6. Extract lead details using structured output
    let conversationText = "";
    chatHistory.forEach(msg => {
        conversationText += `${msg.sender === 'user' ? 'Cliente' : 'Asistente Sol'}: ${msg.message}\n`;
    });
    conversationText += `Asistente Sol: ${botReply}\n`;

    const extractSchema = {
        type: "object",
        properties: {
            name: { type: "string", description: "First and last name of the client. Empty string if not mentioned." },
            email: { type: "string", description: "Email address. Empty string if not mentioned." },
            address: { type: "string", description: "Home address. Empty string if not mentioned." },
            zipcode: { type: "string", description: "Zip code. Empty string if not mentioned." },
            bill_over_100: { type: "string", enum: ["yes", "no", ""], description: "Is their monthly power bill > $100? yes/no/empty" },
            credit_score: { type: "string", enum: ["yes", "no", ""], description: "Is their credit score > 650? yes/no/empty" },
            roof_type: { type: "string", description: "Roof type if mentioned (shingle, tile, metal, concrete, etc.). Empty string if not." },
            is_owner: { type: "string", enum: ["yes", "no", ""], description: "Are they the homeowner? yes/no/empty" },
            appointment_date: { type: "string", description: `The date and time the client wants to schedule a call, formatted in ISO 8601 (YYYY-MM-DDTHH:MM:SS) based on the reference date of today (${todayStr}). For example, if they said 'tomorrow at 3pm' on 2026-06-24, this must be '2026-06-25T15:00:00'. Empty string if not requested or scheduled yet.` }
        },
        required: ["name", "email", "address", "zipcode", "bill_over_100", "credit_score", "roof_type", "is_owner", "appointment_date"],
        additionalProperties: false
    };

    let extracted = { name: "", email: "", address: "", zipcode: "", bill_over_100: "", credit_score: "", roof_type: "", is_owner: "", appointment_date: "" };
    try {
        const extractionCompletion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Analiza el historial de chat provisto y extrae la información del cliente potencial. Sé estricto: solo extrae información si fue explícitamente dicha por el cliente. Si coordinan una cita, calcula la fecha real sabiendo que la referencia de Hoy es ${todayStr}. Deja en blanco si no está presente.`
                },
                {
                    role: "user",
                    content: conversationText
                }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "solar_lead_extraction",
                    schema: extractSchema,
                    strict: true
                }
            }
        });
        extracted = JSON.parse(extractionCompletion.choices[0].message.content);
    } catch (err) {
        console.error('[AI Setter Extraction Error]:', err.message);
    }

    // 7. Save or update lead in CRM
    const existingLead = await new Promise((resolve, reject) => {
        db.get(`SELECT * FROM leads WHERE phone = ?`, [phone], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    let leadId = null;

    if (existingLead) {
        leadId = existingLead.id;
        const updatedName = (extracted.name && !extracted.name.includes("Prospecto WhatsApp")) ? extracted.name : existingLead.name;
        const updatedEmail = extracted.email || existingLead.email;
        const updatedAddress = extracted.address || existingLead.address;
        const updatedZip = extracted.zipcode || existingLead.zipcode;
        const updatedBill = extracted.bill_over_100 || existingLead.bill_over_100;
        const updatedCredit = extracted.credit_score || existingLead.credit_score;
        const updatedRoof = extracted.roof_type || existingLead.roof_type;
        const updatedOwner = extracted.is_owner || existingLead.is_owner;

        await new Promise((resolve, reject) => {
            db.run(
                `UPDATE leads SET name = ?, email = ?, address = ?, zipcode = ?, bill_over_100 = ?, credit_score = ?, roof_type = ?, is_owner = ? WHERE id = ?`,
                [updatedName, updatedEmail || null, updatedAddress, updatedZip, updatedBill, updatedCredit, updatedRoof, updatedOwner, leadId],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    } else {
        const name = extracted.name || `Prospecto WhatsApp (${phone})`;
        const email = extracted.email || null;
        
        await new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO leads (name, phone, address, email, zipcode, bill_over_100, credit_score, roof_type, is_owner) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, phone, extracted.address || '', email, extracted.zipcode || '', extracted.bill_over_100 || '', extracted.credit_score || '', extracted.roof_type || '', extracted.is_owner || ''],
                function(err) {
                    if (err) reject(err);
                    else {
                        leadId = this.lastID;
                        resolve();
                    }
                }
            );
        });
        // Disparar CAPI Lead (es un nuevo prospecto)
        sendMetaConversionsAPI({ id: leadId, name, phone, email }, 'Lead');
    }

    // 8. Register/Update Appointment if extracted
    if (extracted.appointment_date && extracted.appointment_date.trim() !== '') {
        const existingAppt = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM appointments WHERE lead_id = ?`, [leadId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!existingAppt) {
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO appointments (lead_id, appointment_time, notes) VALUES (?, ?, ?)`,
                    [leadId, extracted.appointment_date, 'Cita agendada automáticamente por el AI Setter Sol en WhatsApp.'],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
            console.log(`[AI Setter] Cita agendada para el Lead ${leadId} el ${extracted.appointment_date}`);
            // Disparar CAPI Schedule
            sendMetaConversionsAPI(existingLead || { id: leadId, phone, name: extracted.name, email: extracted.email }, 'Schedule');
        } else if (existingAppt.appointment_time !== extracted.appointment_date) {
            await new Promise((resolve, reject) => {
                db.run(
                    `UPDATE appointments SET appointment_time = ?, notes = ? WHERE id = ?`,
                    [extracted.appointment_date, 'Cita reprogramada automáticamente por el AI Setter Sol en WhatsApp.', existingAppt.id],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
            console.log(`[AI Setter] Cita reprogramada para el Lead ${leadId} al ${extracted.appointment_date}`);
            // Disparar CAPI Schedule
            sendMetaConversionsAPI(existingLead || { id: leadId, phone, name: extracted.name, email: extracted.email }, 'Schedule');
        }
    }

    const finalLeadState = await new Promise((resolve, reject) => {
        db.get(`SELECT * FROM leads WHERE phone = ?`, [phone], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    if (finalLeadState && finalLeadState.bill_over_100 === 'yes' && finalLeadState.is_owner === 'yes' && finalLeadState.credit_score === 'yes') {
        console.log(`[AI Setter] Lead ${leadId} PRE-CALIFICADO. Listo para enviar.`);
        // Disparar CAPI QualifiedLead
        sendMetaConversionsAPI(finalLeadState, 'QualifiedLead');
        try {
            await fetch(MAKE_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'whatsapp_qualified_lead',
                    id: leadId,
                    name: finalLeadState.name,
                    phone: finalLeadState.phone,
                    address: finalLeadState.address,
                    email: finalLeadState.email,
                    zipcode: finalLeadState.zipcode,
                    bill_over_100: finalLeadState.bill_over_100,
                    credit_score: finalLeadState.credit_score,
                    roof_type: finalLeadState.roof_type,
                    is_owner: finalLeadState.is_owner
                })
            });
            console.log('[Make.com] Webhook de Lead de WhatsApp precalificado enviado.');
        } catch (webhookError) {
            console.error('[Make.com] Error webhook whatsapp lead:', webhookError.message);
        }
    }

    return {
        reply: botReply,
        leadState: finalLeadState
    };
}

// Meta Webhook Verification
app.get('/api/webhook/whatsapp', (req, res) => {
    const verifyToken = process.env.WHATSAPP_VERIFICATION_TOKEN || 'sol_secret_token_123';
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode && token) {
        if (mode === 'subscribe' && token === verifyToken) {
            console.log('[WhatsApp Webhook] Verificado con éxito.');
            return res.status(200).send(challenge);
        }
    }
    res.status(403).send('Forbidden');
});

// Meta Webhook Receiver
app.post('/api/webhook/whatsapp', async (req, res) => {
    try {
        const body = req.body;
        if (body.object === 'whatsapp_business_account') {
            const entry = body.entry && body.entry[0];
            const change = entry && entry.changes && entry.changes[0];
            const value = change && change.value;
            const message = value && value.messages && value.messages[0];
            
            if (message && message.text) {
                const phone = message.from;
                const userMessage = message.text.body;
                console.log(`[WhatsApp Webhook] Mensaje recibido de ${phone}: "${userMessage}"`);
                
                const result = await processWhatsAppAI(phone, userMessage);
                await sendWhatsAppMessage(phone, result.reply);
            }
        }
        res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
        console.error('[WhatsApp Webhook Error]:', error.message);
        res.status(500).send('Error');
    }
});

// Simulator Endpoint
app.post('/api/whatsapp/simulate', async (req, res) => {
    const { phone, message } = req.body;
    if (!phone || !message) {
        return res.status(400).json({ error: 'phone y message son requeridos.' });
    }
    try {
        const result = await processWhatsAppAI(phone, message);
        res.json(result);
    } catch (error) {
        console.error('[WhatsApp Simulación Error]:', error.message);
        res.status(500).json({ error: 'Error procesando simulación con IA.' });
    }
});

// List all chat sessions
app.get('/api/whatsapp/chats', (req, res) => {
    db.all(`SELECT DISTINCT phone FROM whatsapp_chats ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ chats: rows.map(r => r.phone) });
    });
});

// Get chat history for a session
app.get('/api/whatsapp/chats/:phone', (req, res) => {
    db.all(`SELECT * FROM whatsapp_chats WHERE phone = ? ORDER BY created_at ASC`, [req.params.phone], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        db.get(`SELECT * FROM leads WHERE phone = ?`, [req.params.phone], (errLead, leadRow) => {
            // Get appointment for this lead if exists
            if (leadRow) {
                db.get(`SELECT * FROM appointments WHERE lead_id = ?`, [leadRow.id], (errAppt, apptRow) => {
                    res.json({ 
                        messages: rows,
                        leadState: { ...leadRow, appointment_date: apptRow ? apptRow.appointment_time : null }
                    });
                });
            } else {
                res.json({ 
                    messages: rows,
                    leadState: null
                });
            }
        });
    });
});

// GET list of all appointments for dashboard calendar/agenda
app.get('/api/appointments', (req, res) => {
    const query = `
        SELECT a.id, a.appointment_time, a.notes, l.name, l.phone, l.email, l.is_owner, l.bill_over_100, l.credit_score
        FROM appointments a
        JOIN leads l ON a.lead_id = l.id
        ORDER BY a.appointment_time ASC
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ appointments: rows });
    });
});

// ==========================================
// VAPI IA VOICE AGENT WEBHOOK & LOGS
// ==========================================

// GET list of all voice calls
app.get('/api/voice-calls', (req, res) => {
    db.all(`SELECT * FROM voice_calls ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ calls: rows });
    });
});

// Vapi end-of-call Webhook
app.post('/api/webhook/vapi', async (req, res) => {
    try {
        const payload = req.body;
        console.log('[Vapi Webhook] Recibido webhook de Vapi.');
        
        const message = payload.message || {};
        if (message.type !== 'end-of-call-report') {
            return res.status(200).json({ success: true, message: 'Evento ignorado. Solo procesamos end-of-call-report' });
        }

        const call = message.call || {};
        const analysis = message.analysis || {};
        const structuredData = analysis.structuredData || {};

        const callId = call.id || `vapi-${Date.now()}`;
        const phone = call.customer?.number || '';
        const duration = call.duration ? Math.round(call.duration).toString() : '0';
        const recordingUrl = call.recordingUrl || '';
        const summary = analysis.summary || 'Sin resumen.';
        const transcript = analysis.transcript || 'Sin transcripción.';

        // Determinar si califica según el structuredData del agente de voz
        const isOwner = (structuredData.is_owner || '').toLowerCase() === 'yes' ? 'yes' : ((structuredData.is_owner || '').toLowerCase() === 'no' ? 'no' : '');
        const billOver100 = (structuredData.bill_over_100 || '').toLowerCase() === 'yes' ? 'yes' : ((structuredData.bill_over_100 || '').toLowerCase() === 'no' ? 'no' : '');
        const creditScore = (structuredData.credit_score || '').toLowerCase() === 'yes' ? 'yes' : ((structuredData.credit_score || '').toLowerCase() === 'no' ? 'no' : '');
        const name = structuredData.name || `Llamada de Voz (${phone})`;
        const email = structuredData.email || null;
        const address = structuredData.address || '';
        const zipcode = structuredData.zipcode || '';
        const roofType = structuredData.roof_type || '';

        const isQualified = isOwner === 'yes' && billOver100 === 'yes' && creditScore === 'yes';
        const status = isQualified ? 'qualified' : (isOwner === 'no' || billOver100 === 'no' || creditScore === 'no' ? 'not_qualified' : 'pending');

        console.log(`[Vapi Webhook] Llamada terminada. Cliente: ${name}, Teléfono: ${phone}, Duración: ${duration}s, Califica: ${isQualified}`);

        // 1. Guardar la llamada en la tabla voice_calls
        const insertCallQuery = `INSERT OR REPLACE INTO voice_calls (vapi_call_id, phone, customer_name, duration, recording_url, summary, transcript, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        await new Promise((resolve, reject) => {
            db.run(insertCallQuery, [callId, phone, name, duration, recordingUrl, summary, transcript, status], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });

        // 2. Insertar o actualizar el lead en la base de datos
        if (phone && phone.trim() !== '') {
            const existingLead = await new Promise((resolve, reject) => {
                db.get(`SELECT * FROM leads WHERE phone = ?`, [phone], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            let leadId = null;

            if (existingLead) {
                leadId = existingLead.id;
                const updatedName = (name && !name.includes("Llamada de Voz")) ? name : existingLead.name;
                const updatedEmail = email || existingLead.email;
                const updatedAddress = address || existingLead.address;
                const updatedZip = zipcode || existingLead.zipcode;
                const updatedBill = billOver100 || existingLead.bill_over_100;
                const updatedCredit = creditScore || existingLead.credit_score;
                const updatedRoof = roofType || existingLead.roof_type;
                const updatedOwner = isOwner || existingLead.is_owner;

                await new Promise((resolve, reject) => {
                    db.run(
                        `UPDATE leads SET name = ?, email = ?, address = ?, zipcode = ?, bill_over_100 = ?, credit_score = ?, roof_type = ?, is_owner = ? WHERE id = ?`,
                        [updatedName, updatedEmail || null, updatedAddress, updatedZip, updatedBill, updatedCredit, updatedRoof, updatedOwner, leadId],
                        (err) => {
                            if (err) reject(err);
                            else resolve();
                        }
                    );
                });
            } else {
                await new Promise((resolve, reject) => {
                    db.run(
                        `INSERT INTO leads (name, phone, address, email, zipcode, bill_over_100, credit_score, roof_type, is_owner) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [name, phone, address, email, zipcode, billOver100, creditScore, roofType, isOwner],
                        function(err) {
                            if (err) reject(err);
                            else {
                                leadId = this.lastID;
                                resolve();
                            }
                        }
                    );
                });
                // Disparar CAPI Lead (es un nuevo prospecto)
                sendMetaConversionsAPI({ id: leadId, name, phone, email }, 'Lead');
            }

            // 3. Si coordinan cita en la llamada (o en los datos estructurados), agendarla
            const appointmentDate = structuredData.appointment_date;
            if (appointmentDate && appointmentDate.trim() !== '') {
                const existingAppt = await new Promise((resolve, reject) => {
                    db.get(`SELECT * FROM appointments WHERE lead_id = ?`, [leadId], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });

                if (!existingAppt) {
                    await new Promise((resolve, reject) => {
                        db.run(
                            `INSERT INTO appointments (lead_id, appointment_time, notes) VALUES (?, ?, ?)`,
                            [leadId, appointmentDate, 'Cita agendada automáticamente por el Agente de Voz (Sol) en Vapi.'],
                            (err) => {
                                if (err) reject(err);
                                else resolve();
                            }
                        );
                    });
                    // Disparar CAPI Schedule
                    sendMetaConversionsAPI({ id: leadId, name, phone, email }, 'Schedule');
                }
            }

            // 4. Si califica, enviar alertas y webhook de Make
            if (isQualified) {
                // Disparar CAPI QualifiedLead
                sendMetaConversionsAPI({ id: leadId, name, phone, email }, 'QualifiedLead');
                // Enviar Correo al Administrador
                const mailOptions = {
                    from: `Equity Solar <${process.env.GMAIL_USER || 'ehbequitysolar@gmail.com'}>`,
                    to: process.env.GMAIL_USER || 'ehbequitysolar@gmail.com',
                    subject: `☀️ NUEVO LEAD SOLAR POR TELÉFONO: ${name}`,
                    text: `Felicidades! Tienes un nuevo lead calificado por llamada de voz.\n\nNombre: ${name}\nTeléfono: ${phone}\nEmail: ${email}`,
                    html: generateAdminEmailHTML({ name, phone, address, email, zipcode, is_owner: isOwner, bill_over_100: billOver100, credit_score: creditScore, roof_type: roofType })
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) console.error('Error al enviar correo de llamada:', error.message);
                });

                // Enviar correo de bienvenida al cliente
                if (email && email.trim() !== '') {
                    const clientMailOptions = {
                        from: `Equity Solar <${process.env.GMAIL_USER || 'ehbequitysolar@gmail.com'}>`,
                        to: email,
                        subject: `☀️ ¡Bienvenido a Equity Solar! Tu llamada con Sol ha sido procesada`,
                        text: `¡Hola ${name}! Gracias por hablar con Sol. Tu cotización de renta solar está en proceso.`,
                        html: generateClientEmailHTML({ name })
                    };
                    transporter.sendMail(clientMailOptions, (error, info) => {
                        if (error) console.error('Error al enviar correo cliente llamada:', error.message);
                    });
                }

                // Enviar webhook a Make.com
                try {
                    await fetch(MAKE_WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event: 'voice_qualified_lead',
                            id: leadId,
                            name: name,
                            phone: phone,
                            address: address,
                            email: email,
                            zipcode: zipcode,
                            bill_over_100: billOver100,
                            credit_score: creditScore,
                            roof_type: roofType,
                            is_owner: isOwner,
                            call_recording: recordingUrl
                        })
                    });
                } catch (webhookError) {
                    console.error('[Make.com] Error webhook voice lead:', webhookError.message);
                }
            }
        }

        res.status(200).json({ success: true, callId, status });

    } catch (error) {
        console.error('[Vapi Webhook Error]:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// INTEGRACIÓN DE FORMULARIOS DE META ADS (Webhook)
// ==========================================

// 1. Verificación del Webhook de Meta Leads
app.get('/api/webhook/facebook', (req, res) => {
    const verifyToken = process.env.META_LEADS_VERIFICATION_TOKEN || 'meta_leads_secret_token_123';
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode && token) {
        if (mode === 'subscribe' && token === verifyToken) {
            console.log('[Meta Webhook] Verificado con éxito.');
            return res.status(200).send(challenge);
        }
    }
    res.status(403).send('Forbidden');
});

// 2. Receptor de Leads de Meta Ads
app.post('/api/webhook/facebook', async (req, res) => {
    try {
        const body = req.body;
        console.log('[Meta Webhook] Petición de webhook recibida:', JSON.stringify(body));

        if (body.object === 'page') {
            const entries = body.entry || [];
            for (const entry of entries) {
                const changes = entry.changes || [];
                for (const change of changes) {
                    if (change.field === 'leadgen') {
                        const leadgenId = change.value?.leadgen_id;
                        if (leadgenId) {
                            console.log(`[Meta Webhook] Procesando Leadgen ID: ${leadgenId}`);
                            await fetchAndProcessMetaLead(leadgenId);
                        }
                    }
                }
            }
        }
        res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
        console.error('[Meta Webhook Error]:', error.message);
        res.status(500).send('Error');
    }
});

// Función auxiliar para descargar los datos de la API de Meta Graph
async function fetchAndProcessMetaLead(leadgenId) {
    const accessToken = process.env.META_ACCESS_TOKEN;
    if (!accessToken) {
        console.error('[Meta Webhook Error] Falta configurar META_ACCESS_TOKEN en el archivo .env');
        return;
    }

    try {
        const url = `https://graph.facebook.com/v20.0/${leadgenId}?access_token=${accessToken}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error('[Meta Graph API Error]:', data.error.message);
            return;
        }

        console.log('[Meta Graph API] Datos del lead recibidos:', JSON.stringify(data));

        const fieldData = data.field_data || [];
        let name = '';
        let phone = '';
        let email = '';
        let zipcode = '';
        let address = '';
        let isOwner = '';
        let billOver100 = '';
        let creditScore = '';
        let roofType = '';

        fieldData.forEach(field => {
            const fieldName = (field.name || '').toLowerCase();
            const value = field.values && field.values[0] ? field.values[0].trim() : '';

            if (fieldName === 'full_name' || fieldName === 'name' || fieldName === 'nombre') {
                name = value;
            } else if (fieldName === 'phone_number' || fieldName === 'phone' || fieldName === 'telefono' || fieldName === 'teléfono') {
                phone = value;
            } else if (fieldName === 'email' || fieldName === 'correo' || fieldName === 'correo_electronico' || fieldName === 'correo_electrónico') {
                email = value;
            } else if (fieldName === 'zip_code' || fieldName === 'zipcode' || fieldName === 'zip' || fieldName === 'codigo_postal' || fieldName === 'código_postal') {
                zipcode = value;
            } else if (fieldName === 'address' || fieldName === 'direccion' || fieldName === 'dirección') {
                address = value;
            } else if (fieldName === 'is_owner' || fieldName === 'es_dueno' || fieldName === 'es_dueño' || fieldName === 'propietario') {
                const lowerVal = value.toLowerCase();
                isOwner = (lowerVal === 'yes' || lowerVal === 'si' || lowerVal === 'sí' || lowerVal === 'true') ? 'yes' : 'no';
            } else if (fieldName === 'bill_over_100' || fieldName === 'factura_mas_100' || fieldName === 'factura_más_100') {
                const lowerVal = value.toLowerCase();
                billOver100 = (lowerVal === 'yes' || lowerVal === 'si' || lowerVal === 'sí' || lowerVal === 'true') ? 'yes' : 'no';
            } else if (fieldName === 'credit_score' || fieldName === 'credito_mas_650' || fieldName === 'crédito_más_650') {
                const lowerVal = value.toLowerCase();
                creditScore = (lowerVal === 'yes' || lowerVal === 'si' || lowerVal === 'sí' || lowerVal === 'true') ? 'yes' : 'no';
            } else if (fieldName === 'roof_type' || fieldName === 'tipo_techo' || fieldName === 'techo') {
                roofType = value;
            }
        });

        if (!phone || phone === '') {
            console.error('[Meta Webhook] El lead recibido no contiene un número de teléfono válido.');
            return;
        }

        if (!name || name === '') {
            name = `Lead Meta Ads (${phone})`;
        }

        console.log(`[Meta Webhook] Registrando lead: ${name}, Teléfono: ${phone}, Email: ${email}`);

        // Insertar o actualizar en SQLite
        const existingLead = await new Promise((resolve, reject) => {
            db.get(`SELECT * FROM leads WHERE phone = ?`, [phone], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        let leadId = null;

        if (existingLead) {
            leadId = existingLead.id;
            const updatedName = (name && !name.includes("Lead Meta Ads")) ? name : existingLead.name;
            const updatedEmail = email || existingLead.email;
            const updatedAddress = address || existingLead.address;
            const updatedZip = zipcode || existingLead.zipcode;
            const updatedBill = billOver100 || existingLead.bill_over_100;
            const updatedCredit = creditScore || existingLead.credit_score;
            const updatedRoof = roofType || existingLead.roof_type;
            const updatedOwner = isOwner || existingLead.is_owner;

            await new Promise((resolve, reject) => {
                db.run(
                    `UPDATE leads SET name = ?, email = ?, address = ?, zipcode = ?, bill_over_100 = ?, credit_score = ?, roof_type = ?, is_owner = ?, leadgen_id = ? WHERE id = ?`,
                    [updatedName, updatedEmail || null, updatedAddress, updatedZip, updatedBill, updatedCredit, updatedRoof, updatedOwner, leadgenId, leadId],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        } else {
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO leads (name, phone, address, email, zipcode, bill_over_100, credit_score, roof_type, is_owner, leadgen_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [name, phone, address, email || null, zipcode, billOver100, creditScore, roofType, isOwner, leadgenId],
                    function(err) {
                        if (err) reject(err);
                        else {
                            leadId = this.lastID;
                            resolve();
                        }
                    }
                );
            });
        }

        // Si califica, enviar emails HTML y disparar Webhook de Make.com
        const isQualified = isOwner === 'yes' && billOver100 === 'yes' && creditScore === 'yes';

        const leadObj = { id: leadId, name, phone, email, leadgen_id: leadgenId };
        // Disparar CAPI Lead (es un nuevo lead que capturamos en el CRM)
        sendMetaConversionsAPI(leadObj, 'Lead');

        if (isQualified) {
            // Disparar CAPI QualifiedLead
            sendMetaConversionsAPI(leadObj, 'QualifiedLead');
        }

        // Enviar Correo Electrónico al Administrador (HTML Alerta)
        const mailOptions = {
            from: `Equity Solar <${process.env.GMAIL_USER || 'ehbequitysolar@gmail.com'}>`,
            to: process.env.GMAIL_USER || 'ehbequitysolar@gmail.com',
            subject: `☀️ NUEVO LEAD SOLAR META ADS: ${name}`,
            text: `Felicidades! Tienes un nuevo lead registrado por formulario de Meta Ads.\n\nNombre: ${name}\nTeléfono: ${phone}\nEmail: ${email}`,
            html: generateAdminEmailHTML({ name, phone, address, email, zipcode, is_owner: isOwner, bill_over_100: billOver100, credit_score: creditScore, roof_type: roofType })
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.error('[Meta Webhook] Error al enviar correo alerta admin:', error.message);
        });

        // Enviar Correo de Bienvenida al Cliente
        if (email && email.trim() !== '') {
            const clientMailOptions = {
                from: `Equity Solar <${process.env.GMAIL_USER || 'ehbequitysolar@gmail.com'}>`,
                to: email,
                subject: `☀️ ¡Bienvenido a Equity Solar! Tu registro ha sido recibido`,
                text: `¡Hola ${name}! Gracias por tu interés en los programas de renta solar de Equity Solar.`,
                html: generateClientEmailHTML({ name })
            };
            transporter.sendMail(clientMailOptions, (error, info) => {
                if (error) console.error('[Meta Webhook] Error al enviar correo cliente:', error.message);
            });
        }

        // Enviar webhook a Make.com
        try {
            await fetch(MAKE_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'meta_lead',
                    id: leadId,
                    name: name,
                    phone: phone,
                    address: address,
                    email: email,
                    zipcode: zipcode,
                    bill_over_100: billOver100,
                    credit_score: creditScore,
                    roof_type: roofType,
                    is_owner: isOwner,
                    is_qualified: isQualified
                })
            });
            console.log('[Make.com] Webhook de Lead de Meta enviado con éxito.');
        } catch (webhookError) {
            console.error('[Make.com] Error webhook meta lead:', webhookError.message);
        }

    } catch (err) {
        console.error('[Meta Graph Lead error]:', err.message);
    }
}

// ==========================================
// PLANTILLAS DE CORREO ELECTRONICO HTML (PREMIUM)
// ==========================================

function generateAdminEmailHTML(lead) {
    const badge = (val) => {
        if (!val) return '<span style="background-color: #ffd166; color: #0b0f19; padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: bold;">PENDIENTE</span>';
        return val.toLowerCase() === 'yes'
            ? '<span style="background-color: #06d6a0; color: #0b0f19; padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: bold;">SÍ ✅</span>'
            : '<span style="background-color: #ef476f; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: bold;">NO ❌</span>';
    };

    return `
    <div style="font-family: 'Outfit', sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 30px; border-radius: 20px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px;">
            <h2 style="color: #ffb703; font-family: 'Space Grotesk', sans-serif; font-size: 24px; margin: 0;">☀️ NUEVO LEAD SOLAR REGISTRADO</h2>
            <p style="color: #94a3b8; font-size: 14px; margin: 5px 0 0 0;">Notificación automática del CRM SolarNext</p>
        </div>
        
        <div style="background-color: rgba(255,255,255,0.03); padding: 20px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px;">
            <h3 style="color: #219ebc; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 5px; font-size: 16px;">Datos de Contacto</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                    <td style="color: #94a3b8; padding: 8px 0; width: 40%;"><strong>Nombre:</strong></td>
                    <td style="color: white; padding: 8px 0;">\${lead.name}</td>
                </tr>
                <tr>
                    <td style="color: #94a3b8; padding: 8px 0;"><strong>Teléfono:</strong></td>
                    <td style="color: white; padding: 8px 0;">\${lead.phone}</td>
                </tr>
                <tr>
                    <td style="color: #94a3b8; padding: 8px 0;"><strong>Email:</strong></td>
                    <td style="color: white; padding: 8px 0;">\${lead.email || '-'}</td>
                </tr>
                <tr>
                    <td style="color: #94a3b8; padding: 8px 0;"><strong>Dirección:</strong></td>
                    <td style="color: white; padding: 8px 0;">\${lead.address || '-'}</td>
                </tr>
                <tr>
                    <td style="color: #94a3b8; padding: 8px 0;"><strong>Código Postal (ZIP):</strong></td>
                    <td style="color: white; padding: 8px 0;">\${lead.zipcode || '-'}</td>
                </tr>
            </table>
        </div>

        <div style="background-color: rgba(255,255,255,0.03); padding: 20px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05);">
            <h3 style="color: #219ebc; margin-top: 0; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 5px; font-size: 16px;">Criterios de Calificación</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                    <td style="color: #94a3b8; padding: 8px 0; width: 60%;"><strong>¿Dueño de Propiedad?</strong></td>
                    <td style="padding: 8px 0;">\${badge(lead.is_owner)}</td>
                </tr>
                <tr>
                    <td style="color: #94a3b8; padding: 8px 0;"><strong>¿Factura mensual > $100?</strong></td>
                    <td style="padding: 8px 0;">\${badge(lead.bill_over_100)}</td>
                </tr>
                <tr>
                    <td style="color: #94a3b8; padding: 8px 0;"><strong>¿Crédito mayor a 650?</strong></td>
                    <td style="padding: 8px 0;">\${badge(lead.credit_score)}</td>
                </tr>
                <tr>
                    <td style="color: #94a3b8; padding: 8px 0;"><strong>Tipo de Techo:</strong></td>
                    <td style="color: white; padding: 8px 0; text-transform: capitalize;">\${lead.roof_type || '-'}</td>
                </tr>
            </table>
        </div>

        <div style="text-align: center; margin-top: 25px; font-size: 12px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
            Este prospecto ha sido enviado de forma automatizada a Make.com y guardado en la base de datos CRM.
        </div>
    </div>
    `;
}

function generateClientEmailHTML(lead) {
    return `
    <div style="font-family: 'Outfit', sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 30px; border-radius: 20px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px;">
            <h2 style="color: #ffb703; font-family: 'Space Grotesk', sans-serif; font-size: 26px; margin: 0;">☀️ ¡BIENVENIDO A EQUITY SOLAR!</h2>
            <p style="color: #94a3b8; font-size: 14px; margin: 5px 0 0 0;">Tu transición a la energía solar a costo cero</p>
        </div>
        
        <div style="padding: 10px 0; line-height: 1.6; font-size: 15px; color: #e2e8f0;">
            <p>Hola <strong>\${lead.name}</strong>,</p>
            <p>Te saluda <strong>Sol</strong>, tu asesora de IA de <strong>Equity Solar</strong>. ¡Gracias por registrar tu interés en nuestro programa solar residencial de renta para el estado de Florida!</p>
            
            <p>He recibido tus datos y estoy analizando tu información. El objetivo principal de nuestro programa es <strong>eliminar por completo tu factura de luz actual, cambiándola por una tarifa solar fija que sea menor de lo que pagas hoy</strong>, todo esto <strong>sin inversión inicial ni costos de instalación</strong>.</p>
            
            <p><strong>¿Cuáles son los siguientes pasos?</strong></p>
            <ol style="margin-left: 20px; padding-left: 0; color: #e2e8f0;">
                <li style="margin-bottom: 8px;">Revisaremos tu consumo eléctrico actual y la viabilidad técnica de tu techo mediante satélite.</li>
                <li style="margin-bottom: 8px;">Un asesor humano experto de nuestro equipo se comunicará contigo (vía telefónica o WhatsApp) para presentarte tu diseño y proyección de ahorro de forma gratuita.</li>
            </ol>

            <p style="margin-top: 25px; text-align: center;">
                <a href="https://wa.me/13058136159?text=Hola,%20registre%20mis%20datos%20con%20Sol%20y%20me%20gustaria%20coordinar%20mi%20diseno%20solar." 
                   style="background: linear-gradient(135deg, #fb8500 0%, #ffb703 100%); color: #0b0f19; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; display: inline-block; font-size: 15px; box-shadow: 0 4px 15px rgba(251, 133, 0, 0.3);">
                   💬 Hablar con un Asesor por WhatsApp
                </a>
            </p>
        </div>

        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; line-height: 1.4;">
            <strong>Equity Solar Florida</strong><br>
            Contacto: (305) 813-6159 | Miami - Orlando<br>
            <a href="https://ehbequitysolar.com" style="color: #219ebc; text-decoration: none;">ehbequitysolar.com</a><br><br>
            <span style="color: #64748b; font-size: 11px;">Este es un correo automático. Si no solicitaste información, puedes ignorar este mensaje.</span>
        </div>
    </div>
    `;
}

// Endpoint de Análisis de Reporte de Crédito por IA
app.post('/api/credit-repair/analyze', async (req, res) => {
    const { text, fileType } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'El texto del reporte es requerido' });
    }

    try {
        const prompt = `Eres un experto legal en reparación de crédito en EE. UU., especializado en la ley Fair Credit Reporting Act (FCRA).
Analiza el siguiente texto extraído de un reporte de crédito (o respuesta de un buró de crédito) y extrae de forma estructurada todas las cuentas negativas, pagos atrasados, colecciones o errores.

Texto del reporte a analizar:
"""
${text}
"""

Devuelve un JSON estrictamente estructurado con las siguientes propiedades:
{
  "summary": "Resumen profesional de la salud crediticia y el puntaje estimado encontrado (si se menciona).",
  "baseScore": 550, // Un número estimado de puntaje inicial basado en el reporte (por defecto 550 si no se deduce)
  "accounts": [
    {
      "creditor": "Nombre del acreedor o agencia de cobranza",
      "accountNumber": "Número de cuenta o identificador",
      "balance": "$Monto debido (si aplica)",
      "status": "Colección, Pago Atrasado, Pérdida (Charge-off), etc.",
      "disputeReason": "The legal reason under the FCRA to dispute this account (e.g., 'Account does not contain original physical contract signature under Sec 609' or 'Inaccurate balance reported' or 'Duplicate account reported'). MUST be written in English.",
      "recommendedLetter": "round1" // O "609" o "paydelete" o "goodwill" según convenga
    }
  ],
  "inconsistencies": [
    "Lista de errores de formato o discrepancias encontradas en el reporte. En inglés o español."
  ],
  "strategies": [
    "Step-by-step credit building strategy tailored to this profile (e.g., 'Apply the AZEO method to optimize card utilization to under 6%' or 'Send a Pay for Delete agreement to creditor X' or 'Open a secured credit card to establish positive payment history'). MUST be written in English."
  ],
  "nextAction": "Explicación breve de la acción inmediata sugerida para avanzar al siguiente paso del plan."
}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Eres un analista de crédito experto que devuelve respuestas únicamente en formato JSON válido." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const resultText = response.choices[0].message.content.trim();
        const jsonResult = JSON.parse(resultText);
        res.json(jsonResult);
    } catch (error) {
        console.error('Error al analizar crédito:', error.message);
        res.status(500).json({ error: 'Error interno al procesar el reporte con IA: ' + error.message });
    }
});

// Helper de envío de correo con enlace de descarga
async function sendDownloadEmail(toEmail, downloadLink) {
    if (!toEmail) return;
    const mailOptions = {
        from: process.env.GMAIL_USER || 'ehbequitysolar@gmail.com',
        to: toEmail,
        subject: '📥 Tu Aplicación del Reparador de Crédito por IA está lista',
        html: `
            <div style="font-family: 'Outfit', sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 30px; border-radius: 20px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
                <div style="text-align: center; margin-bottom: 25px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px;">
                    <h2 style="color: #ffb703; font-family: 'Space Grotesk', sans-serif; font-size: 24px; margin: 0;">¡GRACIAS POR TU COMPRA!</h2>
                    <p style="color: #94a3b8; font-size: 14px; margin: 5px 0 0 0;">Tu herramienta personal de Reparación de Crédito por IA</p>
                </div>
                
                <div style="padding: 10px 0; line-height: 1.6; font-size: 15px; color: #e2e8f0;">
                    <p>Hola,</p>
                    <p>Tu pago de <strong>$1.00 USD</strong> ha sido procesado con éxito.</p>
                    <p>Hemos preparado tu enlace de descarga especializado para que puedas descargar la aplicación unificada en cualquier dispositivo móvil (iPhone, Android) o de escritorio (PC, Mac):</p>
                    <p style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; border-left: 3px solid #ffb703; font-size: 13px; margin: 15px 0;">
                        <strong>Novedades de esta versión única:</strong><br>
                        • Pestaña dedicada con asistente de <strong>Eliminación de Bancarrotas</strong>.<br>
                        • Traducción e internacionalización al 100% en <strong>Español e Inglés</strong>.<br>
                        • Enlace dinámico optimizado compatible con servidores en la nube y local.<br>
                        • Instrucciones y accesos directos automatizados para el escritorio.
                    </p>
                    
                    <p style="margin-top: 25px; text-align: center;">
                        <a href="${downloadLink}" 
                           style="background: linear-gradient(135deg, #fb8500 0%, #ffb703 100%); color: #0b0f19; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; display: inline-block; font-size: 15px; box-shadow: 0 4px 15px rgba(251, 133, 0, 0.3);">
                           📥 Descargar Reparador de Crédito
                        </a>
                    </p>
                    
                    <p style="margin-top: 25px; font-size: 13px; color: #94a3b8;">
                        <strong>Instrucciones rápidas:</strong><br>
                        1. Guarda el archivo descargado en tu Escritorio o dispositivo móvil.<br>
                        2. Hazle doble clic para ejecutarlo.<br>
                        3. En móviles, abre el archivo, ve a la sección de Configuración e ingresa tu OpenAI API Key para que la IA funcione 100% de manera autónoma.
                    </p>
                </div>

                <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; line-height: 1.4;">
                    <strong>Equity Solar Florida</strong><br>
                    Contacto: (305) 813-6159 | Miami - Orlando
                </div>
            </div>
        `
    };
    return transporter.sendMail(mailOptions);
}

// Función para registrar el token de compra único en SQLite
function registerPurchaseToken(email, callback) {
    const token = crypto.randomBytes(16).toString('hex');
    db.run(
        `INSERT INTO purchase_tokens (token, email, status) VALUES (?, ?, 'pending')`,
        [token, email],
        function(err) {
            if (err) {
                console.error("Error al registrar token de compra:", err.message);
                return callback(null);
            }
            callback(token);
        }
    );
}

// Endpoints de Pagos y Descargas de Producto Digital
app.post('/api/payments/create-checkout-session', async (req, res) => {
    const host = req.get('host');
    const protocol = req.protocol;
    const customerEmail = req.body.email || '';
    
    try {
        const sessionConfig = {
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Reparador de Crédito por IA (Aplicación Standalone)',
                        description: 'Simulador FICO inteligente, generador de cartas 609, plan de acción de 90 días y borrado de bancarrotas.',
                    },
                    unit_amount: 100, // $1.00 USD para pruebas
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${protocol}://${host}/api/payments/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(customerEmail)}`,
            cancel_url: `${protocol}://${host}/comprar.html`,
        };

        if (customerEmail) {
            sessionConfig.customer_email = customerEmail;
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);
        res.json({ url: session.url });
    } catch (error) {
        console.error('Error al crear sesión de Stripe:', error.message);
        if (error.message.includes('API key') || error.message.includes('No API key')) {
            console.warn('Simulando sesión de Stripe (Modo Sandbox Mockup)');
            res.json({ url: `${protocol}://${host}/api/payments/success?session_id=mock_session_${Date.now()}&email=${encodeURIComponent(customerEmail)}` });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

app.get('/api/payments/success', async (req, res) => {
    const { session_id, email } = req.query;
    if (!session_id) {
        return res.redirect('/comprar.html');
    }

    const host = req.get('host');
    const protocol = req.protocol;
    
    let buyerEmail = email;

    // Si Stripe está activo y es una sesión real, obtener correo desde Stripe
    if (session_id && !session_id.startsWith('mock_')) {
        try {
            const session = await stripe.checkout.sessions.retrieve(session_id);
            if (session.customer_details && session.customer_details.email) {
                buyerEmail = session.customer_details.email;
            }
        } catch (err) {
            console.warn("No se pudo recuperar la sesión de Stripe:", err.message);
        }
    }

    // Registrar token único en la base de datos
    registerPurchaseToken(buyerEmail || 'stripe_customer@gmail.com', async (token) => {
        if (token) {
            const downloadLink = `${protocol}://${host}/api/payments/download?token=${token}`;
            
            // Enviar el correo electrónico
            if (buyerEmail) {
                try {
                    await sendDownloadEmail(buyerEmail, downloadLink);
                    console.log(`Enlace de descarga único enviado a: ${buyerEmail}`);
                } catch (emailErr) {
                    console.error(`Fallo al enviar correo a ${buyerEmail}:`, emailErr.message);
                }
            }
            res.redirect(`/descargar.html?token=${token}`);
        } else {
            res.redirect('/comprar.html');
        }
    });
});

app.post('/api/payments/zelle-notify', async (req, res) => {
    const { email, reference } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'El correo electrónico es requerido' });
    }

    const host = req.get('host');
    const protocol = req.protocol;

    registerPurchaseToken(email, async (token) => {
        if (!token) {
            return res.status(500).json({ error: 'Error al registrar token de descarga.' });
        }
        
        const downloadLink = `${protocol}://${host}/api/payments/download?token=${token}`;

        try {
            // Enviar correo de descarga única al comprador
            await sendDownloadEmail(email, downloadLink);

            // Notificar al administrador sobre el pago por Zelle
            const adminMailOptions = {
                from: process.env.GMAIL_USER || 'ehbequitysolar@gmail.com',
                to: process.env.GMAIL_USER || 'ehbequitysolar@gmail.com',
                subject: '🔔 Nuevo Pago por Zelle a Verificar - Reparador de Crédito',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <h3>Nuevo Aviso de Pago de Zelle</h3>
                        <p><strong>Correo del Comprador:</strong> ${email}</p>
                        <p><strong>Referencia/Mensaje:</strong> ${reference || 'No provisto'}</p>
                        <p><strong>Monto esperado:</strong> $1.00 USD</p>
                        <p>El sistema ha enviado automáticamente el enlace de descarga único: ${downloadLink}</p>
                    </div>
                `
            };
            await transporter.sendMail(adminMailOptions);
            
            res.json({ success: true, redirect: `/descargar.html?token=${token}` });
        } catch (error) {
            console.error('Error al procesar pago Zelle:', error.message);
            res.json({ success: true, redirect: `/descargar.html?token=${token}` });
        }
    });
});

app.post('/api/payments/paypal-success', async (req, res) => {
    const { email, orderId } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'El correo electrónico es requerido' });
    }

    const host = req.get('host');
    const protocol = req.protocol;

    registerPurchaseToken(email, async (token) => {
        if (!token) {
            return res.status(500).json({ error: 'Error al registrar token de descarga.' });
        }

        const downloadLink = `${protocol}://${host}/api/payments/download?token=${token}`;

        try {
            // Enviar correo de descarga única al comprador
            await sendDownloadEmail(email, downloadLink);

            // Notificar al administrador
            const adminMailOptions = {
                from: process.env.GMAIL_USER || 'ehbequitysolar@gmail.com',
                to: process.env.GMAIL_USER || 'ehbequitysolar@gmail.com',
                subject: '🔔 Nuevo Pago por PayPal Recibido - Reparador de Crédito',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <h3>Nuevo Pago Recibido por PayPal</h3>
                        <p><strong>Correo del Comprador:</strong> ${email}</p>
                        <p><strong>ID de Orden PayPal:</strong> ${orderId}</p>
                        <p><strong>Cuenta Destino:</strong> ely.eh59@gmail.com</p>
                        <p><strong>Monto:</strong> $1.00 USD</p>
                        <p>El enlace de descarga único enviado es: ${downloadLink}</p>
                    </div>
                `
            };
            await transporter.sendMail(adminMailOptions);

            res.json({ success: true, redirect: `/descargar.html?token=${token}` });
        } catch (error) {
            console.error('Error al procesar pago PayPal:', error.message);
            res.json({ success: true, redirect: `/descargar.html?token=${token}` });
        }
    });
});

app.post('/api/payments/card-success', async (req, res) => {
    const { email, cardName, cardNumber } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'El correo electrónico es requerido' });
    }

    const host = req.get('host');
    const protocol = req.protocol;

    registerPurchaseToken(email, async (token) => {
        if (!token) {
            return res.status(500).json({ error: 'Error al registrar token de descarga.' });
        }

        const downloadLink = `${protocol}://${host}/api/payments/download?token=${token}`;

        try {
            // Enviar correo de descarga única al comprador
            await sendDownloadEmail(email, downloadLink);

            // Notificar al administrador
            const adminMailOptions = {
                from: process.env.GMAIL_USER || 'ehbequitysolar@gmail.com',
                to: process.env.GMAIL_USER || 'ehbequitysolar@gmail.com',
                subject: '💳 Nuevo Pago con Tarjeta Recibido - Reparador de Crédito',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <h3>Nuevo Pago con Tarjeta de Crédito/Débito</h3>
                        <p><strong>Correo del Comprador:</strong> ${email}</p>
                        <p><strong>Nombre en Tarjeta:</strong> ${cardName || 'No provisto'}</p>
                        <p><strong>Número de Tarjeta (Enmascarado):</strong> **** **** **** ${cardNumber ? cardNumber.slice(-4) : '****'}</p>
                        <p><strong>Monto:</strong> $1.00 USD</p>
                        <p>El enlace de descarga único enviado es: ${downloadLink}</p>
                    </div>
                `
            };
            await transporter.sendMail(adminMailOptions);

            res.json({ success: true, redirect: `/descargar.html?token=${token}` });
        } catch (error) {
            console.error('Error al procesar pago Tarjeta:', error.message);
            res.json({ success: true, redirect: `/descargar.html?token=${token}` });
        }
    });
});

app.get('/api/payments/download', (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(403).send('Acceso denegado: Token de descarga requerido.');
    }

    // Consultar el estado del token único en la base de datos
    db.get(`SELECT * FROM purchase_tokens WHERE token = ?`, [token], (err, row) => {
        if (err || !row) {
            return res.status(403).send(`
                <html>
                <head>
                    <title>Enlace no Válido</title>
                    <style>
                        body { background: #070a13; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; }
                        .box { max-width: 500px; padding: 30px; border: 1px solid #ffb703; border-radius: 12px; background: rgba(255,255,255,0.02); }
                        h2 { color: #ffb703; }
                    </style>
                </head>
                <body>
                    <div class="box">
                        <h2>Acceso Denegado</h2>
                        <p>El token de descarga proporcionado no es válido o ha expirado.</p>
                        <a href="/comprar.html" style="color: #06b6d4; text-decoration: none;">Ir a la tienda</a>
                    </div>
                </body>
                </html>
            `);
        }

        // Si ya fue descargado, impedir el uso compartido (pero permitir re-descargas dentro de los primeros 10 minutos para evitar bloqueos)
        if (row.status === 'used') {
            const downloadedTime = Date.parse(row.downloaded_at + ' UTC') || new Date(row.downloaded_at).getTime();
            const now = Date.now();
            const timeDiffMinutes = (now - downloadedTime) / (1000 * 60);

            if (timeDiffMinutes > 10) {
                return res.status(403).send(`
                    <html>
                    <head>
                        <title>Enlace ya Utilizado</title>
                        <style>
                            body { background: #070a13; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; }
                            .box { max-width: 500px; padding: 30px; border: 1px solid #ef4444; border-radius: 12px; background: rgba(255,255,255,0.02); }
                            h2 { color: #ef4444; }
                            p { margin-bottom: 15px; line-height: 1.5; }
                        </style>
                    </head>
                    <body>
                        <div class="box">
                            <h2>Descarga no Permitida</h2>
                            <p>Este enlace de descarga especializado ya ha sido utilizado para descargar la aplicación en otro dispositivo.</p>
                            <p style="color: #9ca3af; font-size: 0.9rem;">Por razones de seguridad y protección de licencia de autor, cada enlace de compra es de <strong>un único uso</strong> y queda inactivado tras completarse la descarga.</p>
                            <a href="/comprar.html" style="color: #06b6d4; text-decoration: none;">Volver a la tienda</a>
                        </div>
                    </body>
                    </html>
                `);
            }
        }

        // Marcar el token como usado y registrar la IP del dispositivo
        const deviceIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        db.run(`UPDATE purchase_tokens SET status = 'used', downloaded_at = CURRENT_TIMESTAMP, device_ip = ? WHERE token = ?`, [deviceIp, token], (updateErr) => {
            if (updateErr) console.error("Error al inactivar token:", updateErr.message);

            try {
                const filePath = path.join(__dirname, 'Reparador_de_Credito.zip');
                const fileContent = fs.readFileSync(filePath);
                res.setHeader('Content-Type', 'application/zip');
                res.setHeader('Content-Disposition', 'attachment; filename="Reparador_de_Credito.zip"');
                res.send(fileContent);
            } catch (downloadErr) {
                console.error('Error al forzar la descarga del ZIP:', downloadErr.message);
                res.status(500).send("Error al descargar el archivo comprimido.");
            }
        });
    });
});


// Enlace único de pruebas y demostración para Eliecer
app.get('/reparador-de-credito-de-eliecer', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'Reparador_de_Credito.html');
        const html = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    } catch (err) {
        console.error("Error serving Eliecer route:", err.message);
        res.status(500).send("Error al cargar la aplicación.");
    }
});
app.get('/reparador_de_credito_de_eliecer', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'Reparador_de_Credito.html');
        const html = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    } catch (err) {
        console.error("Error serving Eliecer route:", err.message);
        res.status(500).send("Error al cargar la aplicación.");
    }
});

// Ruta de presentación / landing page para clientes potenciales
app.get('/presentacion-reparador-de-credito', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'presentacion.html');
        const html = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    } catch (err) {
        console.error("Error serving presentation route:", err.message);
        res.status(500).send("Error al cargar la presentación.");
    }
});

// Ruta de presentación offline / standalone (todo en un solo archivo)
app.get('/presentacion-standalone', (req, res) => {
    try {
        const filePath = path.join(__dirname, 'presentacion_standalone.html');
        const html = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
    } catch (err) {
        console.error("Error serving standalone presentation route:", err.message);
        res.status(500).send("Error al cargar la presentación standalone.");
    }
});

// Start Server
app.listen(PORT, () => {
    console.log("=================================");
    console.log("🚀 SolarNext Backend API Started");
    console.log("=================================");
    console.log('Server running on: http://localhost:' + PORT);
    console.log('Frontend accessible at: http://localhost:' + PORT + '/index.html');
});


