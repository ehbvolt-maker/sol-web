const express = require('express');

function setupMarketingRoutes(app, openai) {
    const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || "sk_V2_hgu_kEN3KwiGUt6_CUd4OB4lGSLgUa36QlS1nZ6wnn5kNDSV"; // Llave provista por el usuario

    // 1. Generar un guion viral usando OpenAI
    app.post('/api/marketing/generate-script', async (req, res) => {
        const { topic } = req.body;
        
        if (!openai || openai.apiKey === 'TU_OPENAI_API_KEY_AQUI') {
            return res.status(500).json({ error: 'Falta configurar la OpenAI API Key' });
        }

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { 
                        role: "system", 
                        content: `Eres Sol, una influencer experta en energía solar. Escribe un guion para un video vertical (TikTok/Reels) de máximo 30 segundos sobre el tema solicitado. 
Reglas:
1. Inicia con un gancho (hook) poderoso que llame la atención.
2. Explica brevemente un beneficio o rompe un mito.
3. Termina con un llamado a la acción (ej: comenta AHORRO para enviarte información).
4. Escribe SOLO el texto que vas a hablar, sin acotaciones ni acciones, como un párrafo continuo.` 
                    },
                    { role: "user", content: `Tema: ${topic || 'Los beneficios financieros de la energía solar en Florida'}` }
                ]
            });

            res.json({ script: completion.choices[0].message.content });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error generando guion' });
        }
    });

    // 2. Obtener lista de Avatares disponibles en HeyGen
    app.get('/api/marketing/avatars', async (req, res) => {
        try {
            const response = await globalThis.fetch('https://api.heygen.com/v2/avatars', {
                method: 'GET',
                headers: { 'X-Api-Key': HEYGEN_API_KEY }
            });
            const data = await response.json();
            if (data.error) {
                return res.status(500).json({ error: data.error.message });
            }
            res.json({ avatars: data.data.avatars });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error obteniendo avatares de HeyGen' });
        }
    });

    // 3. Obtener lista de Voces disponibles
    app.get('/api/marketing/voices', async (req, res) => {
        try {
            const response = await globalThis.fetch('https://api.heygen.com/v2/voices', {
                method: 'GET',
                headers: { 'X-Api-Key': HEYGEN_API_KEY }
            });
            const data = await response.json();
            // Filtrar voces en español (femeninas) para facilitar la elección
            const spanishVoices = data.data.voices.filter(v => v.language === 'Spanish' && v.gender === 'Female');
            res.json({ voices: spanishVoices });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error obteniendo voces de HeyGen' });
        }
    });

    // 4. Enviar guion a HeyGen para generar video
    app.post('/api/marketing/generate-video', async (req, res) => {
        const { script, avatar_id, voice_id } = req.body;
        
        if (!script || !avatar_id) {
            return res.status(400).json({ error: 'Guion y Avatar ID son obligatorios' });
        }

        try {
            const response = await globalThis.fetch('https://api.heygen.com/v2/video/generate', {
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
                                avatar_id: avatar_id,
                                avatar_style: "normal"
                            },
                            voice: {
                                type: "text",
                                input_text: script,
                                voice_id: voice_id || "es-ES-ElviraNeural" // Voz por defecto
                            }
                        }
                    ],
                    dimension: {
                        width: 1080,
                        height: 1920 // Formato vertical para TikTok/Reels
                    }
                })
            });

            const data = await response.json();
            if (data.error) {
                return res.status(500).json({ error: data.error.message });
            }
            res.json({ video_id: data.data.video_id });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error enviando solicitud de video a HeyGen' });
        }
    });

    // 5. Comprobar estado del video generado
    app.get('/api/marketing/video-status/:video_id', async (req, res) => {
        try {
            const response = await globalThis.fetch(`https://api.heygen.com/v1/video_status.get?video_id=${req.params.video_id}`, {
                method: 'GET',
                headers: { 'X-Api-Key': HEYGEN_API_KEY }
            });
            const data = await response.json();
            res.json(data.data); // Contiene el estado y url del video si está listo
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error obteniendo estado del video' });
        }
    });
}

module.exports = setupMarketingRoutes;
