// solar_sales_assistants.js - Modulo de Tecnicas Avanzadas de Seguimiento Solar
// DEPARTAMENTO DE CONSULTORIA SOLAR FLORIDA (NET METERING & RENTA SOLAR 2026)
// Telefonos de Contacto: (305) 813-6159 / (305) 784-6363

function buildSolarSalesSystemPrompt({ channel = 'whatsapp', leadName = '', leadAddress = '', todayStr = '' }) {
    const isSMS = channel === 'sms';

    const lengthConstraint = isSMS
        ? 'REGLA SMS (CRITICA): Respuestas ultra-cortas de MAXIMO 1 a 2 oraciones (menos de 160 caracteres). Directo, amigable y con una sola pregunta o llamado a la accion.'
        : 'REGLA DE FORMATO (CRITICA): Respuestas concisas de maximo 1 a 2 parrafos cortos (entre 25 y 50 palabras). Nunca envies textos largos o abrumadores.';

    return [
        '# IDENTIDAD Y ROL',
        'Eres Sol, Consultora Senior del DEPARTAMENTO DE CONSULTORIA SOLAR FLORIDA (Programa de Medicion Neta - Net Metering & Renta Solar Florida 2026).',
        'Tu comunicacion es en espanol para propietarios de Florida: sumamente educada, empatica, profesional, positiva y de alta autoridad tecnica.',
        'No eres una vendedora insistente; actuas como una auditora tecnica que revisa si el techo de la propiedad califica para congelar una cuota fija de energia a $0 costo de inversion inicial frente a los aumentos de tarifas de FPL / Duke Energy.',
        '',
        lengthConstraint,
        '',
        '# TECNICAS DE NEUROVENTAS Y SEGUIMIENTO SOLAR',
        '1. ENCUADRE DE AUDITORIA SATELITAL (REDUCIR DEFENSIVA):',
        '   - Nunca intentes "vender paneles". El enfoque es evaluar el potencial solar del techo y la capacidad de inyeccion del transformador de la cuadra.',
        '   - Referencia que tienes en pantalla la vista satelital de la vivienda ' + (leadAddress ? 'en ' + leadAddress : '') + ' para revisar sombras e inclinacion.',
        '2. MICRO-COMPROMISOS PROGRESIVOS (PASO A PASO):',
        '   - Nunca pidas una reunion de 1 hora de entrada.',
        '   - Valida 3 datos clave en orden conversacional:',
        '     a) Titularidad: Es dueno/a de la propiedad? (Requisito indispensable).',
        '     b) Rango de consumo: Su factura de luz mensual promedio supera los $100 o $150?',
        '     c) Cita de 5 minutos en pantalla o telefonica para mostrar el estudio satelital.',
        '3. CIERRE DE DOBLE ALTERNATIVA:',
        '   - NUNCA preguntes "Cuando puede?".',
        '   - Siempre ofrece 2 opciones concretas: "Le resulta mas comodo hoy a las 5:00 PM o manana a las 10:30 AM?".',
        '4. REGLA ESTRICTA SOBRE EL CREDITO FISCAL:',
        '   - El credito fiscal federal del 30% ya concluyo. Si el cliente pregunta, se 100% honesta:',
        '     "Tiene toda la razon, ese 30% federal ya concluyo. Por eso justamente la oportunidad actual en Florida es la Medicion Neta estatal sin inversion de su bolsillo, para congelar una cuota fija hasta 50% mas economica."',
        '',
        '# MANEJO MAESTRO DE LAS 5 OBJECIONES PRINCIPALES',
        '- OBJECION 1: "Mandamelo por aqui / Mandamelo por WhatsApp o correo":',
        '  "Con muchisimo gusto. Como cada techo tiene dimensiones, sombras e inclinacion diferentes, un folleto estandar no le daria cifras reales. Ya tengo su techo cargado en el software; le muestro su grafica personalizada en 5 minutos de llamada. Si no le conviene, me dice que no y no pasa nada. Le queda mejor hoy a las 5:30 PM o manana en la manana?"',
        '',
        '- OBJECION 2: "No tengo dinero / Es muy caro / No puedo gastar":',
        '  "Tranquilo/a! Justamente el programa se diseno con $0 costo de inversion inicial ($0 Down). No tiene que sacar ni un solo dolar de su bolsillo. Lo que hace es sustituir el pago variable y creciente que hoy le regala a FPL por una cuota fija mucho mas economica. Cuanto esta pagando hoy de luz?"',
        '',
        '- OBJECION 3: "Tengo que hablarlo con mi pareja / esposo / esposa":',
        '  "Totalmente de acuerdo! Es una decision familiar muy importante. Justo por eso la revision de 5 minutos la hacemos a una hora en la que ambos puedan estar presentes para ver los numeros juntos y decidir con calma. A que hora estan ambos libres por la tarde?"',
        '',
        '- OBJECION 4: "Los paneles danan el techo, resisten huracanes o me quitan el seguro?":',
        '  "Para nada. Los sistemas estan certificados para resistir vientos huracanados de Categoria 5 (hasta 160 MPH), con anclajes impermeables patentados, poliza de seguro de $1 millon y garantia total de 25 anos. Le gustaria que le mostremos los certificados de su techo?"',
        '',
        '- OBJECION 5: "Como funciona la Medicion Neta (Net Metering)?":',
        '  "Es muy sencillo: sus paneles generan energia en el dia y el sobrante se acumula en creditos con la compania de luz para la noche. Asi se cancela el recibo variable. Le gustaria ver la simulacion de su casa?"',
        '',
        '# CONTEXTO DEL CLIENTE',
        '- Nombre: ' + (leadName || 'Propietario/a'),
        '- Direccion aproximada: ' + (leadAddress || 'Florida'),
        '- Fecha de referencia hoy: ' + todayStr + ' (usa esta fecha para calcular fechas como "manana", "el lunes", etc.).',
        '- Telefono oficial de oficina: (305) 813-6159'
    ].join('\n');
}

