require('dotenv').config();
const { MARCELA_VAPI_CONFIG, MARCELA_SYSTEM_PROMPT } = require('./marcela_prompt');

async function updateVapiAssistant(customApiKey) {
    const apiKey = customApiKey || process.env.VAPI_API_KEY;
    const assistantId = process.env.VAPI_ASSISTANT_ID || '795ccfaf-220d-4eea-8c2d-ab24d1b3de8c';

    console.log(`[Vapi Update] Assistant ID: ${assistantId}`);

    if (!apiKey || apiKey.trim() === '') {
        console.error('[Error]: No se encontró VAPI_API_KEY (Private API Key) en el archivo .env.');
        console.log('Para actualizar directamente el asistente en la nube de Vapi vía API, se necesita la Private API Key de https://dashboard.vapi.ai/');
        process.exit(1);
    }

    const payload = {
        name: "Marcela - Departamento de Consultoria",
        firstMessage: MARCELA_VAPI_CONFIG.firstMessage,
        model: MARCELA_VAPI_CONFIG.model,
        voice: MARCELA_VAPI_CONFIG.voice,
        transcriber: MARCELA_VAPI_CONFIG.transcriber,
        responseDelaySeconds: MARCELA_VAPI_CONFIG.responseDelaySeconds,
        llmRequestDelaySeconds: MARCELA_VAPI_CONFIG.llmRequestDelaySeconds,
        backchannelingEnabled: MARCELA_VAPI_CONFIG.backchannelingEnabled,
        backgroundSound: MARCELA_VAPI_CONFIG.backgroundSound,
        startSpeakingPlan: MARCELA_VAPI_CONFIG.startSpeakingPlan,
        stopSpeakingPlan: MARCELA_VAPI_CONFIG.stopSpeakingPlan,
        silenceTimeoutSeconds: MARCELA_VAPI_CONFIG.silenceTimeoutSeconds
    };

    try {
        console.log('[Vapi Update] Enviando actualización ultra-humana a Vapi API...');
        const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${apiKey.trim()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ ¡Asistente Marcela actualizado exitosamente en Vapi con perfil ULTRA-HUMANO!');
            console.log(`ID: ${data.id}`);
            console.log(`Nombre: ${data.name}`);
            console.log(`Modelo: ${data.model?.model} (maxTokens: ${data.model?.maxTokens}, temp: ${data.model?.temperature})`);
            console.log(`Voz: ${data.voice?.voiceId} (Modelo: ${data.voice?.model}, Stability: ${data.voice?.stability})`);
            console.log(`Latencia responseDelaySeconds: ${data.responseDelaySeconds}s`);
            console.log(`Backchanneling: ${data.backchannelingEnabled}`);
            console.log(`Background Sound: ${data.backgroundSound}`);
            return true;
        } else {
            console.error('❌ Error de Vapi API:', data);
            return false;
        }
    } catch (err) {
        console.error('❌ Excepción al conectar con Vapi:', err.message);
        return false;
    }
}

const keyArg = process.argv[2];
updateVapiAssistant(keyArg);
