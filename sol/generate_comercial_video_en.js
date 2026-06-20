const fs = require('fs');
const https = require('https');
const path = require('path');

const HEYGEN_API_KEY = "sk_V2_hgu_kEN3KwiGUt6_CUd4OB4lGSLgUa36QlS1nZ6wnn5kNDSV";
const SCRIPT_TEXT = "Hi! I'm Sol. The new clean energy programs in Florida have amazing results for your pocket. By qualifying: first, you completely eliminate your electric bill. Second, you rent the system up to 50% cheaper than your previous bill, with a fixed rental payment for 25 years. Third, you pay nothing during installation, and you start paying the lease 30 to 60 days after it is up and running. Fourth, there is no lien on your property, and it is not reported to credit bureaus. Fifth, the system increases your home's value and includes a $1 million liability insurance and up to $500,000 in property damage coverage. And sixth, you sell your excess electricity back to the utility company, receiving an annual check! What are you waiting for to qualify today?";

// Configuración de HeyGen
const AVATAR_ID = "Tahlia_public_2"; // Avatar oficial de Sol
const VOICE_ID = "42d00d4aac5441279d8536cd6b52c53c"; // Voz en inglés de Sol (Hope)
const BACKGROUND_URL = "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1080&h=1920&fit=crop"; // Oficina moderna o casa

async function main() {
    console.log("Iniciando generación de video en inglés en HeyGen...");
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

    const outputPath = path.join(assetsDir, 'comercial_solar_en.mp4');
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