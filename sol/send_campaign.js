const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
const { unique } = require('./parse_leads');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS
    }
});

function createEmailContent(leadName) {
    const firstName = leadName ? leadName.split(' ')[0] : 'Estimado/a Propietario/a';
    const subject = `☀️ Departamento de Consultoría - Programa Energía Neta (Verificación de Elegibilidad)`;
    
    const plainText = `Estimado/a ${firstName},

Nos comunicamos con usted desde el departamento de consultoría del programa energía neta.

Hemos tratado de comunicarnos con usted debido a su solicitud de recibir información sobre el programa de energía solar. Debemos coordinar una llamada de 10 minutos para verificar la elegibilidad de su vivienda al programa.

En caso usted no tenga interés, déjenos saber para eliminar su solicitud de nuestra base de datos.

Puede comunicarse con nuestro departamento al:
📞 (305) 813-6159
📞 (305) 784-6363

Gracias.
Departamento de Consultoría Solar`;

    const html = `
    <div style="background-color: #0b1120; padding: 35px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; max-width: 620px; margin: auto; border-radius: 14px; border: 1px solid #1e293b; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <div style="text-align: center; margin-bottom: 25px;">
            <span style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
                ☀️ Programa Oficial de Energía Neta Florida
            </span>
            <h2 style="color: #ffffff; margin: 16px 0 6px 0; font-size: 22px; font-weight: 700;">
                Departamento de Consultoría Solar
            </h2>
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">Verificación de Elegibilidad para su Vivienda</p>
        </div>

        <div style="background-color: #1e293b; border-radius: 10px; padding: 25px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
            <p style="font-size: 16px; margin-top: 0; color: #f8fafc; font-weight: 600;">
                Estimado/a ${firstName},
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 15px;">
                Nos comunicamos con usted desde el departamento de consultoría del programa energía neta.
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 15px;">
                Hemos tratado de comunicarnos con usted debido a su solicitud de recibir información sobre el programa de energía solar. Debemos coordinar una llamada de 10 minutos para verificar la elegibilidad de su vivienda al programa.
            </p>
            <p style="font-size: 14px; line-height: 1.5; color: #94a3b8; margin-bottom: 0;">
                <em>En caso de que ya no tenga interés, déjenos saber respondiendo a este mensaje para eliminar su solicitud de nuestra base de datos.</em>
            </p>
        </div>

        <!-- Botones de Acción Directa -->
        <div style="text-align: center; margin-bottom: 30px;">
            <p style="color: #94a3b8; font-size: 13px; margin-bottom: 15px; text-transform: uppercase; font-weight: 600;">Comuníquese directamente con nuestros consultores:</p>
            <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                <a href="tel:+13058136159" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; margin: 4px;">
                    📞 (305) 813-6159
                </a>
                <a href="tel:+13057846363" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; margin: 4px;">
                    📞 (305) 784-6363
                </a>
                <a href="https://wa.me/13058136159?text=${encodeURIComponent('Hola, me comunico respecto al mensaje del departamento de consultoría del programa energía neta.')}" style="background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; margin: 4px;">
                    💬 Contactar por WhatsApp
                </a>
            </div>
        </div>

        <div style="border-top: 1px solid #1e293b; padding-top: 20px; text-align: center; font-size: 12px; color: #64748b;">
            <p style="margin: 0 0 5px 0;">Departamento de Consultoría y Evaluación Solar</p>
            <p style="margin: 0;">Si desea darse de baja de futuras comunicaciones, puede <a href="mailto:ehbequitysolar@gmail.com?subject=Baja%20de%20Solicitud%20Solar" style="color: #94a3b8; text-decoration: underline;">hacer clic aquí</a>.</p>
        </div>
    </div>
    `;

    return { subject, plainText, html };
}

async function sendPreview() {
    console.log('Enviando preview a ely.eh59@gmail.com...');
    const { subject, plainText, html } = createEmailContent('Eliecer Hernandez');
    const mailOptions = {
        from: `"Departamento de Consultoría Solar" <${process.env.GMAIL_USER}>`,
        to: 'ely.eh59@gmail.com',
        subject: `[PREVIEW] ${subject}`,
        text: plainText,
        html: html
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error enviando preview:', err.message);
                reject(err);
            } else {
                console.log('Preview enviado exitosamente:', info.response);
                resolve(info);
            }
        });
    });
}

if (require.main === module) {
    sendPreview();
}

module.exports = { createEmailContent, transporter };
