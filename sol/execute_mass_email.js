const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
const { unique } = require('./parse_leads');
const { createEmailContent } = require('./send_campaign');

const db = new sqlite3.Database('./leads.db');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    pool: true,
    maxConnections: 2,
    maxMessages: 200,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS
    }
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runCampaign() {
    console.log(`=======================================================`);
    console.log(`🚀 INICIANDO CAMPAÑA DE BIENVENIDA A ${unique.length} LEADS`);
    console.log(`=======================================================\n`);

    const stats = {
        total: unique.length,
        sent: 0,
        failed: 0,
        errors: []
    };

    for (let i = 0; i < unique.length; i++) {
        const lead = unique[i];
        const { subject, plainText, html } = createEmailContent(lead.name);

        console.log(`[${i + 1}/${unique.length}] Procesando lead: ${lead.name} <${lead.email}>...`);

        const mailOptions = {
            from: `"Departamento de Consultoría Solar" <${process.env.GMAIL_USER}>`,
            to: lead.email,
            subject: subject,
            text: plainText,
            html: html
        };

        try {
            await new Promise((resolve, reject) => {
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) return reject(err);
                    resolve(info);
                });
            });

            console.log(`   ✅ Correo enviado a ${lead.email}`);
            stats.sent++;

            // Actualizar o registrar en leads.db
            db.run(
                `INSERT INTO leads (name, phone, email, email_status, sms_status, last_followup_at, source, message)
                 VALUES (?, ?, ?, 'sent', 'failed (twilio inactive)', CURRENT_TIMESTAMP, 'Lista Bienvenida Manual', ?)
                 ON CONFLICT(email) DO UPDATE SET
                    name = excluded.name,
                    phone = excluded.phone,
                    email_status = 'sent',
                    sms_status = 'failed (twilio inactive)',
                    last_followup_at = CURRENT_TIMESTAMP,
                    message = excluded.message`,
                [lead.name, lead.phone, lead.email, plainText],
                (err) => {
                    if (err) console.error(`   ⚠️ Error actualizando BD para ${lead.email}:`, err.message);
                }
            );

        } catch (err) {
            console.error(`   ❌ Error enviando a ${lead.email}:`, err.message);
            stats.failed++;
            stats.errors.push({ email: lead.email, error: err.message });

            db.run(
                `INSERT INTO leads (name, phone, email, email_status, sms_status, last_followup_at, source, message)
                 VALUES (?, ?, ?, 'failed', 'failed (twilio inactive)', CURRENT_TIMESTAMP, 'Lista Bienvenida Manual', ?)
                 ON CONFLICT(email) DO UPDATE SET
                    name = excluded.name,
                    phone = excluded.phone,
                    email_status = 'failed',
                    sms_status = 'failed (twilio inactive)',
                    last_followup_at = CURRENT_TIMESTAMP`,
                [lead.name, lead.phone, lead.email, err.message],
                () => {}
            );
        }

        // Pausa preventiva de 1.2 segundos para cuidar la reputación de Gmail
        if (i < unique.length - 1) {
            await sleep(1200);
        }
    }

    console.log(`\n=======================================================`);
    console.log(`🏁 CAMPAÑA FINALIZADA`);
    console.log(`Total: ${stats.total}`);
    console.log(`Enviados con éxito: ${stats.sent}`);
    console.log(`Fallidos: ${stats.failed}`);
    console.log(`=======================================================`);

    db.close();
    return stats;
}

if (require.main === module) {
    runCampaign();
}

module.exports = { runCampaign };