const LEAD_EXTRACTION_SCHEMA = {
    type: 'object',
    properties: {
        name: { type: 'string', description: 'Nombre y apellido del cliente. Vacio si no se menciona.' },
        email: { type: 'string', description: 'Correo electronico del cliente. Vacio si no se menciona.' },
        address: { type: 'string', description: 'Direccion de la propiedad. Vacio si no se menciona.' },
        zipcode: { type: 'string', description: 'Codigo postal de la propiedad. Vacio si no se menciona.' },
        bill_over_100: { type: 'string', enum: ['yes', 'no', ''], description: 'Su factura mensual supera los 100 dolares? yes/no/vacio' },
        credit_score: { type: 'string', enum: ['yes', 'no', ''], description: 'Su credito es superior a 650? yes/no/vacio' },
        roof_type: { type: 'string', description: 'Tipo de techo si fue mencionado (teja, shingle, metal, etc.).' },
        is_owner: { type: 'string', enum: ['yes', 'no', ''], description: 'Es dueno de la casa? yes/no/vacio' },
        appointment_date: { 
            type: 'string', 
            description: 'Fecha y hora en que el cliente acepto o propuso agendar la llamada/reunion, en formato ISO 8601 (YYYY-MM-DDTHH:MM:SS) calculado con base en la fecha de referencia. Vacio si no ha agendado.' 
        }
    },
    required: ['name', 'email', 'address', 'zipcode', 'bill_over_100', 'credit_score', 'roof_type', 'is_owner', 'appointment_date'],
    additionalProperties: false
};

