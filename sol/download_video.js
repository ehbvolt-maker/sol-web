const fs = require('fs');
const https = require('https');

async function download() {
    const HEYGEN_API_KEY = "sk_V2_hgu_kEN3KwiGUt6_CUd4OB4lGSLgUa36QlS1nZ6wnn5kNDSV";
    console.log("Consultando estado fresco del video...");
    const res = await fetch('https://api.heygen.com/v1/video_status.get?video_id=8baf83ba419c4adca34f747010172b5a', {
        headers: { 'X-Api-Key': HEYGEN_API_KEY }
    });
    const data = await res.json();
    
    if (data.data && data.data.video_url) {
        console.log("Descargando desde URL fresca:", data.data.video_url);
        https.get(data.data.video_url, (response) => {
            const file = fs.createWriteStream('./assets/test_video.mp4');
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log("¡Video descargado exitosamente en assets/test_video.mp4!");
            });
        }).on('error', (err) => {
            console.error("Error descargando:", err.message);
        });
    } else {
        console.log("No se pudo obtener la URL:", data);
    }
}
download();
