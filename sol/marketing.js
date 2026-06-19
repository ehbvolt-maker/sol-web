const express = require('express');

function setupMarketingRoutes(app, openai) {
    const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || "sk_V2_hgu_kEN3KwiGUt6_CUd4OB4lGSLgUa36QlS1nZ6wnn5kNDSV"; // Llave provista por el usuario
    const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/p73ls3ukkbtd6szgpznx7hu96ax1k624';

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
            res.status(500).json({ error: 'Error OpenAI: ' + (error.message || 'Desconocido') });
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
            const spanishVoices = data.data.voices.filter(v => 
                (v.language === 'Spanish' || v.language === 'es') && 
                (v.gender && v.gender.toLowerCase() === 'female')
            );
            res.json({ voices: spanishVoices });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error obteniendo voces de HeyGen' });
        }
    });

    // 4. Enviar guion a HeyGen para generar video
    app.post('/api/marketing/generate-video', async (req, res) => {
        const { script, avatar_id } = req.body;
        
        if (!script) {
            return res.status(400).json({ error: 'El guion es obligatorio' });
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
                                avatar_id: avatar_id || "Tahlia_public_2", // Avatar elegido por el usuario o por defecto
                                avatar_style: "normal"
                            },
                            voice: {
                                type: "text",
                                input_text: script,
                                voice_id: "8217ce4716a34615a75beec0685dbba8" // Voz elegida por el usuario
                            },
                            background: {
                                type: "image",
                                url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1080&h=1920&fit=crop"
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

    // 6. Publicar en Redes Sociales (Make.com y Telegram Nativo)
    app.post('/api/marketing/publish-social', async (req, res) => {
        const { video_url, script, video_id, avatar_id } = req.body;
        if (!video_url || !script) {
            return res.status(400).json({ error: 'Falta la URL del video o el guion.' });
        }
        try {
            // 1. Enviar a Make.com (Para Instagram)
            try {
                await globalThis.fetch(MAKE_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event: 'video_ready',
                        video_id: video_id || 'manual_approval',
                        video_url: video_url,
                        script: script,
                        avatar_id: avatar_id || "Tahlia_public_2",
                        presenter: "Sol"
                    })
                });
            } catch (makeError) {
                console.error("Error enviando a Make.com:", makeError);
            }

            // 2. Enviar a Telegram directamente (Notificación al Teléfono)
            const TELEGRAM_TOKEN = "8725183514:AAGtRclNzeEkpcPtg-d8L9Kxt09VIwdtsJI";
            const TELEGRAM_CHAT_ID = "8534391310";
            
            const telegramMessage = `🎬 *¡Nuevo Video de Sol Listo!*\n\n*Guion para TikTok:*\n${script}\n\n*Enlace de Descarga (MP4):*\n${video_url}`;
            
            try {
                await globalThis.fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: TELEGRAM_CHAT_ID,
                        text: telegramMessage,
                        parse_mode: "Markdown"
                    })
                });
            } catch (telegramError) {
                console.error("Error enviando a Telegram:", telegramError);
            }

            res.json({ success: true, message: 'Video enviado a Instagram y Telegram exitosamente.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error general en el proceso de publicación.' });
        }
    });
}

module.exports = setupMarketingRoutes;
