const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const { OpenAI } = require('openai');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize Database
const dbPath = path.join(__dirname, 'leads.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            phone TEXT,
            address TEXT,
            email TEXT,
            zipcode TEXT,
            bill_over_100 TEXT,
            credit_score TEXT,
            roof_type TEXT,
            is_owner TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// OpenAI client setup
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy-key"
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER || '',
        pass: process.env.GMAIL_APP_PASS || ''
    }
});

// Helper for sending admin email
function sendAdminEmail(lead) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
        console.log('[Email Demo] Sin credenciales de Gmail. Lead registrado:', lead);
        return;
    }

    const mailOptions = {
        from: `GHL Setup Agency <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: `¡Nuevo Lead Calificado! CRM $450 - ${lead.name}`,
        html: `
            <div style="background-color: #0b0f19; padding: 30px; font-family: sans-serif; color: #e2e8f0; max-width: 600px; margin: auto; border-radius: 12px; border: 1px solid #1e293b;">
                <h2 style="color: #0084ff; text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 15px; margin-top: 0;">?? Nuevo Lead Calificado</h2>
                <p style="font-size: 1.1rem; text-align: center; color: #94a3b8;">Un cliente ha solicitado la configuración del CRM GHL ($450).</p>
                <div style="background: #111827; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #1f2937;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="color: #94a3b8; padding: 8px 0; font-weight: bold; width: 40%;">Nombre:</td>
                            <td style="color: #ffffff; padding: 8px 0;">${lead.name}</td>
                        </tr>
                        <tr>
                            <td style="color: #94a3b8; padding: 8px 0; font-weight: bold;">Teléfono:</td>
                            <td style="color: #ffffff; padding: 8px 0;">${lead.phone}</td>
                        </tr>
                        <tr>
                            <td style="color: #94a3b8; padding: 8px 0; font-weight: bold;">Email:</td>
                            <td style="color: #ffffff; padding: 8px 0;">${lead.email}</td>
                        </tr>
                        <tr>
                            <td style="color: #94a3b8; padding: 8px 0; font-weight: bold;">Negocio:</td>
                            <td style="color: #ffffff; padding: 8px 0;">${lead.address}</td>
                        </tr>
                        <tr>
                            <td style="color: #94a3b8; padding: 8px 0; font-weight: bold;">Nicho/Industria:</td>
                            <td style="color: #ffffff; padding: 8px 0;">${lead.zipcode}</td>
                        </tr>
                        <tr>
                            <td style="color: #94a3b8; padding: 8px 0; font-weight: bold;">¿Es Dueño?:</td>
                            <td style="color: #ffffff; padding: 8px 0;">${lead.is_owner}</td>
                        </tr>
                        <tr>
                            <td style="color: #94a3b8; padding: 8px 0; font-weight: bold;">¿Paga Software?:</td>
                            <td style="color: #ffffff; padding: 8px 0;">${lead.bill_over_100}</td>
                        </tr>
                        <tr>
                            <td style="color: #94a3b8; padding: 8px 0; font-weight: bold;">¿Tiene Web/Funnel?:</td>
                            <td style="color: #ffffff; padding: 8px 0;">${lead.credit_score}</td>
                        </tr>
                        <tr>
                            <td style="color: #94a3b8; padding: 8px 0; font-weight: bold;">Canal Deseado:</td>
                            <td style="color: #ffffff; padding: 8px 0;">${lead.roof_type}</td>
                        </tr>
                    </table>
                </div>
                <p style="font-size: 0.9rem; text-align: center; color: #64748b; margin-bottom: 0;">GHL CRM Setup System. Contacta al lead de inmediato para cerrar la venta.</p>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error('Error enviando email al admin:', error.message);
        else console.log('Email de lead enviado al admin:', info.response);
    });
}

