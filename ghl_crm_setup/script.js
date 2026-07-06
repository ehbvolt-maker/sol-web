document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. FAQ ACCORDION ---
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close other items
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- 2. CHAT WIDGET TOGGLE ---
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    const badge = document.querySelector('.notification-badge');

    if (chatToggle && chatWindow) {
        chatToggle.addEventListener('click', () => {
            chatWindow.classList.toggle('active');
            if (badge) badge.style.display = 'none'; // Hide badge on first interaction
            scrollChatToBottom();
        });
    }

    if (closeChat && chatWindow) {
        closeChat.addEventListener('click', (e) => {
            e.stopPropagation();
            chatWindow.classList.remove('active');
        });
    }

    // --- 3. AI CHAT CONVERSATION ---
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    const chatBody = document.getElementById('chatBody');

    function scrollChatToBottom() {
        if (chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }

    function addMessage(text, sender) {
        if (!chatBody) return;
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender === 'user' ? 'user-msg' : 'bot-msg');
        msgDiv.innerHTML = `<p>${text}</p>`;
        chatBody.appendChild(msgDiv);
        scrollChatToBottom();
    }

    // Local Fallback responses in case API fails
    function getEvaLocalResponse(userInput) {
        const input = userInput.toLowerCase();
        if (input.includes('precio') || input.includes('cuesta') || input.includes('costo') || input.includes('valor')) {
            return "Nuestra configuración completa del CRM tiene un costo único de **$450 USD**. Es un solo pago por el diseño de tus embudos, automatizaciones y el Agente AI. Luego, solo debes mantener tu cuenta activa en GoHighLevel (desde $97/mes).";
        }
        if (input.includes('incluye') || input.includes('que trae') || input.includes('que tiene')) {
            return "El servicio incluye: Configuración de tu cuenta oficial de GoHighLevel, un Agente AI de chat 24/7 configurado a medida, embudos de venta atractivos, sitio web profesional y automatizaciones con workflows de correo y SMS. Todo listo en 24 horas.";
        }
        if (input.includes('tiempo') || input.includes('cuando') || input.includes('24 horas') || input.includes('tarda')) {
            return "¡Te lo entregamos en **menos de 24 horas hábiles**! Una vez que realices el pago y rellenes la información técnica básica de tu negocio, nuestro equipo de ingenieros automatiza todo de inmediato.";
        }
        if (input.includes('ghl') || input.includes('gohighlevel') || input.includes('cuenta')) {
            return "GoHighLevel es el software de marketing y ventas líder en el mundo. El pago de $450 es por nuestra consultoría y configuración. La suscripción de la plataforma va por tu cuenta ($97/mes), pero te ayudamos a crearla con un periodo de prueba gratuito.";
        }
        return "¡Excelente pregunta! Nuestro servicio te ahorra semanas de configuración técnica de GoHighLevel. Te dejamos un embudo listo para vender y un Agente de IA entrenado para tu nicho. Te sugiero hacer clic en el botón de **'Solicitar el tuyo'** para llenar el quiz de calificación.";
    }

    async function handleSendChatMessage() {
        if (!chatInput) return;
        const text = chatInput.value.trim();
        if (!text) return;

        // User message
        addMessage(text, 'user');
        chatInput.value = '';

        // Add loading state
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'bot-msg');
        loadingDiv.id = 'chat-loading';
        loadingDiv.innerHTML = `<p><em>Eva está escribiendo...</em></p>`;
        chatBody.appendChild(loadingDiv);
        scrollChatToBottom();

        try {
            const res = await fetch('/api/chat-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            // Remove loading
            const loader = document.getElementById('chat-loading');
            if (loader) loader.remove();

            if (res.ok) {
                const data = await res.json();
                addMessage(data.response, 'bot');
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error('Error fetching chat completions:', error);
            const loader = document.getElementById('chat-loading');
            if (loader) loader.remove();
            
            // Fallback response
            const fallback = getEvaLocalResponse(text);
            addMessage(fallback, 'bot');
        }
    }

    if (sendChatBtn) sendChatBtn.addEventListener('click', handleSendChatMessage);
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSendChatMessage();
        });
    }

    // --- 4. ROI CALCULATOR / SIMULATOR ---
    const hoursSlider = document.getElementById('hoursSlider');
    const hoursValue = document.getElementById('hoursValue');
    const leadValueSlider = document.getElementById('leadValueSlider');
    const leadValueDisplay = document.getElementById('leadValueDisplay');
    
    const timeSavedVal = document.getElementById('timeSavedVal');
    const laborSavedVal = document.getElementById('laborSavedVal');
    const leadsRecoveredVal = document.getElementById('leadsRecoveredVal');

    function updateCalculator() {
        if (!hoursSlider || !leadValueSlider) return;

        const hours = parseInt(hoursSlider.value);
        const leadVal = parseInt(leadValueSlider.value);

        // Update displays
        hoursValue.innerText = `${hours} horas/sem`;
        leadValueDisplay.innerText = `$${leadVal}`;

        // Calculations
        const monthlyHoursSaved = hours * 4;
        const laborSaved = monthlyHoursSaved * 25; // Assume $25/hour labour rate
        
        // Assume they recover leads: roughly 1 lead recovered for every 10 hours saved
        const recoveredLeads = Math.max(1, Math.round(monthlyHoursSaved / 8));
        const estimatedEarnings = recoveredLeads * leadVal;

        // Render values
        if (timeSavedVal) timeSavedVal.innerText = `${monthlyHoursSaved} horas/mes`;
        if (laborSavedVal) laborSavedVal.innerText = `$${laborSaved.toLocaleString()}/mes`;
        if (leadsRecoveredVal) leadsRecoveredVal.innerText = `+$${estimatedEarnings.toLocaleString()}/mes`;
    }

    if (hoursSlider) hoursSlider.addEventListener('input', updateCalculator);
    if (leadValueSlider) leadValueSlider.addEventListener('input', updateCalculator);
    
    // Run calculator once on load
    updateCalculator();

    // --- 5. QUIZ MATCHMAKER MODAL ---
    const quizModal = document.getElementById('quizModal');
    const closeQuiz = document.getElementById('closeQuiz');
    const quizBtns = document.querySelectorAll('.quiz-btn');
    const submitLead = document.getElementById('submitLead');
    const successMsg = document.getElementById('successMsg');
    const whatsappBlock = document.getElementById('whatsappContactBlock');
    const waContactBtn = document.getElementById('waContactBtn');

    // Trigger quiz open buttons
    const triggerButtons = [
        document.getElementById('navRequestBtn'),
        document.getElementById('heroRequestBtn'),
        document.getElementById('calcCtaBtn')
    ];

    let quizData = {
        is_owner: '',
        zipcode: '', // Niche
        bill_over_100: '', // Current Software Budget
        credit_score: '', // Has website?
        roof_type: '', // Core automation desired
        name: '',
        address: '', // Business Name
        email: '',
        phone: ''
    };

    triggerButtons.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (quizModal) {
                    // Reset quiz to step 1
                    document.querySelectorAll('.quiz-step').forEach(step => step.classList.remove('active'));
                    const step1 = document.getElementById('step1');
                    if (step1) step1.classList.add('active');
                    
                    if (successMsg) successMsg.style.display = 'none';
                    if (whatsappBlock) whatsappBlock.style.display = 'none';
                    if (submitLead) submitLead.style.display = 'block';

                    quizModal.classList.add('active');
                }
            });
        }
    });

    if (closeQuiz && quizModal) {
        closeQuiz.addEventListener('click', () => {
            quizModal.classList.remove('active');
        });
    }

    quizBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const currentStep = e.target.closest('.quiz-step');
            const stepId = currentStep.id;
            const selectedVal = e.target.getAttribute('data-val') || e.target.innerText;

            if (stepId === 'step1') quizData.is_owner = selectedVal;
            else if (stepId === 'step2') quizData.zipcode = selectedVal; // niche
            else if (stepId === 'step3') quizData.bill_over_100 = selectedVal; // pays software
            else if (stepId === 'step4') quizData.roof_type = selectedVal; // desired function
            
            // Go to next step
            const nextStepId = e.target.getAttribute('data-next');
            if (nextStepId) {
                currentStep.classList.remove('active');
                const nextStep = document.getElementById(nextStepId);
                if (nextStep) nextStep.classList.add('active');
            }
        });
    });

    if (submitLead) {
        submitLead.addEventListener('click', async () => {
            const name = document.getElementById('leadName').value.trim();
            const business = document.getElementById('leadBusiness').value.trim();
            const email = document.getElementById('leadEmail').value.trim();
            const phone = document.getElementById('leadPhone').value.trim();

            if (!name) {
                alert('Por favor ingresa tu nombre completo.');
                return;
            }
            if (!business) {
                alert('Por favor ingresa el nombre de tu negocio.');
                return;
            }
            if (!email.includes('@')) {
                alert('Por favor ingresa un correo electrónico corporativo válido.');
                return;
            }
            if (!phone) {
                alert('Por favor ingresa tu número de WhatsApp para contactarte.');
                return;
            }

            // Fill final data
            quizData.name = name;
            quizData.address = business; // Save business name to 'address'
            quizData.email = email;
            quizData.phone = phone;
            // Set default website value if not asked
            quizData.credit_score = quizData.credit_score || 'Sí';

            submitLead.style.display = 'none';

            try {
                const response = await fetch('/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(quizData)
                });

                if (response.ok) {
                    successMsg.innerText = '¡Tus datos han sido registrados con éxito! Te contactaremos a la brevedad.';
                    successMsg.style.display = 'block';

                    // Prepare WhatsApp Link
                    const leadMsg = `Hola Eliecer, acabo de calificar en la web para el Setup del CRM GoHighLevel.\n\n` +
                        `• Nombre: ${name}\n` +
                        `• Negocio: ${business}\n` +
                        `• Nicho: ${quizData.zipcode}\n` +
                        `• Email: ${email}\n` +
                        `• Teléfono: ${phone}\n` +
                        `• Dueño de Negocio: ${quizData.is_owner}\n` +
                        `• Desea Automatizar: ${quizData.roof_type}\n\n` +
                        `¿Cuándo podemos coordinar los accesos e iniciar la configuración?`;
                    
                    if (waContactBtn) {
                        waContactBtn.href = `https://wa.me/13058136159?text=${encodeURIComponent(leadMsg)}`;
                        whatsappBlock.style.display = 'block';
                    }
                } else {
                    throw new Error('Error guardando lead en el servidor.');
                }
            } catch (error) {
                console.error('API Error:', error);
                successMsg.innerHTML = '?? El servidor local no está corriendo, pero hemos simulado tu registro con éxito en modo demo.<br><br>Puedes escribirnos directamente por WhatsApp:';
                successMsg.style.display = 'block';
                
                if (waContactBtn) {
                    const demoMsg = `Hola Eliecer, estoy interesado en configurar mi CRM GHL ($450). Mi nombre es ${name} y mi negocio se llama ${business}.`;
                    waContactBtn.href = `https://wa.me/13058136159?text=${encodeURIComponent(demoMsg)}`;
                    whatsappBlock.style.display = 'block';
                }
            }
        });
    }
});