const CADENCE_STAGES = {
    1: {
        name: 'speed_to_lead',
        title: 'Fase 1: Speed-to-Lead & Auditoria Satelital Inicial',
        minHoursAfterPrevious: 0,
        generate: (lead, waLink, blogUrl) => {
            const firstName = getLeadFirstName(lead);
            const address = lead.address || 'su propiedad en Florida';
            return {
                whatsapp: `☀️ *Programa de Medición Neta (Net Metering) Florida 2026*\nHola ${firstName}, le saluda el Departamento Técnico de Evaluación Solar.\n\nHemos recibido correctamente su solicitud para verificar si su vivienda califica para el programa de tarifa eléctrica fija a *$0 costo de inversión inicial*.\n\n📌 *Estado de su caso:*\nTengo en pantalla la vista satelital de su techo en ${address} para calcular su producción solar y ahorro frente a las tarifas de su proveedor eléctrico.\n\n📚 *Guía Educativa Oficial para Propietarios:*\n👉 ${blogUrl}\n\n⏱️ *Para coordinar la revisión de 5 minutos:*\n¿Le resulta más cómodo atender una breve llamada hoy en la tarde o mañana en la mañana?\n\n*(Tip: Puede responder a este mensaje con una foto de su última factura de luz para tener su gráfico exacto listo al momento de hablar).*\n\nAtentamente,\n*Equipo de Consultoría Solar Florida*\n📱 Tel: (305) 813-6159`,
                sms: `Hola ${firstName}, recibimos su solicitud solar en Florida. Evaluamos su techo en ${address} a $0 inicial. Le mostramos en 3 min hoy tarde o manana? Tel: 305-813-6159 . WhatsApp: ${waLink}`,
                messenger: `☀️ Programa de Medición Neta Florida 2026\nHola ${firstName}, un gusto saludarle. Recibimos su solicitud para evaluar su techo a $0 costo inicial.\n\nEstamos analizando la vista satelital de su propiedad en ${address} para calcular cuánto puede congelar de su factura mensual frente a las subidas de su proveedor eléctrico.\n\n📚 Guía educativa para propietarios: ${blogUrl}\n\nUno de nuestros especialistas le llamará en breve para verificar dos datos técnicos. ¿Prefiere recibir la llamada en la mañana o en la tarde?`
            };
        }
    },
    2: {
        name: 'fpl_rate_hike_alert',
        title: 'Fase 2: Alerta de Inflacion y Aumento de Tarifas FPL',
        minHoursAfterPrevious: 20,
        generate: (lead, waLink, blogUrl) => {
            const firstName = getLeadFirstName(lead);
            const address = lead.address || 'su zona';
            return {
                whatsapp: `📈 *Alerta de Tarifas Eléctricas en Florida*\nHola ${firstName}, le saluda nuevamente el Departamento de Consultoría Solar.\n\nEstuve revisando las proyecciones de tarifas eléctricas para ${address}. Con las subidas de los últimos meses, los propietarios con facturas mayores a $150 están perdiendo entre *$1,400 y $2,800 al año* regalándole dinero a la compañía de luz en lugar de congelar una cuota fija a $0 de entrada.\n\nYa tengo listo el cálculo del porcentaje de luz que su propio techo puede generar para dejar su factura neta en cero.\n\n¿Le queda cómodo revisar los números 3 minutos hoy a las 5:00 PM o a las 6:30 PM?`,
                sms: `Hola ${firstName}, FPL subio tarifas. Propietarios en su zona pierden hasta $2,400/ano sin cuota fija a $0 inicial. Revisamos su ahorro en 3 min hoy a las 5pm o 6:30pm? Tel: 305-813-6159 . WhatsApp: ${waLink}`,
                messenger: `Hola ${firstName}, le escribo porque FPL continúa subiendo las tarifas en Florida. Propietarios en su zona están ahorrando hasta 50% congelando una cuota fija sin costo inicial. Ya tengo la simulación de su techo lista: ¿le queda mejor verla hoy a las 5:00 PM o mañana en la mañana?`
            };
        }
    },
    3: {
        name: 'social_proof_neighbor',
        title: 'Fase 3: Prueba Social de Vecino & Cupo de Transformador',
        minHoursAfterPrevious: 44,
        generate: (lead, waLink, blogUrl) => {
            const firstName = getLeadFirstName(lead);
            return {
                whatsapp: `🏡 *Caso de Éxito en su Zona de Florida*\nHola ${firstName}, le comparto un dato importante:\n\nEsta semana habilitamos el sistema de un propietario vecino en Florida que cambió su recibo de luz variable de *$280/mes* por una cuota fija de renta solar de *$125/mes*, con $0 de inversión inicial y garantía de 25 años.\n\n⚠️ *Detalle técnico:* Las compañías eléctricas limitan la cantidad de paneles por transformador de cuadra. Para verificar si su transformador todavía tiene cupo de inyección antes de que se cierre el circuito, ¿sigue siendo usted el titular de la propiedad?`,
                sms: `Hola ${firstName}, un vecino en su zona cambio su luz de $280 a cuota fija de $125 a $0 entrada. Desea verificar si su transformador tiene cupo? Responda SI o llame al 305-813-6159 . WhatsApp: ${waLink}`,
                messenger: `Hola ${firstName}, le comparto que un vecino en su zona sustituyó su factura de $280 por una cuota fija de $125 a $0 inicial. Para confirmar si el transformador de su cuadra aún tiene cupo de inyección para su casa, ¿es usted el dueño registrado de la propiedad?`
            };
        }
    },
    4: {
        name: 'hurricane_battery_resilience',
        title: 'Fase 4: Proteccion contra Apagones y Huracanes (Baterias)',
        minHoursAfterPrevious: 44,
        generate: (lead, waLink, blogUrl) => {
            const firstName = getLeadFirstName(lead);
            const address = lead.address || 'su propiedad';
            return {
                whatsapp: `⚡ *Seguridad Familiar contra Huracanes en Florida*\nHola ${firstName}, una de las mayores preocupaciones de los propietarios en Florida durante las tormentas son los apagones prolongados.\n\nNuestros sistemas pueden incluir respaldo con batería inteligente (como Tesla Powerwall 3 / Enphase), permitiendo que su *aire acondicionado, refrigerador y luces esenciales continúen operando* de forma 100% autónoma aunque el tendido de la calle se caiga por días.\n\nAdemás, las estructuras están certificadas para resistir vientos de hasta *160 MPH (Categoría 5)* con sellado impermeable total.\n\n¿Le interesaría ver cómo quedaría protegido su hogar en ${address}?`,
                sms: `Hola ${firstName}, proteja su casa contra apagones de huracanes con bateria solar. Mantenga su aire y nevera funcionando sin luz de la calle. Le gustaria ver la simulacion? Tel: 305-813-6159 . WhatsApp: ${waLink}`,
                messenger: `Hola ${firstName}, ante la temporada de tormentas en Florida, los sistemas solares con batería mantienen su aire acondicionado y nevera funcionando aunque se caiga la red por días. ¿Le gustaría que le mostremos la configuración de respaldo para su casa?`
            };
        }
    },
    5: {
        name: 'dean_jackson_9_word_anti_ghosting',
        title: 'Fase 5: Tecnica Anti-Ghosting de 9 Palabras (Dean Jackson)',
        minHoursAfterPrevious: 44,
        generate: (lead, waLink, blogUrl) => {
            const firstName = getLeadFirstName(lead);
            return {
                whatsapp: `Hola ${firstName}, ¿todavía le interesa eliminar los aumentos de la factura de luz en su casa a $0 inicial, o ya resolvió?`,
                sms: `Hola ${firstName}, todavia le interesa congelar su factura de luz a $0 inicial, o ya resolvio? Responda SI o llame al 305-813-6159`,
                messenger: `Hola ${firstName}, ¿todavía le interesa eliminar los aumentos de la factura de luz en su casa a $0 inicial, o ya resolvió?`
            };
        }
    },
    6: {
        name: 'break_up_close_file',
        title: 'Fase 6: Retiro de Oferta / Cierre de Expediente Temporal',
        minHoursAfterPrevious: 72,
        generate: (lead, waLink, blogUrl) => {
            const firstName = getLeadFirstName(lead);
            return {
                whatsapp: `Hola ${firstName}, para no saturar su teléfono asumimos que por ahora prefiere mantenerse con la tarifa variable de la compañía de luz y pausaremos la reserva de su estudio satelital.\n\nSi en el futuro decide congelar su cuota con el programa de $0 de inversión inicial, con muchísimo gusto nos puede contactar directamente al *(305) 813-6159*.\n\n¡Le deseamos mucho éxito y bendiciones en su hogar!`,
                sms: `Hola ${firstName}, pausamos la reserva de su estudio solar por inactividad. Si mas adelante desea congelar su tarifa a $0 inicial, marquenos al 305-813-6159. Exitos!`,
                messenger: `Hola ${firstName}, para no importunarle cerraremos temporalmente la reserva de su estudio satelital. Si en el futuro desea congelar su tarifa eléctrica a $0 inicial, quedamos a su entera disposición al (305) 813-6159. ¡Mucho éxito!`
            };
        }
    }
};

function getLeadFirstName(lead) {
    if (!lead || !lead.name) return 'Estimado/a';
    const clean = lead.name.trim();
    if (clean.includes('Lead') || clean.includes('Prospecto') || clean.includes('Usuario') || clean.includes('Cliente')) {
        return 'Estimado/a';
    }
    return clean.split(' ')[0] || 'Estimado/a';
}

module.exports = {
    buildSolarSalesSystemPrompt,
    LEAD_EXTRACTION_SCHEMA,
    CADENCE_STAGES,
    getLeadFirstName
};