function sendClientEmail(lead) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS || !lead.email) return;

    const mailOptions = {
        from: `GHL Setup Agency <${process.env.GMAIL_USER}>`,
        to: lead.email,
        subject: `Confirmación de tu Solicitud de CRM - Configuración en 24h`,
        html: `
            <div style="background-color: #0b0f19; padding: 30px; font-family: sans-serif; color: #e2e8f0; max-width: 600px; margin: auto; border-radius: 12px; border: 1px solid #1e293b;">
                <h2 style="color: #0084ff; text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 15px; margin-top: 0;">?? ¡Tu CRM está en Camino!</h2>
                <p style="font-size: 1.1rem; color: #e2e8f0;">Hola <strong>${lead.name}</strong>,</p>
                <p style="color: #94a3b8; line-height: 1.6;">Hemos recibido tu solicitud para configurar tu CRM de GoHighLevel personalizado para <strong>${lead.address}</strong>.</p>
                <p style="color: #94a3b8; line-height: 1.6;">Nuestro equipo de expertos ya está revisando tu perfil y nicho (<strong>${lead.zipcode}</strong>) para preparar el mejor diseño de embudos, automatizaciones y el Agente de IA para responder a tus clientes 24/7.</p>
                <div style="background: #111827; padding: 15px; border-radius: 8px; border: 1px solid #1f2937; margin: 20px 0;">
                    <h3 style="color: #00f2fe; margin-top: 0;">¿Qué sigue?</h3>
                    <ul style="color: #94a3b8; padding-left: 20px; margin-bottom: 0;">
                        <li style="margin-bottom: 8px;">Un asesor técnico se pondrá en contacto contigo por WhatsApp en los próximos minutos.</li>
                        <li style="margin-bottom: 8px;">Revisaremos los accesos de tu cuenta y los detalles de las automatizaciones requeridas.</li>
                        <li style="margin-bottom: 0;">¡En 24 horas tu CRM estará completamente listo y configurado!</li>
                    </ul>
                </div>
                <p style="color: #94a3b8; line-height: 1.6;">Si tienes prisa por comenzar, puedes escribirnos directamente haciendo clic en el siguiente enlace:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://wa.me/13058136159?text=Hola,%20acabo%20de%20completar%20mi%20solicitud%20para%20la%20configuraci%C3%B3n%20de%20mi%20CRM." style="background-color: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 1.1rem; display: inline-block;">?? Hablar por WhatsApp Ahora</a>
                </div>
                <p style="font-size: 0.9rem; text-align: center; color: #64748b; margin-top: 30px; border-top: 1px solid #1e293b; padding-top: 15px;">Gracias por confiar en nosotros.<br>GHL Setup Pro Team.</p>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error('Error enviando email al cliente:', error.message);
        else console.log('Email de confirmación enviado al cliente:', info.response);
    });
}

// REST Routes
app.post('/api/leads', (req, res) => {
    const { name, phone, address, email, zipcode, bill_over_100, credit_score, roof_type, is_owner } = req.body;
    
    if (!name || !phone) {
        return res.status(400).json({ error: 'Nombre y Teléfono son requeridos' });
    }

    const query = `INSERT INTO leads (name, phone, address, email, zipcode, bill_over_100, credit_score, roof_type, is_owner) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(query, [name, phone, address || '', email || '', zipcode || '', bill_over_100 || '', credit_score || '', roof_type || '', is_owner || ''], function(err) {
        if (err) {
            console.error('Error al insertar lead:', err.message);
            return res.status(500).json({ error: 'Error al registrar el lead en la base de datos' });
        }
        
        const lead = { name, phone, address, email, zipcode, bill_over_100, credit_score, roof_type, is_owner };
        sendAdminEmail(lead);
        sendClientEmail(lead);
        
        res.json({ success: true, id: this.lastID });
    });
});

app.get('/api/leads', (req, res) => {
    db.all(`SELECT * FROM leads ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            console.error('Error al consultar leads:', err.message);
            return res.status(500).json({ error: 'Error al consultar leads' });
        }
        res.json(rows);
    });
});

app.post('/api/chat-ai', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Mensaje es requerido' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Eres Eva, una carismática asesora virtual experta en automatización y optimización de negocios utilizando GoHighLevel CRM.
Representas a nuestra agencia GHL Setup Pro. Tu objetivo es explicar la oferta de forma amigable, resolutiva y persuasiva.
Detalles de la Oferta:
- Servicio: Configuración completa de GoHighLevel CRM en 24 horas.
- Costo: $450 USD (Pago único / Sin pagos mensuales hacia nosotros por configuración).
- ¿Qué incluye?:
  1. Cuenta GoHighLevel (le ayudamos a abrir su cuenta oficial, asesorándolo sobre los planes de GHL).
  2. Un Agente AI de chat que atiende, responde y convierte leads 24/7 (como tú).
  3. Embudos (Funnels) de venta diseñados a medida para su nicho para atraer y convertir prospectos.
  4. Sitio web o Landing Page profesional lista para vender.
  5. Automatizaciones avanzadas (Workflows, envío de SMS/Email automáticos, recordatorios de citas, sincronización de calendarios).
- Tiempo de Entrega: Completamente listo y funcionando en menos de 24 horas.

Reglas de conversación:
- Sé breve y directa. Responde en un máximo de 2 párrafos cortos.
- Mantén un tono amigable, entusiasta y altamente profesional en español.
- Invita al usuario a calificar completando el quiz haciendo clic en el botón de la web, o pregúntale de forma sutil su Nombre, Correo, Teléfono, Nombre de Negocio y Nicho para registrarlo tú misma si se muestra interesado.
- Si te pregunta por qué es un solo pago, aclárale que cobramos un único cargo de $450 por el diseño de los embudos, programación de automatizaciones y entrenamiento del bot de IA. Las suscripciones normales de la plataforma GoHighLevel van por su cuenta y son necesarias para mantener el CRM activo, pero el trabajo de ingeniería y programación ya queda hecho para siempre.`
                },
                { role: "user", content: message }
            ]
        });
        res.json({ response: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error de OpenAI:', error.message);
        res.status(500).json({ error: 'Error al procesar la respuesta de la IA' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
