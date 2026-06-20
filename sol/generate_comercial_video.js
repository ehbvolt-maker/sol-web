const fs = require('fs');
const https = require('https');
const path = require('path');

const HEYGEN_API_KEY = "sk_V2_hgu_kEN3KwiGUt6_CUd4OB4lGSLgUa36QlS1nZ6wnn5kNDSV";
const SCRIPT_TEXT = "¡Hola! Soy Sol. Los nuevos programas de energía limpia en Florida tienen resultados increíbles para tu bolsillo. Al calificar: primero, eliminas por completo tu facturación eléctrica. Segundo, rentas el sistema hasta 50% más barato que tu factura anterior, con un pago de renta fijo por 25 años. Tercero, no pagas nada durante la instalación y comienzas a pagar el lease entre 30 a 60 días después de que esté funcionando. Cuarto, no hay gravamen en tu propiedad ni se reporta al buró de crédito. Quinto, el sistema incrementa el valor de tu casa e incluye un seguro de un millón de dólares y cobertura de hasta 500 mil dólares por daños. Y sexto, ¡vendes tu excedente de electricidad a la compañía eléctrica recibiendo un cheque anual! ¿Qué esperas para calificar hoy mismo?";

// Configuración de HeyGen
const AVATAR_ID = "Tahlia_public_2"; // Avatar oficial de Sol
const VOICE_ID = "8217ce4716a34615a75beec0685dbba8"; // Voz en español de Sol
const BACKGROUND_URL = "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1080&h=1920&fit=crop"; // Casa con paneles solares de fondo o oficina

async function main() {
    console.log("Iniciando generación de video en HeyGen...");
    console.log("Guion:", SCRIPT_TEXT);

    try {
        const response = await fetch('https://api.heygen.com/v2/video/generate', {
            method: 'POST',
            headers: {
                'X-Api-Key': HEYGEN_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                video_inputs: [
                    {
                        character: {
                            type: "avatar",
                            avatar_id: AVATAR_ID,
                            avatar_style: "normal"
                        },
                        voice: {
                            type: "text",
                            input_text: SCRIPT_TEXT,
                            voice_id: VOICE_ID
                        },
                        background: {
                            type: "image",
                            url: BACKGROUND_URL
                        }
                    }
                ],
                dimension: {
                    width: 1080,
                    height: 1920
                }
            })
        });

        const data = await response.json();
        if (data.error) {
            console.error("Error en HeyGen API:", data.error.message || data.error);
            process.exit(1);
        }

        const videoId = data.data.video_id;
        console.log(`\n¡Video solicitado con éxito! ID: ${videoId}`);
        console.log("Esperando a que se procese el video. Esto tomará entre 1 y 3 minutos...");

        pollStatus(videoId);

    } catch (err) {
        console.error("Error realizando la petición de generación:", err.message);
    }
}

function pollStatus(videoId) {
    const interval = setInterval(async () => {
        try {
            const res = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
                headers: { 'X-Api-Key': HEYGEN_API_KEY }
            });
            const statusData = await res.json();
            
            if (statusData.error) {
                console.error("\nError consultando estado:", statusData.error.message || statusData.error);
                clearInterval(interval);
                process.exit(1);
            }

            const status = statusData.data.status;
            process.stdout.write(`.` ); // Indicador de progreso

            if (status === 'completed') {
                clearInterval(interval);
                console.log(`\n¡Renderizado completado!`);
                const videoUrl = statusData.data.video_url;
                console.log("Descargando video desde:", videoUrl);
                downloadVideo(videoUrl);
            } else if (status === 'failed') {
                clearInterval(interval);
                console.error(`\nError en renderizado:`, statusData.data.error || 'Fallo desconocido.');
                process.exit(1);
            }
        } catch (error) {
            console.error("\nError durante el polling:", error.message);
        }
    }, 10000); // Poll cada 10 segundos
}

function downloadVideo(videoUrl) {
    const assetsDir = path.join(__dirname, 'assets');
    
    // Asegurar que la carpeta assets existe
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
    }

    const outputPath = path.join(assetsDir, 'comercial_solar.mp4');
    const file = fs.createWriteStream(outputPath);

    https.get(videoUrl, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log(`\n¡Video descargado exitosamente en: ${outputPath}!`);
            process.exit(0);
        });
    }).on('error', (err) => {
        fs.unlinkSync(outputPath); // Limpiar archivo incompleto
        console.error("\nError al descargar el archivo MP4:", err.message);
        process.exit(1);
    });
}

main();