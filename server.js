const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const nodemailer = require('nodemailer');
const { OpenAI } = require('openai');
const multer = require('multer');

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

// Configuración de OpenAI (Requiere API Key)
const openai = new OpenAI({
    apiKey: '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', // Llave inyectada
});

// Configuración de HeyGen
const HEYGEN_API_KEY = 'sk_V2_hgu_kflLc1YA7kH_rPbPk11piXyUAhh55Kw5dljZaxbMp8vt'; // Llave inyectada

// Configuración de Make.com
const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/if28kqo3pwt68rmsyjvlym52idet20eb';

// Configuración de Email (Requiere App Password de Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ehbequitysolar@gmail.com',
        pass: 'TU_PASSWORD_DE_APLICACION_AQUI' // Reemplazar con el App Password de Google
    }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve static frontend files
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
    }
});

// API Routes

// 1. Capture Leads
app.post('/api/leads', (req, res) => {
    const { name, phone, address, email, zipcode, bill_over_100, credit_score, roof_type, is_owner } = req.body;
    
    if (!email || !name || !phone) {
        return res.status(400).json({ error: 'Nombre, teléfono y email son requeridos' });
    }

    const query = `INSERT INTO leads (name, phone, address, email, zipcode, bill_over_100, credit_score, roof_type, is_owner) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [name, phone, address || '', email, zipcode || '', bill_over_100 || '', credit_score || '', roof_type || '', is_owner || ''], function(err) {
        if (err) {
            if(err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: 'Este correo ya fue registrado anteriormente.' });
            }
            return res.status(500).json({ error: err.message });
        }
        
        // Enviar Correo Electrónico Automático
        const mailOptions = {
            from: 'Sistema SolarNext <ehbequitysolar@gmail.com>',
            to: 'ehbequitysolar@gmail.com',
            subject: `☀️ NUEVO LEAD SOLAR: ${name}`,
            text: `¡Felicidades! Tienes un nuevo prospecto solar.\n\n` +
                  `Detalles del Lead:\n` +
                  `-----------------------\n` +
                  `Nombre: ${name}\n` +
                  `Teléfono: ${phone}\n` +
                  `Dirección: ${address}, CP: ${zipcode}\n` +
                  `Email: ${email}\n` +
                  `¿Dueño de propiedad?: ${is_owner}\n` +
                  `Factura > $100: ${bill_over_100}\n` +
                  `Crédito > 650: ${credit_score}\n` +
                  `Tipo de Techo: ${roof_type}\n\n` +
                  `-- Sistema Automático SolarNext --`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Nota: Correo no enviado. Falta configurar App Password en server.js');
            } else {
                console.log('Correo de alerta enviado:', info.response);
            }
        });

        res.status(201).json({ success: true, id: this.lastID, message: 'Lead guardado con éxito' });
    });
});

// 2. Save Chat Logs
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

// 3. Ask Sol (Inteligencia Artificial con OpenAI)
app.post('/api/ask-sol', async (req, res) => {
    const { message, language } = req.body;
    
    // Validar si el usuario no ha puesto su API KEY aún
    if (openai.apiKey === 'TU_OPENAI_API_KEY_AQUI') {
        return res.status(500).json({ error: 'Falta configurar la OpenAI API Key' });
    }

    try {
        const isEnglish = language === 'en';
        const languageInstruction = isEnglish 
            ? "\n\nCRITICAL INSTRUCTION: The user is speaking English. You MUST reply in English ONLY, maintaining your friendly personality. Translate all your typical Spanish responses and concepts to fluent English."
            : "\n\nCRITICAL INSTRUCTION: You must speak in Spanish (Latin American).";

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { 
                    role: "system", 
                    content: `## Role
You are Sol, a friendly and professional assistant. Your goal is to qualify leads for a solar energy program. You speak natural, conversational Spanish (Latin American).${languageInstruction}

## Personality
- **Tone**: Warm, empathetic, and patient.
- **Style**: Casual but respectful. Avoid overly robotic phrasing.
- **Pacing**: Speak at a moderate pace.

## Instructions
1.  **Introduction**: Greet the user warmly and state you are calling about a potential benefit to rent solar panels. 
2.  **inform**: •Razón de la llamada: "El motivo de mi mensaje es que recibimos sus datos a través de un formulario en uno de nuestros videos sobre programas de energía limpia en redes sociales. ¿Tiene un momento para conversar?" [ESPERAR RESPUESTA]
•	Si dice SÍ: "¡Excelente! Como sabe, Florida es un área ideal para la energía solar y queremos ayudarle a aprovechar los beneficios actuales."
•	Si duda/No tiene tiempo: "Prometo ser muy breve. Esta información puede ser realmente beneficiosa para su economía. ¿Le puedo robar solo un minuto?" [ESPERAR RESPUESTA]
3. **Pitch**: Presentación de la Oportunidad (El Gancho)
4.  **Information Gathering**: You need to collect the following information one by one. Do not ask for everything at once.
    - **Name**: Ask for their full name.
    - **Homeowner Status**: Confirm if they own their home.
    - **Electricity Bill**: Ask roughly how much they pay monthly for electricity.
    - **Address**: Ask for their home address to check eligibility.
5.  **Pauses**: After asking a question, wait for the user to answer. Do not rush.
6.  **Clarification**: If you didn't hear well, politely ask them to repeat.
7.  **Closing**: Once you have the info, thank them and say a specialist will review it.
8. **agendar**: Concretar la cita con el consultor.

## Key Behaviors
- **Dialogue Style**: Keep your responses concise (1-2 sentences). Do not monologue.
- **Wait for Input**: After every question, STOP speaking and wait for the user to answer.
- **Active Listening**: If the user is speaking, do not interrupt unless they stop.
- **Acknowledge**: Use fillers like "Entiendo", "Ah, ya veo", "Perfecto" naturally.

## Example Dialogue
**Sol**: "Hola, buenas tardes. Soy Sol. Asistente de Gerencia en EQUITY SOLAR, un placer hablar con usted."
**User**: "[Nombre del cliente]."
**Sol**: •Razón de la llamada: "El motivo de mi llamada es que recibimos sus datos a través de un formulario en uno de nuestros videos sobre programas de energía limpia en redes sociales. ¿Tiene un momento para conversar?" [ESPERAR RESPUESTA]
•	Si dice SÍ: "¡Excelente! Como sabe, Florida es un área ideal para la energía solar y queremos ayudarle a aprovechar los beneficios actuales."
•	Si duda/No tiene tiempo: "Prometo ser muy breve. Esta información puede ser realmente beneficiosa para su economía. ¿Le puedo robar solo un minuto?" [ESPERAR RESPUESTA]

2. Presentación de la Oportunidad (El Gancho)
Objetivo: Generar interés inmediato con el programa de renta solar.
•	Pitch: "Estamos ofreciendo soluciones energéticas personalizadas aprovechando los programas federales de renta. Básicamente, el objetivo es que usted elimine su factura de electricidad actual y la reemplace por una renta del sistema solar que es mucho más económica." ademas nuestra compañia lo puede ayudar en todas las mejoras del hogar que necesite. 
•	Pregunta de transición: "¿Me permite mencionarle rápidamente los beneficios clave de este programa?" [ESPERAR RESPUESTA]

3. Beneficios Clave (Si el cliente acepta escuchar)
Menciona los puntos más fuertes de forma conversacional:
•	"Lo principal es que elimina su factura eléctrica actual."
•	"La renta del sistema es más barata que lo que paga ahora de luz"
•	"No paga nada en el proceso de instalación (0 costo inicial)."
•	"Es una renta fija por 25 años (no sube como la luz)."
•	"El sistema incluye seguro y garantia a su techo, y sistemas solar por 25 años con una cobertura de hasta $500 mil dólares por daños a la propiedad."
•	"El programa de renta no pone gravamen o restricciones sobre su casa."
•	"Se comienza a pagar la renta entre treinta a sesenta días después que el sistema esté funcionando, por tanto, no tiene que pagar nada en el transcurso del proceso de instalación." 
•	"Incluso recibe un cheque anual por la electricidad extra que venda a la compañía eléctrica."
•	Cierre del bloque: "Suena interesante, ¿verdad? [ESPERAR RESPUESTA] Para ver si usted califica para estos incentivos federales, necesito hacerle unas preguntas muy rápidas."

4. Calificación (Criterios Obligatorios)
Haz estas preguntas una por una y espera la respuesta.
1.	Propiedad: "¿Es usted el dueño de la casa donde vive actualmente?" [ESPERAR RESPUESTA]
2.	Gasto: "¿Podría decirme un promedio de cuánto paga mensualmente de electricidad?" [ESPERAR RESPUESTA]
3.	Interés: "¿Le interesa la opción de rentar el sistema solar en lugar de comprarlo, para obtener estos beneficios?" [ESPERAR RESPUESTA]
4.	Tiempo: "¿Le gustaría hacer este cambio a energía solar pronto?" [ESPERAR RESPUESTA]

5. Cierre y Agendamiento (Llamada de Descubrimiento)
Objetivo: Concretar la cita con el consultor.
•	Transición: "Basado en lo que me cuenta, parece que la energía solar es una excelente opción para su hogar. Me gustaría programar una consulta rápida de 30 minutos con uno de nuestros expertos para que le presenten un plan personalizado con números exactos."
•	Agendar: "¿Qué día y hora le funcionan mejor? Tenemos disponibilidad el [Opción 1] o [Opción 2]. ¿Alguna de estas le sirve o tiene algún día en mente?" podemos ajustarnos a su tiempo. Incluso si prefiere podemos transferirlo a un ingeniero para que le explique más detalle. Me deja saber. [ESPERAR RESPUESTA]
•	Confirmación: "¡Perfecto! Queda agendado para el [Día] a las [Hora]. Le enviaremos un correo de confirmación. Por favor, esté atento."

6. Despedida
"Muchas gracias por su tiempo, [Nombre]. Estamos emocionados de ayudarle a ahorrar. Si tiene alguna duda antes de la cita, estamos a su orden. ¡Que tenga un excelente día!"
________________________________________
Manejo de Objeciones (Base de Conocimientos)
•	"No me interesa": "Lo entiendo completamente. Solo para mejorar nuestro servicio, ¿podría decirme qué es lo que más le preocupa de la energía solar? (Costo, estética, complejidad...)"
•	"No tengo tiempo ahora": "Sin problema. ¿Le parece bien si le llamo mañana a esta misma hora o prefiere otro momento?"
•	"Ya tengo paneles / No soy dueño": "Entiendo, en ese caso este programa específico no aplicaría. Le agradezco mucho su tiempo y que tenga buen día." (Terminar llamada amablemente).
•	"¿Cuánto cuesta?": "Justamente para eso es la consulta. El costo depende de su consumo actual, pero recuerde que el objetivo es que pague menos de lo que paga hoy de luz y sin inversión inicial, eliminando completamente su factura actual con la compañía eléctrica."

Información de la Empresa (Referencia)
•	Empresa: EQUITY SOLAR
•	Ubicación: Miami, FL (Equity solar) y Orlando. Trabajamos en toda Florida.
•	Servicios: Paneles solares (residencial/comercial), baterías, techos, eficiencia energética, cargadores EV, aire acondicionad, tratamiento de agua, remodelación de interiores y driveway, además puertas y ventanas contra imparto.
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
    const maxAttempts = 30; // ~7.5 minutos de espera máxima (30 intentos * 15 seg)
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
                    console.log(`[Rastreador HeyGen] ¡Video ${videoId} Terminado! URL: ${videoUrl}`);
                    
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
                            avatar_id: "ab63167094c24a088f4bbde4b6b48fd5",
                            presenter: "Sol"
                        })
                    });
                    console.log(`[Make.com] ¡Webhook enviado con éxito! Make.com publicará el video en breve.`);
                    return; // Fin del rastreo
                } else if (status === 'failed' || status === 'error') {
                    console.error(`[Rastreador HeyGen] El renderizado falló para el video ${videoId}. Revisa tus créditos en HeyGen.`);
                    return; // Fin del rastreo
                }
                // Si el status es 'processing', 'pending' o 'waiting', el loop continuará en el siguiente ciclo.
            }
        } catch (error) {
            console.error(`[Rastreador HeyGen] Error al comunicarse con la API:`, error.message);
        }

        // Esperar 15 segundos antes de volver a preguntar
        await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
    
    console.error(`[Rastreador HeyGen] Timeout. El video ${videoId} tardó demasiado tiempo en renderizarse.`);
}

