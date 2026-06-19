async function generateAndPoll() {
    console.log("Iniciando generación de video...");
    const res = await fetch('http://localhost:3000/api/marketing/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            script: "Hola, soy Sol. La energía solar es gratis en Florida, ¡aprovecha hoy! Únete a nuestra plataforma y elimina tu factura de luz para siempre.",
            avatar_id: "Annie_Casual_Standing_Front_public", // Avatar predeterminado que hemos estado usando
            voice_id: "8217ce4716a34615a75beec0685dbba8", // Voz elegida por el usuario
            background: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1080&h=1920&fit=crop" // Oficina moderna
        })
    });
    
    const data = await res.json();
    console.log("Respuesta:", data);
    
    if (data.video_id) {
        console.log("Video ID recibido:", data.video_id, "- Esperando renderizado (puede tomar varios minutos)...");
        let status = 'processing';
        while (status !== 'completed' && status !== 'failed') {
            await new Promise(r => setTimeout(r, 10000)); // esperar 10 segundos
            const statusRes = await fetch('http://localhost:3000/api/marketing/video-status/' + data.video_id);
            const statusData = await statusRes.json();
            status = statusData.status;
            console.log("Estado actual:", status);
            if (status === 'completed') {
                console.log("¡VIDEO COMPLETADO! URL:", statusData.video_url);
            } else if (status === 'failed') {
                console.log("Error en HeyGen:", statusData.error);
            }
        }
    }
}

generateAndPoll();
