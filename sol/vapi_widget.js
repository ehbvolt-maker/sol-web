/**
 * Sol Energy / Equity Puronics - Vapi AI Voice Call Floating Widget
 * Integración interactiva para llamadas de voz por navegador con Sol (IA).
 */
(function () {
    const DEFAULT_PUBLIC_KEY = "421c2647-83b3-4e5f-bc7c-72414918483a";
    const DEFAULT_ASSISTANT_ID = "795ccfaf-220d-4eea-8c2d-ab24d1b3de8c";

    let vapiInstance = null;
    let isCallActive = false;
    let isMuted = false;
    let callTimerInterval = null;
    let callSeconds = 0;
    let vapiConfig = {
        publicKey: DEFAULT_PUBLIC_KEY,
        assistantId: DEFAULT_ASSISTANT_ID
    };

    // Inject CSS for the floating widget
    const style = document.createElement('style');
    style.innerHTML = `
        .vapi-floating-container {
            position: fixed;
            bottom: 25px;
            right: 25px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            font-family: 'Outfit', sans-serif;
        }

        .vapi-call-card {
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid rgba(255, 183, 3, 0.4);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 183, 3, 0.2);
            border-radius: 20px;
            padding: 16px 20px;
            margin-bottom: 12px;
            display: none;
            flex-direction: column;
            width: 280px;
            backdrop-filter: blur(12px);
            color: #fff;
            animation: vapiSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes vapiSlideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .vapi-card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
        }

        .vapi-avatar-box {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .vapi-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #ffb703, #ff0055);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            box-shadow: 0 0 10px rgba(255, 183, 3, 0.5);
            position: relative;
        }

        .vapi-avatar.speaking::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 2px solid #ffb703;
            animation: vapiPulse 1.2s infinite;
        }

        @keyframes vapiPulse {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
        }

        .vapi-title {
            font-weight: 700;
            font-size: 1rem;
            color: #ffb703;
        }

        .vapi-status-text {
            font-size: 0.8rem;
            color: #94a3b8;
        }

        .vapi-waves {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            height: 24px;
            margin: 8px 0;
        }

        .vapi-wave-bar {
            width: 4px;
            height: 8px;
            background: #ffb703;
            border-radius: 2px;
            transition: height 0.15s ease;
        }

        .vapi-waves.active .vapi-wave-bar:nth-child(1) { animation: waveAnim 0.8s infinite 0.1s; }
        .vapi-waves.active .vapi-wave-bar:nth-child(2) { animation: waveAnim 0.8s infinite 0.3s; }
        .vapi-waves.active .vapi-wave-bar:nth-child(3) { animation: waveAnim 0.8s infinite 0.2s; }
        .vapi-waves.active .vapi-wave-bar:nth-child(4) { animation: waveAnim 0.8s infinite 0.4s; }
        .vapi-waves.active .vapi-wave-bar:nth-child(5) { animation: waveAnim 0.8s infinite 0.15s; }

        @keyframes waveAnim {
            0%, 100% { height: 6px; }
            50% { height: 22px; background: #ff0055; }
        }

        .vapi-card-actions {
            display: flex;
            gap: 8px;
            margin-top: 10px;
        }

        .vapi-btn-action {
            flex: 1;
            padding: 8px;
            border-radius: 10px;
            border: none;
            font-weight: 700;
            font-size: 0.85rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.2s;
        }

        .vapi-btn-end {
            background: #ef476f;
            color: #fff;
        }

        .vapi-btn-end:hover {
            background: #d90429;
        }

        .vapi-btn-mute {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .vapi-btn-mute.muted {
            background: #ffb703;
            color: #000;
        }

        .vapi-float-trigger {
            background: linear-gradient(135deg, #ff0055, #ffb703);
            color: white;
            border: none;
            border-radius: 30px;
            padding: 12px 22px;
            font-size: 0.95rem;
            font-weight: 700;
            box-shadow: 0 8px 25px rgba(255, 0, 85, 0.4);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .vapi-float-trigger:hover {
            transform: scale(1.06);
            box-shadow: 0 12px 30px rgba(255, 0, 85, 0.6);
        }

        .vapi-float-trigger .vapi-icon {
            font-size: 1.2rem;
            animation: vapiPhoneShake 2s infinite;
        }

        @keyframes vapiPhoneShake {
            0%, 90%, 100% { transform: rotate(0deg); }
            92% { transform: rotate(15deg); }
            94% { transform: rotate(-15deg); }
            96% { transform: rotate(10deg); }
            98% { transform: rotate(-10deg); }
        }
    `;
    document.head.appendChild(style);

    // Create Widget DOM Structure
    const container = document.createElement('div');
    container.className = 'vapi-floating-container';
    container.innerHTML = `
        <div class="vapi-call-card" id="vapiCallCard">
            <div class="vapi-card-header">
                <div class="vapi-avatar-box">
                    <div class="vapi-avatar" id="vapiAvatar">☀️</div>
                    <div>
                        <div class="vapi-title">Marcela (Consultoría IA)</div>
                        <div class="vapi-status-text" id="vapiStatusText">Conectando...</div>
                    </div>
                </div>
                <div style="font-family: monospace; font-size: 0.85rem; color: #ffb703; font-weight: bold;" id="vapiTimer">00:00</div>
            </div>

            <div class="vapi-waves" id="vapiWaves">
                <div class="vapi-wave-bar"></div>
                <div class="vapi-wave-bar"></div>
                <div class="vapi-wave-bar"></div>
                <div class="vapi-wave-bar"></div>
                <div class="vapi-wave-bar"></div>
            </div>

            <div class="vapi-card-actions">
                <button class="vapi-btn-action vapi-btn-mute" id="vapiMuteBtn">🎤 Silenciar</button>
                <button class="vapi-btn-action vapi-btn-end" id="vapiEndBtn">🛑 Colgar</button>
            </div>
        </div>

        <button class="vapi-float-trigger" id="vapiMainTrigger">
            <span class="vapi-icon">📞</span>
            <span id="vapiTriggerText">Hablar por Voz con Marcela</span>
        </button>
    `;
    document.body.appendChild(container);

    // Fetch dynamic backend configuration
    async function loadVapiConfig() {
        try {
            const apiBase = window.location.protocol.startsWith('http') ? '' : 'http://localhost:3000';
            const res = await fetch(apiBase + '/api/vapi/config');
            if (res.ok) {
                const data = await res.json();
                if (data.publicKey) vapiConfig.publicKey = data.publicKey;
                if (data.assistantId) vapiConfig.assistantId = data.assistantId;
                if (data.assistantOverrides) vapiConfig.assistantOverrides = data.assistantOverrides;
            }
        } catch (e) {
            console.log('[Vapi Widget] Usando configuración de Vapi local por defecto.');
        }
    }

    // Load Vapi Web SDK dynamically via ESM / Script tag
    async function initVapiSDK() {
        if (window.vapiSDKInstance) return window.vapiSDKInstance;
        
        await loadVapiConfig();

        try {
            const mod = await import("https://esm.sh/@vapi-ai/web");
            const Vapi = mod.default || mod.Vapi;
            vapiInstance = new Vapi(vapiConfig.publicKey);
            window.vapiSDKInstance = vapiInstance;
            setupVapiEvents();
            return vapiInstance;
        } catch (err) {
            console.error('[Vapi SDK Error]: No se pudo cargar el SDK de Vapi:', err);
            return null;
        }
    }

    function setupVapiEvents() {
        if (!vapiInstance) return;

        vapiInstance.on('call-start', () => {
            isCallActive = true;
            updateUIState('active');
            startTimer();
        });

        vapiInstance.on('call-end', () => {
            isCallActive = false;
            updateUIState('idle');
            stopTimer();
        });

        vapiInstance.on('speech-start', () => {
            document.getElementById('vapiAvatar').classList.add('speaking');
            document.getElementById('vapiWaves').classList.add('active');
            document.getElementById('vapiStatusText').innerText = 'Marcela está hablando...';
        });

        vapiInstance.on('speech-end', () => {
            document.getElementById('vapiAvatar').classList.remove('speaking');
            document.getElementById('vapiWaves').classList.remove('active');
            document.getElementById('vapiStatusText').innerText = 'Escuchando tu voz...';
        });

        vapiInstance.on('error', (err) => {
            console.error('[Vapi Call Error]:', err);
            isCallActive = false;
            updateUIState('idle');
            stopTimer();
            alert('Llamada finalizada o interrumpida. Verifica que tu micrófono esté permitido en el navegador.');
        });
    }

    function startTimer() {
        stopTimer();
        callSeconds = 0;
        callTimerInterval = setInterval(() => {
            callSeconds++;
            const mins = String(Math.floor(callSeconds / 60)).padStart(2, '0');
            const secs = String(callSeconds % 60).padStart(2, '0');
            document.getElementById('vapiTimer').innerText = `${mins}:${secs}`;
        }, 1000);
    }

    function stopTimer() {
        if (callTimerInterval) clearInterval(callTimerInterval);
        document.getElementById('vapiTimer').innerText = '00:00';
    }

    function updateUIState(state) {
        const card = document.getElementById('vapiCallCard');
        const triggerText = document.getElementById('vapiTriggerText');
        const mainBtn = document.getElementById('vapiMainTrigger');
        const statusText = document.getElementById('vapiStatusText');

        if (state === 'connecting') {
            card.style.display = 'flex';
            statusText.innerText = 'Conectando con Marcela...';
            triggerText.innerText = '⏳ Conectando...';
            mainBtn.style.background = 'linear-gradient(135deg, #ffb703, #d4a373)';
        } else if (state === 'active') {
            card.style.display = 'flex';
            statusText.innerText = 'Llamada conectada';
            triggerText.innerText = '🛑 Finalizar Llamada';
            mainBtn.style.background = 'linear-gradient(135deg, #ef476f, #d90429)';
        } else {
            card.style.display = 'none';
            triggerText.innerText = 'Hablar por Voz con Marcela';
            mainBtn.style.background = 'linear-gradient(135deg, #ff0055, #ffb703)';
            document.getElementById('vapiAvatar').classList.remove('speaking');
            document.getElementById('vapiWaves').classList.remove('active');
        }

        // Synchronize legacy page buttons if present (e.g., #vapiCallBtn)
        const legacyBtn = document.getElementById('vapiCallBtn');
        if (legacyBtn) {
            if (state === 'connecting') {
                legacyBtn.innerHTML = '⏳ Conectando...';
            } else if (state === 'active') {
                legacyBtn.innerHTML = '🛑 Colgar Llamada';
                legacyBtn.style.background = '#d90429';
            } else {
                legacyBtn.innerHTML = '📞 Hablar por Voz con Marcela';
                legacyBtn.style.background = '#ff0055';
            }
        }
    }

    async function toggleCall() {
        if (isCallActive) {
            if (vapiInstance) vapiInstance.stop();
            return;
        }

        updateUIState('connecting');
        const sdk = await initVapiSDK();

        if (!sdk) {
            alert('No se pudo inicializar la llamada. Por favor recarga la página.');
            updateUIState('idle');
            return;
        }

        try {
            if (vapiConfig.assistantOverrides) {
                await sdk.start(vapiConfig.assistantId, vapiConfig.assistantOverrides);
            } else {
                await sdk.start(vapiConfig.assistantId);
            }
        } catch (err) {
            console.error('[Vapi Start Exception]:', err);
            updateUIState('idle');
            alert('Por favor permite el uso del micrófono para iniciar la llamada con Marcela.');
        }
    }

    // Attach Click Events
    document.addEventListener('DOMContentLoaded', () => {
        const mainTrigger = document.getElementById('vapiMainTrigger');
        const endBtn = document.getElementById('vapiEndBtn');
        const muteBtn = document.getElementById('vapiMuteBtn');

        mainTrigger.addEventListener('click', toggleCall);
        endBtn.addEventListener('click', () => {
            if (vapiInstance) vapiInstance.stop();
        });

        muteBtn.addEventListener('click', () => {
            if (!vapiInstance) return;
            isMuted = !isMuted;
            vapiInstance.setMuted(isMuted);
            if (isMuted) {
                muteBtn.classList.add('muted');
                muteBtn.innerText = '🔇 Silenciado';
            } else {
                muteBtn.classList.remove('muted');
                muteBtn.innerText = '🎤 Silenciar';
            }
        });

        // Delegate legacy button click if present
        const legacyBtn = document.getElementById('vapiCallBtn');
        if (legacyBtn) {
            legacyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleCall();
            });
        }
    });

})();
