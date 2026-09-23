const fs = require('fs');
const path = 'c:/Users/elyeh/.gemini/antigravity/playground/entropic-equinox/legal_portal';

const privacyHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Política de Privacidad | Departamento de Consultoría Solar Florida</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2d3748; background-color: #f7fafc; margin: 0; padding: 40px 20px; }
        .container { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        h1 { color: #1a202c; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
        h2 { color: #2b6cb0; margin-top: 28px; }
        p, li { color: #4a5568; }
        .badge { display: inline-block; background: #ebf8ff; color: #2b6cb0; padding: 4px 12px; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-bottom: 16px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 0.875rem; color: #718096; }
    </style>
</head>
<body>
    <div class="container">
        <span class="badge">Aviso Legal Oficial de Meta Ads</span>
        <h1>Política de Privacidad</h1>
        <p><strong>Última actualización:</strong> 7 de Septiembre de 2026</p>
        <p>El <strong>Departamento de Consultoría de Energía Solar Neta (Net Metering) Florida</strong> ("la Empresa") valora y respeta la privacidad de cada usuario. Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos la información personal obtenida a través de nuestras aplicaciones, formularios de Meta Ads (Facebook e Instagram) y servicios telefónicos.</p>
        <h2>1. Información que Recopilamos</h2>
        <p>Recopilamos únicamente los datos necesarios para brindar asesoría sobre energía solar y evaluar la calificación al programa de Medición Neta en el estado de Florida:</p>
        <ul>
            <li><strong>Datos de contacto:</strong> Nombre completo, número de teléfono y correo electrónico.</li>
            <li><strong>Datos de la propiedad:</strong> Dirección de la vivienda, condición de propietario o inquilino, y estimación del gasto eléctrico mensual.</li>
            <li><strong>Interacciones:</strong> Solicitudes realizadas a través de formularios instantáneos de Facebook Ads e Instagram Ads.</li>
        </ul>
        <h2>2. Uso de la Información</h2>
        <p>La información recopilada se utiliza exclusivamente para:</p>
        <ul>
            <li>Contactar al solicitante por llamada o mensaje para coordinar su asesoría informativa de 10 minutos.</li>
            <li>Elaborar un estudio de viabilidad técnica sobre el consumo eléctrico y la capacidad del techo de su propiedad.</li>
            <li>Responder inquietudes sobre el programa de Medición Neta y el ahorro estimado con FPL, Duke Energy o su compañía eléctrica.</li>
        </ul>
        <h2>3. Protección de Datos y No Divulgación</h2>
        <p>Garantizamos que <strong>no vendemos, alquilamos ni comercializamos sus datos personales con terceros</strong> para fines comerciales independientes.</p>
        <h2>4. Derechos y Eliminación de Datos del Usuario</h2>
        <p>Cualquier usuario puede solicitar el acceso, modificación o eliminación inmediata de sus datos enviando un correo a <strong>puronics.water.2026@gmail.com</strong> o visitando nuestra página de <a href="data-deletion.html">Instrucciones de Eliminación de Datos</a>.</p>
        <h2>5. Contacto</h2>
        <p><strong>Departamento de Consultoría de Energía Solar Florida</strong><br>
        Florida, Estados Unidos<br>
        Teléfono: +1 (305) 813-6159 / +1 (813) 535-3539<br>
        Correo electrónico: puronics.water.2026@gmail.com</p>
        <div class="footer">&copy; 2026 Departamento de Consultoría de Energía Solar Florida. Todos los derechos reservados.</div>
    </div>
</body>
</html>`;

const dataDeletionHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instrucciones de Eliminación de Datos | Meta Platform Compliance</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2d3748; background-color: #f7fafc; margin: 0; padding: 40px 20px; }
        .container { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        h1 { color: #1a202c; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
        h2 { color: #2b6cb0; margin-top: 28px; }
        .step { background: #edf2f7; padding: 15px; border-radius: 8px; margin: 12px 0; }
        .badge { display: inline-block; background: #feebc8; color: #c05621; padding: 4px 12px; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-bottom: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <span class="badge">Meta Platform User Data Deletion Instructions</span>
        <h1>Instrucciones para la Eliminación de Datos del Usuario</h1>
        <p>De conformidad con las normas de la plataforma Meta (Facebook e Instagram), los usuarios tienen derecho a solicitar en cualquier momento la eliminación completa de los datos recopilados a través de nuestras aplicaciones o formularios publicitarios.</p>
        <h2>¿Cómo solicitar la eliminación de sus datos?</h2>
        <p>Si usted completó un formulario o interactuó con nuestros anuncios y desea que sus datos sean eliminados permanentemente de nuestro sistema, siga estos sencillos pasos:</p>
        <div class="step">
            <strong>Paso 1:</strong> Envíe un correo electrónico a <strong>puronics.water.2026@gmail.com</strong> con el asunto: <em>"Solicitud de Eliminación de Datos Meta"</em>.
        </div>
        <div class="step">
            <strong>Paso 2:</strong> En el cuerpo del mensaje, incluya su nombre y el número de teléfono con el cual se registró en el formulario.
        </div>
        <div class="step">
            <strong>Paso 3:</strong> Nuestro equipo procesará su solicitud y eliminará todos sus registros de nuestra base de datos en un plazo máximo de 24 horas hábiles, enviándole una confirmación por correo electrónico.
        </div>
        <h2>Eliminación de permisos desde Facebook</h2>
        <p>También puede revocar los permisos concedidos a nuestra aplicación directamente desde su cuenta de Facebook:</p>
        <ol>
            <li>Vaya a la configuración de su cuenta de Facebook > <strong>Configuración y privacidad</strong> > <strong>Configuración</strong>.</li>
            <li>En el menú lateral, seleccione <strong>Apps y sitios web</strong>.</li>
            <li>Busque nuestra aplicación en la lista y haga clic en <strong>Eliminar</strong>.</li>
        </ol>
        <p><a href="privacy.html">&larr; Volver a la Política de Privacidad</a></p>
    </div>
</body>
</html>`;

const termsHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Condiciones del Servicio | Departamento de Consultoría Solar Florida</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2d3748; background-color: #f7fafc; margin: 0; padding: 40px 20px; }
        .container { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        h1 { color: #1a202c; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
        h2 { color: #2b6cb0; margin-top: 28px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Condiciones del Servicio</h1>
        <p><strong>Última actualización:</strong> 7 de Septiembre de 2026</p>
        <p>Al acceder a nuestros servicios informativos y formularios publicitarios, usted acepta los presentes Términos y Condiciones. Nuestras evaluaciones del programa de Medición Neta están sujetas a la verificación técnica de la propiedad y a las normativas de las empresas de servicios eléctricos en Florida.</p>
        <h2>1. Naturaleza de la Consulta</h2>
        <p>La consulta informativa ofrecida es 100% gratuita y sin compromiso de compra. Su objetivo es evaluar el ahorro potencial según el consumo de la vivienda.</p>
        <h2>2. Contacto Autorizado</h2>
        <p>Al remitir su información de contacto, usted autoriza expresamente a nuestro equipo de consultores y a nuestro asistente virtual a comunicarse con usted para coordinar la cita informativa solicitada.</p>
        <p><a href="privacy.html">&larr; Volver a la Política de Privacidad</a></p>
    </div>
</body>
</html>`;

const indexHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Departamento de Consultoría Solar Florida | Portal de Cumplimiento Legal</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2d3748; background-color: #f7fafc; margin: 0; padding: 40px 20px; text-align: center; }
        .container { max-width: 650px; margin: 60px auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        h1 { color: #1a202c; margin-bottom: 8px; }
        p { color: #4a5568; margin-bottom: 30px; }
        .link-btn { display: block; background: #2b6cb0; color: white; text-decoration: none; padding: 14px 20px; border-radius: 8px; font-weight: bold; margin: 12px 0; transition: background 0.2s; }
        .link-btn:hover { background: #2c5282; }
        .link-secondary { background: #edf2f7; color: #2d3748; }
        .link-secondary:hover { background: #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Departamento de Consultoría Solar Florida</h1>
        <p>Portal Oficial de Cumplimiento Normativo y Privacidad de Datos para Meta Ads</p>
        <a href="privacy.html" class="link-btn">📜 Política de Privacidad</a>
        <a href="terms.html" class="link-btn link-secondary">📑 Condiciones del Servicio</a>
        <a href="data-deletion.html" class="link-btn link-secondary">🗑️ Instrucciones de Eliminación de Datos</a>
    </div>
</body>
</html>`;

fs.writeFileSync(path + '/privacy.html', privacyHtml, 'utf8');
fs.writeFileSync(path + '/data-deletion.html', dataDeletionHtml, 'utf8');
fs.writeFileSync(path + '/terms.html', termsHtml, 'utf8');
fs.writeFileSync(path + '/index.html', indexHtml, 'utf8');
console.log('ALL_FILES_CREATED_SUCCESSFULLY');
