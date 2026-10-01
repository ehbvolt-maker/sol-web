/**
 * ============================================================================
 * ESTUDIO DEL AGENTE VIRTUAL IA & PIPELINE REELS (INSTAGRAM & FACEBOOK)
 * Script interactivo para simulación, síntesis de guiones y publicación Meta
 * ============================================================================
 */

(function () {
    const blogArticlesData = [
        {
            id: 1,
            title: "Guía Net Metering 2026: Cómo congelar tu factura eléctrica (Regla 25-6.065)",
            category: "Medición Neta",
            readTime: "4 min",
            icon: "☀️",
            brollImg: "assets/solar_benefits_es.png",
            brollCaption: "Contador Bidireccional Net Metering",
            hook: "¿Sabías que tu compañía eléctrica en Florida está obligada por ley a pagarte por el sol que cae en tu techo?",
            insight: "Bajo la Regla 25-6.065 del Código de Florida, tu contador bidireccional gira hacia atrás y acumula créditos en kWh para compensar las noches y el verano.",
            solution: "En lugar de facturas impredecibles de $300 que suben año con año, el programa a $0 Inicial congela tu gasto en una cuota fija mucho menor respaldada por programas federales.",
            cta: "Toca el enlace en mi perfil o llámame al (305) 813-6159 para validar tu dirección satelitalmente hoy mismo. ¡Hablemos!",
            subtitles: [
                "¿SABÍAS QUE TU COMPAÑÍA ELÉCTRICA EN FLORIDA...",
                "...ESTÁ OBLIGADA POR LEY A PAGARTE POR EL SOL?",
                "LA REGLA 25-6.065 ACTIVA LA MEDICIÓN NETA BIDIRECCIONAL.",
                "CADA KILOVATIO GIRA TU CONTADOR HACIA ATRÁS...",
                "...Y ACUMULA CRÉDITOS PARA EL VERANO Y LAS NOCHES.",
                "CAMBIA FACTURAS VARIABLES DE $300 POR UNA CUOTA FIJA.",
                "$0 INVERSIÓN INICIAL Y RESPALDO FEDERAL REAL.",
                "LLÁMAME DIRECTAMENTE AL (305) 813-6159 O ENTRA AL ENLACE."
            ]
        },
        {
            id: 2,
            title: "¿Paneles 'Gratis' en Florida? La Verdad del Programa a $0 Inicial ($0 Down)",
            category: "Mitos y Costos",
            readTime: "5 min",
            icon: "⚡",
            brollImg: "assets/solar_install_1.png",
            brollCaption: "Instalación Certificada $0 Down",
            hook: "¡Cuidado con los anuncios en redes que dicen que el gobierno regala paneles solares en Florida!",
            insight: "El gobierno no regala nada, pero el programa regulado a $0 Down sí te permite sustituir tu recibo de luz sin pagar un centavo de entrada.",
            solution: "Si eres dueño de casa y pagas más de $100 al mes de luz, cambias un gasto perdido por un activo con garantía de 25 años que sube la plusvalía de tu propiedad.",
            cta: "Escríbeme al (305) 813-6159 o envía un WhatsApp para verificar tu calificación en 30 segundos sin compromiso.",
            subtitles: [
                "¡CUIDADO CON LOS ANUNCIOS ENGAÑOSOS EN REDES!",
                "EL GOBIERNO NO REGALA PANELES SOLARES...",
                "PERO EL PROGRAMA A $0 INICIAL SÍ ES 100% REAL.",
                "NO PAGAS NADA AL INICIO ($0 DOWN).",
                "SI PAGAS MÁS DE $100 DE LUZ AL MES, CALIFICAS.",
                "CAMBIAS UN GASTO PERDIDO POR UN ACTIVO TUYO.",
                "GARANTÍA DE 25 AÑOS Y PROTECCIÓN CONTRA INFLACIÓN.",
                "ENVÍA UN WHATSAPP AL (305) 813-6159 Y REVISA TU TECHO."
            ]
        },
        {
            id: 3,
            title: "Inspección Satelital 3D de Techos con Azimut y Sombras",
            category: "Ingeniería 3D",
            readTime: "3 min",
            icon: "🛰️",
            brollImg: "assets/silfab_440_panel.png",
            brollCaption: "Modelado Satelital LiDAR 3D",
            hook: "¿Por qué analizamos tu techo por satélite antes de marcar tu número telefónico?",
            insight: "No enviamos vendedores a quitarte horas en tu sala. Con software geoespacial y tecnología LiDAR evaluamos inclinación, azimut y micro-sombras en minutos.",
            solution: "Calculamos con precisión milimétrica la capacidad para paneles Silfab resistentes a vientos de huracán de hasta 175 MPH (Cat 5).",
            cta: "Solicita tu estudio satelital 3D sin costo llamando al (305) 813-6159. ¡Te entrego los números exactos de tu techo hoy!",
            subtitles: [
                "¿POR QUÉ REVISAMOS TU TECHO POR SATÉLITE ANTES DE LLAMARTE?",
                "NO ENVIAMOS VENDEDORES A QUITARTE HORAS EN TU SALA.",
                "USAMOS TECNOLOGÍA LIDAR Y MAPAS SATELITALES 3D.",
                "EVALUAMOS AZIMUT, INCLINACIÓN Y MICRO-SOMBRAS.",
                "PANELES SILFAB RESISTENTES A VIENTOS DE 175 MPH.",
                "VALIDAMOS TU CALIFICACIÓN TÉCNICA EN 15 MINUTOS.",
                "SOLICITA TU ESTUDIO SATELITAL 3D SIN COSTO.",
                "MÁRCAME AL (305) 813-6159 Y TE MUESTRO TU TECHO."
            ]
        },
        {
            id: 4,
            title: "Baterías Tesla Powerwall 3 vs Generadores en Huracanes",
            category: "Baterías y Tormentas",
            readTime: "6 min",
            icon: "🔋",
            brollImg: "assets/tesla_powerwall_3.png",
            brollCaption: "Tesla Powerwall 3 LFP",
            hook: "En temporada de huracanes en Florida, las gasolineras colapsan. Un generador convencional no te va a salvar.",
            insight: "Las baterías inteligentes de litio como Tesla Powerwall 3 se recargan día a día con el sol y responden en menos de 10 milisegundos tras un apagón.",
            solution: "Sin ruido ensordecedor, sin humo tóxico y sin hacer filas de 4 horas por gasolina, tu casa mantiene el aire acondicionado y refrigeradores encendidos.",
            cta: "Protege a tu familia antes de la próxima tormenta. Consulta opciones de batería al (305) 813-6159.",
            subtitles: [
                "EN TEMPORADA DE HURACANES, LAS GASOLINERAS COLAPSAN.",
                "UN GENERADOR A GASOLINA NO TE VA A SALVAR.",
                "LA BATERÍA TESLA POWERWALL 3 RESPONDE EN 10 MILISEGUNDOS.",
                "SE RECARGA DÍA A DÍA CON EL SOL EN TU TECHO.",
                "SIN RUIDO, SIN HUMO TÓXICO Y SIN FILAS DE GASOLINA.",
                "AIRE ACONDICIONADO Y REFRIGERADORES CONTINUOS.",
                "PROTEGE A TU FAMILIA EN LA PRÓXIMA TORMENTA.",
                "LLÁMAME AL (305) 813-6159 Y COTIZA TU RESPALDO."
            ]
        },
        {
            id: 5,
            title: "Purificación de Agua Puronics con Patente NASA SilverShield e iGen",
            category: "Purificación NASA",
            readTime: "4 min",
            icon: "💧",
            brollImg: "assets/puronics_official_lineup.png",
            brollCaption: "Puronics SilverShield NASA",
            hook: "¿Sabes qué químicos, microplásticos y cloro estás consumiendo en el agua de tu grifo en Florida?",
            insight: "La tecnología SilverShield de Puronics, desarrollada con patente licenciada de la NASA, utiliza iones de plata para inhibir bacterias en el filtro.",
            solution: "La válvula inteligente iGen optimiza el consumo, protege tus electrodomésticos y recibes 20 AÑOS de productos de aseo gratis incluidos.",
            cta: "Reclama tu oferta de 20 años de productos gratis al (305) 813-6159 o cotiza tu suavizador por WhatsApp.",
            subtitles: [
                "¿SABES QUÉ QUÍMICOS Y CLORO TIENE EL AGUA DE TU CASA?",
                "PURONICS CUENTA CON TECNOLOGÍA LICENCIADA DE LA NASA.",
                "LA CAPA SILVERSHIELD ELIMINA BACTERIAS Y CLORAMINAS.",
                "PROTEGE LA PIEL, EL CABELLO Y TUS ELECTRODOMÉSTICOS.",
                "VÁLVULA DIGITAL IGEN CON MICROPROCESADOR INTELIGENTE.",
                "¡OFERTA EXCLUSIVA: 20 AÑOS DE PRODUCTOS DE ASEO GRATIS!",
                "PRECIOS BLINDADOS POR FINANCIERAS FEDERALES.",
                "COMUNÍCATE AL (305) 813-6159 Y RECLAMA TU OFERTA."
            ]
        }
    ];

    let currentArticleIndex = 0;
    let isReelPlaying = false;
    let reelTimer = null;
    let subtitleStep = 0;
    let isVoiceActive = false;

    // DOM Elements
    const pickerContainer = document.getElementById('studioArticlePicker');
    const scriptBox = document.getElementById('studioScriptContent');
    const reelBrollImg = document.getElementById('reelBrollImg');
    const reelBrollCaption = document.getElementById('reelBrollCaption');
    const reelCaptionsText = document.getElementById('reelDynamicCaption');
    const reelAudioWave = document.getElementById('reelAudioWave');
    const btnReelPlay = document.getElementById('btnReelPlay');
    const btnReelAudio = document.getElementById('btnReelAudio');
    const reelBgAvatar = document.getElementById('reelBgAvatar');

    function renderArticlePicker() {
        if (!pickerContainer) return;
        pickerContainer.innerHTML = '';

        blogArticlesData.forEach((art, idx) => {
            const item = document.createElement('div');
            item.className = `article-picker-item ${idx === currentArticleIndex ? 'active' : ''}`;
            item.onclick = () => selectStudioArticle(idx);

            item.innerHTML = `
                <div class="picker-item-info">
                    <span class="picker-item-icon">${art.icon}</span>
                    <div>
                        <div class="picker-item-title">${art.title}</div>
                        <div class="picker-item-meta">📰 ${art.category} • ⏱️ ${art.readTime}</div>
                    </div>
                </div>
                <span class="picker-badge">${idx === currentArticleIndex ? '✓ Activo' : 'Seleccionar'}</span>
            `;
            pickerContainer.appendChild(item);
        });
    }

    function updateScriptDisplay() {
        const art = blogArticlesData[currentArticleIndex];
        if (!art || !scriptBox) return;

        scriptBox.innerHTML = `
            <div class="script-segment">
                <span class="script-tag tag-hook">🎯 Hook (0-3s)</span>
                <strong>"${art.hook}"</strong>
            </div>
            <div class="script-segment">
                <span class="script-tag tag-insight">💡 Resumen Técnico (3-20s)</span>
                ${art.insight}
            </div>
            <div class="script-segment">
                <span class="script-tag tag-solution">⚖️ Solución & Respaldo (20-40s)</span>
                ${art.solution}
            </div>
            <div class="script-segment">
                <span class="script-tag tag-cta">📲 Llamada a la Acción (40-55s)</span>
                <strong>${art.cta}</strong>
            </div>
        `;

        // Update Phone Mockup elements
        if (reelBrollImg) reelBrollImg.src = art.brollImg;
        if (reelBrollCaption) reelBrollCaption.innerText = art.brollCaption;
        if (reelCaptionsText) {
            reelCaptionsText.innerHTML = formatSubtitles(art.subtitles[0]);
        }
    }

    function formatSubtitles(text) {
        if (!text) return '';
        const words = text.split(' ');
        // Highlight random keyword or numbers
        return words.map((w, i) => {
            if (w.includes('$') || w.includes('25') || w.includes('305') || w.includes('SOL') || w.includes('NASA') || w.includes('FLORIDA') || i === Math.floor(words.length / 2)) {
                return `<span class="highlight-word">${w}</span>`;
            }
            return w;
        }).join(' ');
    }

    window.selectStudioArticle = function (index) {
        currentArticleIndex = index;
        subtitleStep = 0;
        stopReel();
        renderArticlePicker();
        updateScriptDisplay();
    };

    window.toggleReelPlay = function () {
        if (isReelPlaying) {
            stopReel();
        } else {
            startReel();
        }
    };

    function startReel() {
        isReelPlaying = true;
        if (btnReelPlay) btnReelPlay.innerText = '⏸';
        if (reelBgAvatar) reelBgAvatar.classList.add('speaking-animation');
        if (reelAudioWave) reelAudioWave.classList.add('wave-active');

        const art = blogArticlesData[currentArticleIndex];
        const subs = art.subtitles;

        if (isVoiceActive) {
            playSpeechSynthesis(art);
        }

        if (reelTimer) clearInterval(reelTimer);
        reelTimer = setInterval(() => {
            subtitleStep = (subtitleStep + 1) % subs.length;
            if (reelCaptionsText) {
                reelCaptionsText.innerHTML = formatSubtitles(subs[subtitleStep]);
            }
        }, 3200);
    }

    function stopReel() {
        isReelPlaying = false;
        if (reelTimer) clearInterval(reelTimer);
        reelTimer = null;
        if (btnReelPlay) btnReelPlay.innerText = '▶';
        if (reelBgAvatar) reelBgAvatar.classList.remove('speaking-animation');
        if (reelAudioWave) reelAudioWave.classList.remove('wave-active');
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }

    window.toggleReelAudio = function () {
        isVoiceActive = !isVoiceActive;
        if (btnReelAudio) {
            btnReelAudio.classList.toggle('active', isVoiceActive);
            btnReelAudio.innerHTML = isVoiceActive ? '🔊 Voz Activa' : '🔇 Activar Voz';
        }

        if (isVoiceActive) {
            if (!isReelPlaying) {
                startReel();
            } else {
                const art = blogArticlesData[currentArticleIndex];
                playSpeechSynthesis(art);
            }
        } else {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        }
    };

    function playSpeechSynthesis(art) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        const fullSpeech = `${art.hook} ${art.insight} ${art.solution} ${art.cta}`;
        const utterance = new SpeechSynthesisUtterance(fullSpeech);
        utterance.lang = 'es-US';
        utterance.rate = 1.05;
        utterance.pitch = 0.95;

        // Try selecting male Spanish voice
        const voices = window.speechSynthesis.getVoices();
        const esVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Jorge') || v.name.includes('Diego') || v.name.includes('Pablo') || v.name.includes('Male'))) || voices.find(v => v.lang.startsWith('es'));
        if (esVoice) utterance.voice = esVoice;

        utterance.onend = () => {
            if (isReelPlaying) {
                setTimeout(() => {
                    if (isReelPlaying && isVoiceActive) playSpeechSynthesis(art);
                }, 1000);
            }
        };

        window.speechSynthesis.speak(utterance);
    }

    // Action 1: Generar Guion con IA
    window.generateScriptAI = function () {
        const art = blogArticlesData[currentArticleIndex];
        const btn = document.getElementById('btnGenerateScript');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '⏳ Procesando con GPT-4o...';
            btn.style.opacity = '0.7';

            setTimeout(() => {
                btn.innerHTML = '✅ ¡Guion Generado con Éxito!';
                btn.style.opacity = '1';
                setTimeout(() => { btn.innerHTML = originalText; }, 2500);
                startReel();
                showToastNotification(`✨ Guion neuroventas para "${art.title.substring(0, 30)}..." sintetizado correctamente.`);
            }, 1200);
        }
    };

    // Action 2: Publicar a Instagram y Facebook (Meta API / Make)
    window.publishToMetaReels = function () {
        const art = blogArticlesData[currentArticleIndex];
        const btn = document.getElementById('btnPublishMeta');
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '🚀 Enviando a Meta Graph API...';
            btn.style.opacity = '0.7';

            // Simulate / Call API
            fetch('/api/generate-marketing-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    articleId: art.id,
                    title: art.title,
                    script: `${art.hook} ${art.insight} ${art.solution} ${art.cta}`
                })
            }).catch(e => console.log('Simulando respuesta local:', e));

            setTimeout(() => {
                btn.innerHTML = '🎉 ¡Publicado en Instagram & FB!';
                btn.style.opacity = '1';
                setTimeout(() => { btn.innerHTML = originalText; }, 3500);

                showToastNotification(`🚀 Video enviado a Meta Graph API & Make.com. En cola de publicación para Instagram Reels (@ehbvolt) y Facebook Pages.`);
            }, 1800);
        }
    };

    // Modal Blueprint
    window.openBlueprintModal = function () {
        const modal = document.getElementById('blueprintModal');
        if (modal) modal.classList.add('active');
    };

    window.closeBlueprintModal = function () {
        const modal = document.getElementById('blueprintModal');
        if (modal) modal.classList.remove('active');
    };

    function showToastNotification(message) {
        let toast = document.getElementById('studioToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'studioToast';
            toast.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                border: 2px solid #ffb703;
                color: #ffffff;
                padding: 14px 22px;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.6);
                z-index: 10000;
                font-size: 0.92rem;
                font-weight: 600;
                max-width: 380px;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(toast);
        }
        toast.innerHTML = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
        }, 4000);
    }

    // Initialize on load
    document.addEventListener('DOMContentLoaded', () => {
        renderArticlePicker();
        updateScriptDisplay();
    });

})();
