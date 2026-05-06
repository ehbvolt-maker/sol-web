document.addEventListener("DOMContentLoaded", () => {
    const billRange = document.getElementById('billRange');
    const billValue = document.getElementById('billValue');
    const savings10y = document.getElementById('savings10y');
    const savings25y = document.getElementById('savings25y');
    const treesSaved = document.getElementById('treesSaved');

    // Helper para detectar idioma actual (usando Google Translate cookie o html classes)
    function getCurrentLanguage() {
        // Si el widget de Google añadió la clase de traducción, estamos en Inglés
        if (document.documentElement.classList.contains('translated-ltr') || document.body.classList.contains('translated-ltr')) {
            return 'en';
        }
        if (document.documentElement.lang.toLowerCase().startsWith('en')) {
            return 'en';
        }
        // Fallback a Cookie
        const cookie = document.cookie.split('; ').find(row => row.includes('googtrans='));
        if (cookie && cookie.includes('/en')) {
            return 'en';
        }
        return 'es';
    }

    function updateCalculator() {
        const val = parseInt(billRange.value);
        billValue.innerText = `$${val}`;

        // Cálculos reales basados en datos de FPL
        const fplMonthly = val;
        const fplInflation = 0.04; // 4%
        const years25 = 25;
        const years10 = 10;
        
        const a = fplMonthly * 12;
        const r = 1 + fplInflation;
        
        // FPL Cumulative (25 años)
        const fplCumulative25 = a * (Math.pow(r, years25) - 1) / (r - 1);
        
        // FPL Cumulative (10 años)
        const fplCumulative10 = a * (Math.pow(r, years10) - 1) / (r - 1);
        
        // Parámetros Solares
        const solarMonthly = fplMonthly * (300 / 450); // Proporción de la tabla ($450 FPL -> $300 Solar)
        const solarCumulative25 = solarMonthly * 12 * years25;
        const solarCumulative10 = solarMonthly * 12 * years10;
        
        const netSavings25 = Math.round(fplCumulative25 - solarCumulative25);
        const netSavings10 = Math.round(fplCumulative10 - solarCumulative10);
        
        // Cálculos ambientales
        const trees = Math.round(val * 0.7 * 2.5); // Escala a 25 años
        
        if (savings10y) savings10y.innerText = `$${netSavings10.toLocaleString('en-US')}`;
        if (savings25y) savings25y.innerText = `$${netSavings25.toLocaleString('en-US')}`;
        if (treesSaved) treesSaved.innerText = trees;
    }

    billRange.addEventListener('input', updateCalculator);
    updateCalculator(); // init

    // Animación al hacer scroll (Scroll Reveal)
    const reveals = document.querySelectorAll('.scroll-reveal');

    function reveal() {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;

        reveals.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('visible');
            }
        });
    }

    window.addEventListener('scroll', reveal);
    reveal(); // Trigger on load

    // Lógica del Chat Widget (Cerebro IA Simulado)
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    const chatBody = document.getElementById('chatBody');
    const chatInput = document.getElementById('chatInput');
    const sendChat = document.getElementById('sendChat');
    const notificationBadge = document.querySelector('.notification-badge');

    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
        if(notificationBadge) notificationBadge.style.display = 'none';
    });

    closeChat.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message');
        msgDiv.classList.add(sender === 'sol' ? 'sol-msg' : 'user-msg');
        msgDiv.innerHTML = `<p>${text}</p>`;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function addTypingIndicator() {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', 'sol-msg');
        msgDiv.id = 'typingIndicator';
        msgDiv.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function removeTypingIndicator() {
        const ind = document.getElementById('typingIndicator');
        if (ind) ind.remove();
    }

    function getSolResponse(userInput) {
        const text = userInput.toLowerCase();
        
        // Saludos
        if (text.includes("hola") || text.includes("buenos") || text.includes("buenas") || text.includes("qué tal")) {
            return "¡Hola! Qué gusto saludarte. Estoy aquí para resolver todas tus dudas sobre la transición a energía solar. ¿Qué te gustaría saber hoy?";
        } 
        // Costos e Inversión
        else if (text.includes("precio") || text.includes("costo") || text.includes("cuanto cuesta") || text.includes("inversión") || text.includes("dinero")) {
            return "El costo promedio de instalación varía entre $10,000 y $15,000 USD antes de incentivos fiscales. ¡Pero recuerda que recuperas esa inversión ahorrando en tu factura cada mes!";
        } 
        // Clima: Lluvia / Nubes
        else if (text.includes("lluvia") || text.includes("nubes") || text.includes("nublado")) {
            return "¡Excelente pregunta! Sí, los paneles modernos siguen generando energía en días nublados o lluviosos. Aunque la eficiencia baja un poco, la luz difusa sigue siendo capturada eficientemente.";
        } 
        // Clima: Nieve / Invierno
        else if (text.includes("nieve") || text.includes("invierno") || text.includes("frio") || text.includes("frío")) {
            return "¡Los paneles solares adoran el frío! De hecho, funcionan de manera más eficiente a temperaturas bajas. Si nieva, el ángulo de instalación suele hacer que la nieve resbale, y la luz se refleja en la nieve circundante aumentando la captación.";
        }
        // Baterías y Noche
        else if (text.includes("bateria") || text.includes("baterías") || text.includes("noche")) {
            return "Recomiendo mucho integrar baterías de litio si quieres independencia total. Así puedes guardar la energía que produces de día para usarla de noche o durante cortes eléctricos.";
        } 
        // Mantenimiento
        else if (text.includes("mantenimiento") || text.includes("limpiar") || text.includes("cuidados")) {
            return "El mantenimiento es mínimo. Solo necesitas limpiarlos con agua un par de veces al año para quitar el polvo y asegurar que capten la máxima luz solar.";
        } 
        // Garantía y Vida útil
        else if (text.includes("garantía") || text.includes("garantia") || text.includes("cuanto duran") || text.includes("vida útil") || text.includes("rompe")) {
            return "La mayoría de nuestros paneles vienen con una garantía de rendimiento de 25 años. Tienen una vida útil muy larga y están fabricados con cristal templado capaz de resistir granizo y vientos fuertes.";
        }
        // Valor de la casa / Vender
        else if (text.includes("valor") || text.includes("vender") || text.includes("mudanza") || text.includes("casa")) {
            return "Instalar paneles solares aumenta significativamente el valor de tu propiedad en el mercado inmobiliario. Los compradores adoran las casas que generan su propia energía sin facturas altas.";
        }
        // Tiempo de instalación
        else if (text.includes("tiempo") || text.includes("cuanto tardan") || text.includes("instalacion") || text.includes("instalar")) {
            return "La instalación física en tu techo suele tomar solo 1 o 2 días. El proceso completo, incluyendo diseño, permisos gubernamentales e inspecciones, suele llevar entre 3 y 6 semanas en total.";
        }
        // Instalador / Equity Solar
        else if (text.includes("instalador") || text.includes("empresa") || text.includes("equity") || text.includes("quien instala")) {
            return "Nuestro instalador oficial exclusivo es Equity Solar. Son líderes absolutos con más de 100,000 instalaciones exitosas en Florida y una impecable calificación de 4.9 estrellas en Google. Estás en las mejores manos.";
        }
        // Respuesta por defecto
        else {
            return "Ese es un punto muy interesante. Como IA, mi análisis de datos me indica que tu caso puede requerir detalles más precisos. ¿Te gustaría agendar una evaluación técnica gratuita con uno de nuestros ingenieros humanos?";
        }
    }

    async function handleChat() {
        const text = chatInput.value.trim();
        if (text === '') return;
        
        addMessage(text, 'user');
        chatInput.value = '';
        
        addTypingIndicator();
        
        try {
            const currentLang = getCurrentLanguage();
            const res = await fetch('/api/ask-sol', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, language: currentLang })
            });

            removeTypingIndicator();
            
            let responseText = '';
            if(res.ok) {
                const data = await res.json();
                responseText = data.response;
            } else {
                // Fallback local si el servidor AI falla (ej. sin API key)
                responseText = getSolResponse(text);
            }
            
            addMessage(responseText, 'sol');
            speakText(responseText);

            // Guardar log en el backend silenciosamente
            fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_message: text, bot_response: responseText })
            }).catch(e => console.log('Error logging chat', e));
            
        } catch (error) {
            removeTypingIndicator();
            const responseText = getSolResponse(text);
            addMessage(responseText, 'sol');
            speakText(responseText);
        }
    }

    sendChat.addEventListener('click', handleChat);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChat();
        });
    }

    // --- Web Speech API (Voz a Texto y Texto a Voz) ---
    const micBtn = document.getElementById('micBtn');
    const voiceToggle = document.getElementById('voiceToggle');
    let isVoiceEnabled = false;
    let recognition = null;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'es-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        if (micBtn) {
            micBtn.addEventListener('click', () => {
                micBtn.style.transform = 'scale(1.2)';
                micBtn.style.color = '#06d6a0';
                recognition.lang = getCurrentLanguage() === 'en' ? 'en-US' : 'es-US';
                recognition.start();
            });

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                chatInput.value = transcript;
                handleChat(); // Enviar automáticamente después de hablar
            };

            recognition.onspeechend = () => {
                recognition.stop();
                micBtn.style.transform = 'scale(1)';
                micBtn.style.color = 'var(--text-main)';
            };

            recognition.onerror = (event) => {
                console.error('Error de micrófono:', event.error);
                micBtn.style.transform = 'scale(1)';
                micBtn.style.color = 'var(--text-main)';
            };
        }
    } else {
        if(micBtn) micBtn.style.display = 'none'; // Esconder si no está soportado
    }

    if(voiceToggle) {
        voiceToggle.addEventListener('click', () => {
            isVoiceEnabled = !isVoiceEnabled;
            voiceToggle.innerText = isVoiceEnabled ? '🔊' : '🔇';
            voiceToggle.title = isVoiceEnabled ? 'Desactivar Voz' : 'Activar Voz';
            if (isVoiceEnabled) {
                speakText('Modo de voz activado.');
            } else {
                window.speechSynthesis.cancel();
            }
        });
    }

    function speakText(text) {
        if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel(); // Detener audios anteriores
        const utterance = new SpeechSynthesisUtterance(text);
        const currentLang = getCurrentLanguage();
        utterance.lang = currentLang === 'en' ? 'en-US' : 'es-US';
        utterance.pitch = 1.1; 
        utterance.rate = 1.0;
        
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice;
        if (currentLang === 'en') {
            selectedVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Zira')));
        } else {
            selectedVoice = voices.find(v => v.lang.includes('es') && (v.name.includes('Female') || v.name.includes('Monica') || v.name.includes('Paulina') || v.name.includes('Google español')));
        }
        if (selectedVoice) utterance.voice = selectedVoice;

        window.speechSynthesis.speak(utterance);
    }
    // -------------------------------------------------

    // Lógica del Modal Quiz / Matchmaker
    const generateBtn = document.querySelector('.calculator-container .btn-primary.full-width');
    const joinTodayBtn = document.getElementById('joinTodayBtn');
    const quizModal = document.getElementById('quizModal');
    const closeQuiz = document.getElementById('closeQuiz');
    const quizBtns = document.querySelectorAll('.quiz-btn');
    const submitLead = document.getElementById('submitLead');
    const successMsg = document.getElementById('successMsg');

    let quizData = {
        is_owner: '',
        bill_over_100: '',
        credit_score: '',
        roof_type: '',
        zipcode: ''
    };

    if(generateBtn) {
        generateBtn.addEventListener('click', () => {
            quizModal.classList.add('active');
        });
    }

    if(joinTodayBtn) {
        joinTodayBtn.addEventListener('click', () => {
            quizModal.classList.add('active');
        });
    }

    if(closeQuiz) {
        closeQuiz.addEventListener('click', () => {
            quizModal.classList.remove('active');
            setTimeout(() => {
                document.querySelectorAll('.quiz-step').forEach(s => s.classList.remove('active'));
                document.getElementById('step1').classList.add('active');
                successMsg.style.display = 'none';
                submitLead.style.display = 'block';
                document.getElementById('leadEmail').value = '';
            }, 300);
        });
    }

    quizBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const step = e.target.closest('.quiz-step').id;
            
            if (step === 'step1') {
                quizData.is_owner = e.target.innerText;
            } else if (step === 'step2') {
                quizData.bill_over_100 = e.target.innerText;
            } else if (step === 'step3') {
                quizData.credit_score = e.target.innerText;
            } else if (step === 'step4') {
                quizData.roof_type = e.target.innerText;
            }

            const nextStepId = e.target.getAttribute('data-next');
            if(nextStepId) {
                e.target.closest('.quiz-step').classList.remove('active');
                document.getElementById(nextStepId).classList.add('active');
            }
        });
    });

    if(submitLead) {
        submitLead.addEventListener('click', async () => {
            const email = document.getElementById('leadEmail').value;
            const name = document.getElementById('leadName').value;
            const phone = document.getElementById('leadPhone').value;
            const address = document.getElementById('leadAddress').value;
            const zipcode = document.getElementById('leadZip').value;

            if(!name.trim()) {
                alert('Por favor ingresa tu nombre completo.');
                return;
            }
            if(!phone.trim()) {
                alert('Por favor ingresa tu número de teléfono.');
                return;
            }
            if(!address.trim()) {
                alert('Por favor ingresa la dirección de la propiedad.');
                return;
            }
            if(!zipcode.trim()) {
                alert('Por favor ingresa tu código postal.');
                return;
            }
            if(!email.includes('@')) {
                alert('Por favor ingresa un correo electrónico válido.');
                return;
            }

            submitLead.style.display = 'none';
            quizData.email = email;
            quizData.name = name;
            quizData.phone = phone;
            quizData.address = address;
            quizData.zipcode = zipcode;
            
            try {
                const response = await fetch('/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(quizData)
                });
                
                if (response.ok) {
                    const leadMessage = `¡Nuevo Lead Solar! ☀️\nNombre: ${name}\nTeléfono: ${phone}\nDirección: ${address}, CP: ${zipcode}\nEmail: ${email}\nPropietario: ${quizData.is_owner}\nFactura >$100: ${quizData.bill_over_100}\nCrédito >650: ${quizData.credit_score}\nTecho: ${quizData.roof_type}`;
                    
                    // Enviar al número principal (Eliecer)
                    const waLink = `https://wa.me/13058136159?text=${encodeURIComponent(leadMessage)}`;
                    
                    successMsg.innerText = '¡Excelente! Abriendo WhatsApp para confirmar tu estudio...';
                    successMsg.style.display = 'block';
                    
                    const waBtns = document.getElementById('whatsappButtons');
                    if (waBtns) waBtns.style.display = 'none';

                    // Redirección automática al WhatsApp del consultor
                    setTimeout(() => {
                        window.open(waLink, '_blank') || (window.location.href = waLink);
                    }, 1000);
                    
                    // Iniciar chat de IA en segundo plano
                    if(!chatWindow.classList.contains('active')){
                        chatWindow.classList.add('active');
                    }
                    addTypingIndicator();
                    setTimeout(() => {
                        removeTypingIndicator();
                        addMessage(`¡Genial! Acabo de registrar tus datos y enviar el reporte a ${email}. Nuestro equipo evaluará la propiedad en ${address}. ¿Tienes alguna duda mientras tanto?`, 'sol');
                    }, 2000);

                    // El modal se quedará abierto infinitamente hasta que el usuario elija.
                    // Si hacen clic en un botón de WhatsApp, cerramos el modal después de 1 segundo.
                    document.getElementById('waBtn1').addEventListener('click', () => setTimeout(() => quizModal.classList.remove('active'), 1000));
                    document.getElementById('waBtn2').addEventListener('click', () => setTimeout(() => quizModal.classList.remove('active'), 1000));
                } else {
                    const data = await response.json();
                    alert(`Error del servidor: ${data.error || 'No se pudo guardar la información'}`);
                    submitLead.style.display = 'block';
                }
            } catch (error) {
                console.error('Error:', error);
                // Fallback visual si el servidor no está corriendo
                successMsg.innerText = 'Servidor no conectado, guardado localmente (modo demo).';
                successMsg.style.display = 'block';
                setTimeout(() => quizModal.classList.remove('active'), 2000);
            }
        });
    }

    // Audio Player Lógica
    const playSolAudio = document.getElementById('playSolAudio');
    const audioWave = document.querySelector('.audio-wave');
    const audioTime = document.querySelector('.audio-time');
    let isPlaying = false;
    let audioTimer;

    if(playSolAudio) {
        playSolAudio.addEventListener('click', () => {
            isPlaying = !isPlaying;
            if(isPlaying) {
                playSolAudio.innerHTML = '⏸';
                audioWave.classList.add('playing');
                let seconds = 0;
                audioTime.innerText = `0:00 / 0:15`;
                audioTimer = setInterval(() => {
                    seconds++;
                    if(seconds <= 15) {
                        audioTime.innerText = `0:${seconds < 10 ? '0'+seconds : seconds} / 0:15`;
                    } else {
                        clearInterval(audioTimer);
                        isPlaying = false;
                        playSolAudio.innerHTML = '▶';
                        audioWave.classList.remove('playing');
                        audioTime.innerText = `0:00 / 0:15`;
                    }
                }, 1000);
            } else {
                playSolAudio.innerHTML = '▶';
                audioWave.classList.remove('playing');
                clearInterval(audioTimer);
            }
        });
    }

    // Menú Móvil
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if(mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // Lógica del Accordion FAQ
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentNode;
            
            // Cerrar otros para mantener limpio el UI
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                if(otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            item.classList.toggle('active');
        });
    });

    // Lógica del Future Energy Modal
    const futureBadge = document.getElementById('futureBadge');
    const futureEnergyModal = document.getElementById('futureEnergyModal');
    const closeFutureModal = document.getElementById('closeFutureModal');

    if (futureBadge && futureEnergyModal) {
        futureBadge.addEventListener('click', () => {
            futureEnergyModal.classList.add('active');
        });
    }

    if (closeFutureModal) {
        closeFutureModal.addEventListener('click', () => {
            futureEnergyModal.classList.remove('active');
        });
    }

    // Lógica de "Ver Demostración" y Foto de Sol (Burbuja de Sol)
    const demoBtn = document.getElementById('demoBtn');
    const solImage = document.getElementById('solImage');
    const solSpeechBubble = document.getElementById('solSpeechBubble');
    const imageWrapper = solImage ? solImage.parentElement : null;

    // Pre-cargar voces para asegurar que estén disponibles
    let availableVoices = [];
    if ('speechSynthesis' in window) {
        availableVoices = window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
            availableVoices = window.speechSynthesis.getVoices();
        };
    }

    function triggerSolSpeech() {
        if (!solSpeechBubble) return;
        
        solSpeechBubble.style.opacity = '1';
        solSpeechBubble.style.transform = 'translateY(0)';
        
        // Simular efecto de "hablar" añadiendo un pequeño brillo (glow) a la imagen
        if (imageWrapper) {
            imageWrapper.style.boxShadow = '0 0 25px rgba(255, 183, 3, 0.8)';
            imageWrapper.style.transition = 'box-shadow 0.3s ease';
        }

        // --- SISTEMA DE VOZ IA (Text-to-Speech) ---
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Detener si estaba hablando antes
            
            const currentLang = getCurrentLanguage();
            const textToSpeak = currentLang === 'en' 
                ? "Solar energy is free. Use it. Join our community today. Let me guide you through the process. I am here to answer your questions." 
                : "La energía solar es gratis. Úsala. Únete a nuestra comunidad hoy. Permíteme guiarte en el proceso. Aquí estoy para contestar tus preguntas.";
            
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            
            let selectedVoice;
            if (currentLang === 'en') {
                selectedVoice = availableVoices.find(voice => 
                    voice.lang.startsWith('en') && 
                    /(Samantha|Zira|Female|Google US English)/i.test(voice.name)
                ) || availableVoices.find(voice => voice.lang.startsWith('en'));
            } else {
                selectedVoice = availableVoices.find(voice => 
                    voice.lang.startsWith('es') && 
                    /(Helena|Sabina|Laura|Paulina|Monica|Victoria|Female|Google español)/i.test(voice.name)
                ) || availableVoices.find(voice => voice.lang.startsWith('es'));
            }
            
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            } else {
                utterance.lang = currentLang === 'en' ? 'en-US' : 'es-US';
            }
            
            utterance.rate = 1.05; // Un poco más dinámico
            utterance.pitch = 1.3; // Tono más agudo para asegurar sonido femenino
            
            utterance.onend = () => {
                // Cuando termina de hablar, ocultar todo
                solSpeechBubble.style.opacity = '0';
                solSpeechBubble.style.transform = 'translateY(20px)';
                if (imageWrapper) {
                    imageWrapper.style.boxShadow = 'none';
                }
            };
            
            window.speechSynthesis.speak(utterance);
        } else {
            // Fallback si el navegador no soporta voz (ocultar a los 8 segundos)
            setTimeout(() => {
                solSpeechBubble.style.opacity = '0';
                solSpeechBubble.style.transform = 'translateY(20px)';
                if (imageWrapper) {
                    imageWrapper.style.boxShadow = 'none';
                }
            }, 8000);
        }
    }

    if (demoBtn) {
        demoBtn.addEventListener('click', () => {
            setTimeout(triggerSolSpeech, 800); // Dar tiempo para que haga el scroll
        });
    }

    if (solImage) {
        solImage.addEventListener('click', triggerSolSpeech);
    }

    // Lógica para el botón personalizado de traducción (Sol)
    const customTranslateBtn = document.getElementById('customTranslateBtn');
    if (customTranslateBtn) {
        // Inicializar texto del botón basado en el idioma actual
        setTimeout(() => {
            if (getCurrentLanguage() === 'en') {
                customTranslateBtn.innerHTML = '☀️ Español';
            }
        }, 1000); // Dar tiempo a que Google Translate cargue

        customTranslateBtn.addEventListener('click', () => {
            const isEnglish = getCurrentLanguage() === 'en';
            const select = document.querySelector('.goog-te-combo');
            
            if (select) {
                // Para volver a español (el original), el valor suele ser 'es' o cadena vacía ''
                select.value = isEnglish ? 'es' : 'en';
                
                // Si intentamos poner 'es' pero la opción no existe, usamos '' (restablecer al original)
                if (isEnglish && select.value !== 'es') {
                    select.value = '';
                }
                
                // Despachar evento con "bubbles: true" para que Google lo detecte
                select.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
                
                // Cambiar el texto del botón de inmediato para dar feedback al usuario
                customTranslateBtn.innerHTML = isEnglish ? '☀️ English' : '☀️ Español';
            } else {
                // Si el combo no ha cargado, usamos el método de recarga forzada por cookie (Fallback seguro)
                if (isEnglish) {
                    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + location.hostname;
                } else {
                    document.cookie = "googtrans=/es/en; path=/;";
                    document.cookie = "googtrans=/es/en; path=/; domain=" + location.hostname;
                }
                window.location.reload();
            }
        });
    }
});