// 4. Marketing Video Generator (OpenAI + HeyGen)
app.post('/api/generate-marketing-video', async (req, res) => {
    if (HEYGEN_API_KEY === 'TU_HEYGEN_API_KEY_AQUI') {
        return res.status(500).json({ error: 'Falta configurar la HeyGen API Key en server.js' });
    }

    try {
        // Paso 1: Generar el guion con OpenAI
        const promptCompletions = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Eres el Director de Marketing de Equity Solar en Florida. Escribe un guion para un video corto de TikTok/Reels de máximo 30 segundos (unas 60-70 palabras). El tono debe ser entusiasta, directo y vender el programa de renta solar donde se elimina la factura de luz a 0 costo inicial. Menciona el número 305-813-6159 al final. Devuelve SOLO el texto que el presentador dirá, sin acotaciones escénicas ni hashtags." },
                { role: "user", content: "Genera un nuevo guion educativo persuasivo para atraer nuevos dueños de casa a nuestro programa." }
            ]
        });
        
        const videoScript = promptCompletions.choices[0].message.content.trim();
        console.log("Guion Generado por OpenAI:\n", videoScript);

        // Paso 2: Enviar el guion a HeyGen para renderizar el video
        const heygenPayload = {
            video_inputs: [
                {
                    character: {
                        type: "avatar",
                        avatar_id: "ab63167094c24a088f4bbde4b6b48fd5" // Avatar de "Sol"
                    },
                    voice: {
                        type: "text",
                        input_text: videoScript,
                        voice_id: "689f48196a9a43c4bbbb67c14fdbb4c6" // Voz femenina en español
                    }
                }
            ],
            test: false
            // Eliminado: aspect_ratio y avatar_style para evitar congelamiento de la imagen
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

        // Iniciar el rastreador asíncrono en segundo plano (esto NO bloquea la respuesta al frontend)
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

// Start Server
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 SolarNext Backend API Started`);
    console.log(`=================================`);
    console.log(`Server running on: http://localhost:${PORT}`);
    console.log(`Frontend accessible at: http://localhost:${PORT}/index.html`);
});
