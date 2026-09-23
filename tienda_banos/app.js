/* ==========================================================================
   LuxBath Studio & Craftsmanship - Interactive Application Logic & i18n
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initLanguageToggle();
    initDesigner2D();
    initBuildersSelection();
    initCalculator();
    initGalleryPresets();
    initCatalogFilters();
    initContactForm();
    initScrollEffects();
});

/* Global Toast Notification System */
function showToast(message, icon = 'fa-circle-check') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

/* ==========================================================================
   i18n Translation Dictionary System (ES / EN)
   ========================================================================== */
let currentLang = localStorage.getItem('luxbath_lang') || 'es';

const i18n = {
    es: {
        nav_home: 'Inicio',
        nav_designer: 'Diseñador 2D',
        nav_builders: 'Constructores',
        nav_calc: 'Calculadora',
        nav_gallery: 'Galería',
        nav_showroom: 'Showroom Local',
        nav_contact: 'Contacto',
        hero_badge: 'Arquitectura, Tecnología & Arte en Remodelación',
        hero_title_html: 'Diseña tu Baño Soñado y <span>Calcula Cada Detalle</span>',
        hero_subtitle: 'Visualiza acabados en tiempo real con nuestro configurador 2D, calcula materiales exactos para tu obra, visita nuestro Showroom Local y confía el trabajo a nuestros maestros constructores certificados.',
        stat_designed: 'Baños Diseñados',
        stat_warranty: 'Garantía en Obra',
        stat_craftsmen: 'Artesanos Certificados',
        btn_design_live: 'Diseñar Mi Baño en Vivo',
        btn_view_builders: 'Ver Maestros Constructores',
        trust_waterproof_title: 'Impermeabilización 100%',
        trust_waterproof_desc: 'Sistemas multicapa con garantía hidrostática de 48h.',
        trust_showroom_title: 'Showroom & Almacén Local',
        trust_showroom_desc: 'Exhibiciones físicas e inventario listo para entrega en 24h.',
        trust_2d_title: 'Estudio 2D Interactivo',
        trust_2d_desc: 'Prueba azulejos, grifería y muebles antes de iniciar.',
        trust_craftsmen_title: 'Mano de Obra Certificada',
        trust_craftsmen_desc: 'Elige directamente al equipo artesano de tu proyecto.',
        // Designer section
        designer_tag: 'Estudio Virtual Interactivo',
        designer_title: 'Diseñador de Baños en Tiempo Real',
        designer_subtitle: 'Selecciona combinaciones de porcelanato, grifería, iluminación y mobiliario. La vista previa se actualizará al instante.',
        presets_label: 'Estilos Pre-diseñados:',
        preset_japandi: 'Japandi Spa',
        preset_luxury: 'Luxury Gold & Mármol',
        preset_slate: 'Pizarra Minimalista',
        preset_zellige: 'Verde Esmeralda & Latón',
        visualizer_preview_title: 'Vista Previa en Vivo 2D',
        est_price_label: 'Presupuesto Estimado:',
        btn_sync_calc: 'Pasar a Calculadora',
        btn_export_spec: 'Ver Ficha Técnica',
        controls_title: 'Personaliza tu Baño',
        controls_subtitle: 'Modifica cada acabado y observa los cambios en el lienzo 2D.',
        ctrl_wall: '1. Pared Principal (Azulejos)',
        ctrl_floor: '2. Revestimiento de Piso',
        ctrl_hardware: '3. Acabado de Grifería & Herrajes',
        ctrl_vanity: '4. Mueble de Baño & Lavamanos',
        ctrl_mirror: '5. Espejo & Nicho Retroiluminado',
        ctrl_fixture: '6. Zona de Ducha / Tina',
        // Wall options
        opt_calacatta: 'Mármol Calacatta',
        opt_slate: 'Pizarra Negra',
        opt_wood: 'Madera Roble',
        opt_emerald: 'Verde Zellige',
        opt_microcement: 'Microcemento',
        opt_terrazzo: 'Terrazzo Crema',
        // Floor options
        opt_floor_wood: 'Listón Roble',
        opt_floor_dark: 'Hormigón Oscuro',
        opt_floor_hex: 'Hexagonal Blanco',
        opt_floor_travertine: 'Travertino Cálido',
        // Hardware options
        opt_hw_gold: 'Oro Cepillado',
        opt_hw_black: 'Negro Mate',
        opt_hw_chrome: 'Cromo Pulido',
        opt_hw_rosegold: 'Oro Rosa',
        // Vanity options
        opt_vanity_oak: 'Roble Flotante',
        opt_vanity_blackmarble: 'Mármol Negro',
        opt_vanity_white: 'Minimal Blanco',
        // Mirror options
        opt_mirror_roundled: 'Redondo LED 80cm',
        opt_mirror_goldframe: 'Marco Dorado',
        // Fixture options
        opt_fixture_shower: 'Ducha Walk-in Lluvia',
        opt_fixture_tub: 'Tina Exenta Ovalada',
        // Builders section
        builders_tag: 'El Alma de la Obra',
        builders_title: 'Nuestros Maestros Constructores & Artesanos',
        builders_subtitle: 'La diferencia entre una remodelación común y una obra de arte reside en la maestría técnica de nuestras manos expertas. Conoce al equipo que ejecutará tu proyecto.',
        btn_select_builder: 'Elegir a este Maestro para mi Obra',
        // Calculator section
        calc_tag: 'Cálculo de Insumos & Costos',
        calc_title: 'Calculadora de Materiales y Presupuesto Detallado',
        calc_subtitle: 'Obtén el desglose financiero exacto y la cantidad física de insumos requeridos (cajas de azulejo, pegamento, fragua e impermeabilizante) para tu baño.',
        calc_step1: '1. Superficie de Piso (m²)',
        calc_step2: '2. Nivel de Acabados & Materiales',
        calc_step3: '3. Opciones de Obra & Adicionales',
        tier_standard_title: 'Estándar',
        tier_standard_desc: 'Cerámica de calidad, grifería cromo, accesorios clásicos.',
        tier_premium_title: 'Premium',
        tier_premium_desc: 'Porcelanato gran formato, grifería negro mate, ducha lluvia.',
        tier_luxury_title: 'Luxury Gold',
        tier_luxury_desc: 'Mármol natural, grifería empotrada dorada, tina exenta, luces LED.',
        chk_ducha: 'Ducha a Nivel de Piso (Walk-in) (+$450)',
        chk_tina: 'Tina Exenta de Resina/Acrílico (+$1,200)',
        chk_led: 'Nichos con Tira LED IP67 (+$320)',
        chk_demolicion: 'Demolición & Retiro de Escombros (+$380)',
        tab_budget: 'Presupuesto ($)',
        tab_materials: 'Materiales Físicos',
        btn_request_quote: 'Enviar Proyecto & Agendar Visita',
        // Gallery
        gallery_tag: 'Tendencias & Inspiración',
        gallery_title: 'Galería de Diseños Modernos',
        gallery_subtitle: 'Haz clic en "Cargar en Diseñador" en cualquiera de nuestras obras para pre-cargar ese estilo en el configurador en vivo.',
        btn_load_style: 'Cargar este Estilo en el Diseñador 2D',
        // Catalog
        catalog_tag: 'Showroom & Tienda Local LuxBath',
        catalog_title: 'Catálogo Exclusivo en Tienda Local & Showroom',
        catalog_subtitle: 'Artículos importados con inventario físico en nuestro almacén local. Visita nuestras exhibiciones o solicita despacho express en 24h.',
        btn_view_showroom: 'Ver en Tienda Local',
        // Contact
        contact_tag: 'Atención Personalizada & Showroom',
        contact_title: '¿Listo para Hacer Realidad tu Nuevo Baño?',
        contact_subtitle: 'Visita nuestro showroom local o envíanos tu solicitud. Tus selecciones del Diseñador 2D, la Calculadora de Materiales y tu Maestro Constructor Preferido quedarán registradas automáticamente.',
        form_title: 'Solicitar Evaluación Técnica & Reservar en Showroom',
        form_name: 'Nombre Completo',
        form_email: 'Correo Electrónico',
        form_phone: 'Teléfono / WhatsApp',
        form_builder: 'Equipo de Constructores Elegido',
        form_msg: 'Resumen del Diseño y Proyecto',
        btn_submit_form: 'Enviar Solicitud de Obra',
        // Footer
        footer_desc: 'Innovación tecnológica en diseño de baños, acabados exclusivos en tienda local y la maestría artesanal de nuestros mejores constructores.',
        footer_nav_title: 'Navegación',
        footer_guarantee_title: 'Garantías LuxBath',
        footer_g1: '10 Años en Obra e Impermeabilización',
        footer_g2: 'Cortes a 45° de Precisión Milimétrica',
        footer_g3: 'Inventario Local & Retiro Inmediato',
        footer_rights: '© 2026 LuxBath Studio & Local Showroom. Todos los derechos reservados.'
    },
    en: {
        nav_home: 'Home',
        nav_designer: '2D Designer',
        nav_builders: 'Craftsmen',
        nav_calc: 'Calculator',
        nav_gallery: 'Gallery',
        nav_showroom: 'Local Showroom',
        nav_contact: 'Contact',
        hero_badge: 'Architecture, Technology & Art in Remodeling',
        hero_title_html: 'Design Your Dream Bathroom & <span>Calculate Every Detail</span>',
        hero_subtitle: 'Visualize finishes in real time with our 2D configurator, calculate exact materials for your project, visit our Local Showroom and trust the work to our certified master builders.',
        stat_designed: 'Bathrooms Designed',
        stat_warranty: 'Project Warranty',
        stat_craftsmen: 'Certified Craftsmen',
        btn_design_live: 'Design My Bathroom Live',
        btn_view_builders: 'View Master Builders',
        trust_waterproof_title: '100% Waterproofing',
        trust_waterproof_desc: 'Multi-layer systems with 48h hydrostatic testing warranty.',
        trust_showroom_title: 'Local Showroom & Warehouse',
        trust_showroom_desc: 'Physical displays & inventory ready for 24h delivery.',
        trust_2d_title: 'Interactive 2D Studio',
        trust_2d_desc: 'Test tiles, fixtures, and vanities before breaking ground.',
        trust_craftsmen_title: 'Certified Labor',
        trust_craftsmen_desc: 'Directly select the artisan team for your project.',
        // Designer section
        designer_tag: 'Interactive Virtual Studio',
        designer_title: 'Real-Time Bathroom Designer',
        designer_subtitle: 'Select porcelain, faucets, lighting, and vanity combinations. The preview updates live.',
        presets_label: 'Pre-designed Styles:',
        preset_japandi: 'Japandi Spa',
        preset_luxury: 'Luxury Gold & Marble',
        preset_slate: 'Minimalist Slate',
        preset_zellige: 'Emerald Green & Brass',
        visualizer_preview_title: '2D Live Preview',
        est_price_label: 'Estimated Budget:',
        btn_sync_calc: 'Pass to Calculator',
        btn_export_spec: 'View Tech Sheet',
        controls_title: 'Customize Your Bathroom',
        controls_subtitle: 'Modify each finish and watch the changes live on the 2D canvas.',
        ctrl_wall: '1. Main Wall (Tiles)',
        ctrl_floor: '2. Floor Covering',
        ctrl_hardware: '3. Faucets & Hardware Finish',
        ctrl_vanity: '4. Bathroom Vanity & Sink',
        ctrl_mirror: '5. Mirror & Backlit Niche',
        ctrl_fixture: '6. Shower / Tub Zone',
        // Wall options
        opt_calacatta: 'Calacatta Marble',
        opt_slate: 'Dark Slate',
        opt_wood: 'Oak Wood',
        opt_emerald: 'Emerald Zellige',
        opt_microcement: 'Microcement',
        opt_terrazzo: 'Cream Terrazzo',
        // Floor options
        opt_floor_wood: 'Oak Planks',
        opt_floor_dark: 'Dark Concrete',
        opt_floor_hex: 'White Hexagon',
        opt_floor_travertine: 'Warm Travertine',
        // Hardware options
        opt_hw_gold: 'Brushed Gold',
        opt_hw_black: 'Matte Black',
        opt_hw_chrome: 'Polished Chrome',
        opt_hw_rosegold: 'Rose Gold',
        // Vanity options
        opt_vanity_oak: 'Floating Oak',
        opt_vanity_blackmarble: 'Black Marble',
        opt_vanity_white: 'Minimal White',
        // Mirror options
        opt_mirror_roundled: '80cm Round LED',
        opt_mirror_goldframe: 'Gold Frame',
        // Fixture options
        opt_fixture_shower: 'Walk-in Rain Shower',
        opt_fixture_tub: 'Oval Freestanding Tub',
        // Builders section
        builders_tag: 'The Soul of the Build',
        builders_title: 'Our Master Builders & Craftsmen',
        builders_subtitle: 'The difference between an ordinary remodel and a masterpiece lies in the technical mastery of expert hands. Meet the team that will execute your project.',
        btn_select_builder: 'Choose this Master for my Build',
        // Calculator section
        calc_tag: 'Materials & Cost Calculation',
        calc_title: 'Material Calculator & Detailed Budget',
        calc_subtitle: 'Get the exact financial breakdown and physical material count (tile boxes, adhesive, grout, waterproofing) for your bathroom.',
        calc_step1: '1. Floor Area (m²)',
        calc_step2: '2. Finishes & Material Tier',
        calc_step3: '3. Additional Options & Add-ons',
        tier_standard_title: 'Standard',
        tier_standard_desc: 'Quality ceramics, chrome faucets, classic fixtures.',
        tier_premium_title: 'Premium',
        tier_premium_desc: 'Large-format porcelain, matte black faucets, rain shower.',
        tier_luxury_title: 'Luxury Gold',
        tier_luxury_desc: 'Natural marble, recessed gold faucets, freestanding tub, LED lighting.',
        chk_ducha: 'Walk-in Flush Shower (+$450)',
        chk_tina: 'Resin/Acrylic Freestanding Tub (+$1,200)',
        chk_led: 'IP67 LED Strip Wall Niches (+$320)',
        chk_demolicion: 'Demolition & Debris Removal (+$380)',
        tab_budget: 'Financial Budget ($)',
        tab_materials: 'Physical Materials',
        btn_request_quote: 'Send Project & Schedule Visit',
        // Gallery
        gallery_tag: 'Trends & Inspiration',
        gallery_title: 'Modern Designs Gallery',
        gallery_subtitle: 'Click "Load in Designer" on any project to pre-load that style into the live 2D configurator.',
        btn_load_style: 'Load Style in 2D Designer',
        // Catalog
        catalog_tag: 'LuxBath Local Showroom & Shop',
        catalog_title: 'Exclusive Catalog in Local Showroom',
        catalog_subtitle: 'Imported items with physical stock in our local warehouse. Visit our displays or request 24h express dispatch.',
        btn_view_showroom: 'View in Local Store',
        // Contact
        contact_tag: 'Personalized Support & Showroom',
        contact_title: 'Ready to Bring Your New Bathroom to Life?',
        contact_subtitle: 'Visit our local showroom or submit your request. Your 2D Designer selections, Material Calculator results, and Preferred Builder Team will be automatically registered.',
        form_title: 'Request Technical Assessment & Reserve in Showroom',
        form_name: 'Full Name',
        form_email: 'Email Address',
        form_phone: 'Phone / WhatsApp',
        form_builder: 'Chosen Builder Team',
        form_msg: 'Project & Design Summary',
        btn_submit_form: 'Submit Project Request',
        // Footer
        footer_desc: 'Technological innovation in bathroom design, exclusive local store finishes, and the artisan mastery of our top builders.',
        footer_nav_title: 'Navigation',
        footer_guarantee_title: 'LuxBath Guarantees',
        footer_g1: '10-Year Workmanship & Waterproofing Warranty',
        footer_g2: 'Millimeter Precision 45° Miter Cuts',
        footer_g3: 'Local Inventory & Immediate Pickup',
        footer_rights: '© 2026 LuxBath Studio & Local Showroom. All rights reserved.'
    }
};

function initLanguageToggle() {
    const langBtn = document.getElementById('langToggle');
    const langText = document.getElementById('langText');

    applyLanguage(currentLang, false);

    if (langBtn) {
        langBtn.addEventListener('click', () => {
            currentLang = currentLang === 'es' ? 'en' : 'es';
            localStorage.setItem('luxbath_lang', currentLang);
            applyLanguage(currentLang, true);
        });
    }
}

function applyLanguage(lang, notify = true) {
    const dict = i18n[lang] || i18n.es;
    const langText = document.getElementById('langText');
    if (langText) langText.textContent = lang.toUpperCase();

    // 1. Translate all elements with data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.dataset.i18n;
        if (dict[key]) {
            if (key === 'hero_title_html') {
                el.innerHTML = dict[key];
            } else {
                el.textContent = dict[key];
            }
        }
    });

    // 2. Update HTML lang attribute
    document.documentElement.lang = lang;

    if (notify) {
        const msg = lang === 'es' ? 'Idioma cambiado a Español 🇪🇸' : 'Language switched to English 🇺🇸';
        showToast(msg, 'fa-globe');
    }
}

/* 2. Interactive 2D Bathroom Designer Studio */
const designerState = {
    preset: 'japandi',
    wall: 'calacatta',
    floor: 'wood',
    hardware: 'gold',
    vanity: 'oak',
    mirror: 'roundled',
    fixture: 'shower',
    estimatedCost: 4580
};

const presetConfigs = {
    japandi: {
        name: 'Japandi Spa',
        wall: 'wood',
        floor: 'wood',
        hardware: 'black',
        vanity: 'oak',
        mirror: 'roundled',
        fixture: 'shower'
    },
    luxury: {
        name: 'Luxury Gold & Mármol',
        wall: 'calacatta',
        floor: 'travertine',
        hardware: 'gold',
        vanity: 'white',
        mirror: 'goldframe',
        fixture: 'shower'
    },
    slate: {
        name: 'Pizarra Minimalista',
        wall: 'slate',
        floor: 'dark',
        hardware: 'chrome',
        vanity: 'blackmarble',
        mirror: 'roundled',
        fixture: 'shower'
    },
    zellige: {
        name: 'Verde Esmeralda & Latón',
        wall: 'emerald',
        floor: 'hex',
        hardware: 'gold',
        vanity: 'oak',
        mirror: 'goldframe',
        fixture: 'tub'
    }
};

const colorMap = {
    // Walls
    wall_calacatta: 'url(#gradCalacatta)',
    wall_slate: 'url(#gradSlate)',
    wall_wood: 'url(#gradWood)',
    wall_emerald: 'url(#gradEmerald)',
    wall_microcement: 'url(#gradMicrocement)',
    wall_terrazzo: 'url(#gradTerrazzo)',

    // Floors
    floor_wood: '#8c5828',
    floor_dark: '#1e293b',
    floor_hex: '#f8fafc',
    floor_travertine: '#d4a373',

    // Hardware Gradients
    hardware_gold: 'url(#gradGold)',
    hardware_black: 'url(#gradBlackMatte)',
    hardware_chrome: 'url(#gradChrome)',
    hardware_rosegold: 'url(#gradRoseGold)',

    // Vanity Cabinet
    vanity_oak: 'url(#gradWood)',
    vanity_blackmarble: 'url(#gradBlackMatte)',
    vanity_white: '#ffffff'
};

function initDesigner2D() {
    const presetBtns = document.querySelectorAll('.btn-preset');
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const presetKey = btn.dataset.preset;
            applyPreset(presetKey);
        });
    });

    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const val = btn.dataset.value;

            const parent = btn.parentElement;
            parent.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            designerState[type] = val;
            designerState.preset = 'custom';
            
            const badge = document.getElementById('activePresetBadge');
            if (badge) badge.textContent = currentLang === 'es' ? 'Estilo: Personalizado' : 'Style: Custom';
            
            presetBtns.forEach(b => b.classList.remove('active'));

            updateSvgVisualizer();
        });
    });

    const btnSyncCalc = document.getElementById('btnSyncCalculator');
    if (btnSyncCalc) {
        btnSyncCalc.addEventListener('click', () => {
            const calcSection = document.getElementById('cotizador');
            if (calcSection) {
                calcSection.scrollIntoView({ behavior: 'smooth' });
                showToast(currentLang === 'es' ? 'Configuración cargada en la Calculadora' : 'Settings loaded into Calculator', 'fa-calculator');
            }
        });
    }

    const btnExportSpec = document.getElementById('btnExportSpec');
    if (btnExportSpec) {
        btnExportSpec.addEventListener('click', openSpecModal);
    }

    updateSvgVisualizer();
}

function applyPreset(key) {
    const config = presetConfigs[key];
    if (!config) return;

    Object.assign(designerState, config);
    designerState.preset = key;

    const badge = document.getElementById('activePresetBadge');
    if (badge) badge.textContent = `${currentLang === 'es' ? 'Estilo' : 'Style'}: ${config.name}`;

    ['wall', 'floor', 'hardware', 'vanity', 'mirror', 'fixture'].forEach(type => {
        const val = config[type];
        const group = document.getElementById(`${type}Options`);
        if (group) {
            group.querySelectorAll('.option-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.value === val);
            });
        }
    });

    updateSvgVisualizer();
    showToast(`${currentLang === 'es' ? 'Preset' : 'Preset'} "${config.name}" ${currentLang === 'es' ? 'cargado' : 'loaded'}`, 'fa-wand-magic-sparkles');
}

function updateSvgVisualizer() {
    const svgWall = document.getElementById('svgWall');
    const svgFloor = document.getElementById('svgFloor');
    const svgFaucet = document.getElementById('svgFaucet');
    const svgDrain = document.getElementById('svgDrain');
    const svgHandle1 = document.getElementById('svgHandle1');
    const svgHandle2 = document.getElementById('svgHandle2');
    const svgVanityCabinet = document.getElementById('svgVanityCabinet');
    const svgShowerPipe = document.getElementById('svgShowerPipe');
    const svgShowerHead = document.getElementById('svgShowerHead');
    const svgMirrorShape = document.getElementById('svgMirrorShape');
    const svgMirrorGlow = document.getElementById('svgMirrorGlow');
    const svgTubGroup = document.getElementById('svgTubGroup');
    const svgWaterSpray = document.getElementById('svgWaterSpray');
    const designerEstPrice = document.getElementById('designerEstPrice');

    if (svgWall) svgWall.setAttribute('fill', colorMap[`wall_${designerState.wall}`] || '#e5e7eb');
    if (svgFloor) svgFloor.setAttribute('fill', colorMap[`floor_${designerState.floor}`] || '#8c5828');

    const hwGrad = colorMap[`hardware_${designerState.hardware}`] || 'url(#gradGold)';
    if (svgFaucet) svgFaucet.setAttribute('stroke', hwGrad);
    if (svgDrain) svgDrain.setAttribute('fill', hwGrad);
    if (svgHandle1) svgHandle1.setAttribute('fill', hwGrad);
    if (svgHandle2) svgHandle2.setAttribute('fill', hwGrad);
    if (svgShowerPipe) svgShowerPipe.setAttribute('stroke', hwGrad);
    if (svgShowerHead) svgShowerHead.setAttribute('fill', hwGrad);

    if (svgVanityCabinet) {
        svgVanityCabinet.setAttribute('fill', colorMap[`vanity_${designerState.vanity}`] || 'url(#gradWood)');
    }

    if (svgMirrorShape) {
        if (designerState.mirror === 'goldframe') {
            svgMirrorShape.setAttribute('stroke', 'url(#gradGold)');
            svgMirrorShape.setAttribute('stroke-width', '8');
            if (svgMirrorGlow) svgMirrorGlow.setAttribute('opacity', '0.2');
        } else {
            svgMirrorShape.setAttribute('stroke', 'url(#gradGold)');
            svgMirrorShape.setAttribute('stroke-width', '4');
            if (svgMirrorGlow) svgMirrorGlow.setAttribute('opacity', '0.6');
        }
    }

    if (svgTubGroup && svgShowerPipe && svgWaterSpray) {
        if (designerState.fixture === 'tub') {
            svgTubGroup.setAttribute('display', 'inline');
            svgShowerPipe.setAttribute('opacity', '0.3');
            svgShowerHead.setAttribute('opacity', '0.3');
            svgWaterSpray.setAttribute('opacity', '0');
        } else {
            svgTubGroup.setAttribute('display', 'none');
            svgShowerPipe.setAttribute('opacity', '1');
            svgShowerHead.setAttribute('opacity', '1');
            svgWaterSpray.setAttribute('opacity', '0.6');
        }
    }

    let basePrice = 3800;
    if (designerState.wall === 'calacatta' || designerState.wall === 'emerald') basePrice += 450;
    if (designerState.hardware === 'gold' || designerState.hardware === 'rosegold') basePrice += 280;
    if (designerState.fixture === 'tub') basePrice += 850;
    if (designerState.vanity === 'blackmarble') basePrice += 320;

    designerState.estimatedCost = basePrice;
    if (designerEstPrice) designerEstPrice.textContent = `$${basePrice.toLocaleString()} USD`;
}

/* 3. Builders & Craftsmen Selection */
let selectedBuilder = null;

function initBuildersSelection() {
    const selectBtns = document.querySelectorAll('.btn-select-builder');
    const selectedBuilderName = document.getElementById('selectedBuilderName');
    const txtBuilderSelected = document.getElementById('txtBuilderSelected');

    selectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const builderInfo = btn.dataset.builder;
            selectedBuilder = builderInfo;

            selectBtns.forEach(b => {
                b.classList.remove('btn-active-builder');
                b.innerHTML = `<i class="fa-solid fa-user-plus"></i> ${currentLang === 'es' ? 'Elegir a este Maestro' : 'Choose this Master'}`;
            });

            btn.classList.add('btn-active-builder');
            btn.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${currentLang === 'es' ? 'Equipo Asignado' : 'Team Assigned'}`;

            if (selectedBuilderName) selectedBuilderName.textContent = builderInfo;
            if (txtBuilderSelected) txtBuilderSelected.value = builderInfo;

            showToast(`${currentLang === 'es' ? '¡Has asignado a:' : 'Assigned team:'} ${builderInfo.split('(')[0]}!`, 'fa-user-check');
        });
    });
}

/* 4. Material Breakdown & Budget Calculator */
function initCalculator() {
    const areaSlider = document.getElementById('areaSlider');
    const areaValue = document.getElementById('areaValue');
    const tierCards = document.querySelectorAll('.tier-card');
    
    const chkDucha = document.getElementById('chkDucha');
    const chkTina = document.getElementById('chkTina');
    const chkLED = document.getElementById('chkLED');
    const chkDemolicion = document.getElementById('chkDemolicion');

    const costFontaneria = document.getElementById('costFontaneria');
    const costRevestimiento = document.getElementById('costRevestimiento');
    const costArtefactos = document.getElementById('costArtefactos');
    const costAdicionales = document.getElementById('costAdicionales');
    const costTotal = document.getElementById('costTotal');

    const matWallText = document.getElementById('matWallText');
    const matFloorText = document.getElementById('matFloorText');
    const matGlueText = document.getElementById('matGlueText');
    const matGroutText = document.getElementById('matGroutText');
    const matProofText = document.getElementById('matProofText');
    const matDaysText = document.getElementById('matDaysText');

    let currentTier = 'standard';
    const tierMultipliers = {
        standard: 1.0,
        premium: 1.5,
        luxury: 2.2
    };

    tierCards.forEach(card => {
        card.addEventListener('click', () => {
            tierCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentTier = card.dataset.tier;
            calculateTotal();
        });
    });

    if (areaSlider) {
        areaSlider.addEventListener('input', (e) => {
            areaValue.textContent = `${e.target.value} m²`;
            calculateTotal();
        });
    }

    [chkDucha, chkTina, chkLED, chkDemolicion].forEach(chk => {
        if (chk) chk.addEventListener('change', calculateTotal);
    });

    function calculateTotal() {
        const areaPiso = parseInt(areaSlider.value, 10);
        const mult = tierMultipliers[currentTier];

        const perim = Math.round(4 * Math.sqrt(areaPiso));
        const areaPared = Math.round(perim * 2.4);

        const fontaneria = Math.round(areaPiso * 160 * mult);
        const revestimiento = Math.round((areaPiso + areaPared) * 45 * mult);
        const artefactos = Math.round(190 * areaPiso * mult);

        let adicionales = 0;
        if (chkDucha && chkDucha.checked) adicionales += parseFloat(chkDucha.dataset.price);
        if (chkTina && chkTina.checked) adicionales += parseFloat(chkTina.dataset.price);
        if (chkLED && chkLED.checked) adicionales += parseFloat(chkLED.dataset.price);
        if (chkDemolicion && chkDemolicion.checked) adicionales += parseFloat(chkDemolicion.dataset.price);

        const total = fontaneria + revestimiento + artefactos + adicionales;

        if (costFontaneria) costFontaneria.textContent = `$${fontaneria.toLocaleString()} USD`;
        if (costRevestimiento) costRevestimiento.textContent = `$${revestimiento.toLocaleString()} USD`;
        if (costArtefactos) costArtefactos.textContent = `$${artefactos.toLocaleString()} USD`;
        if (costAdicionales) costAdicionales.textContent = `$${adicionales.toLocaleString()} USD`;
        if (costTotal) costTotal.textContent = `$${total.toLocaleString()} USD`;

        const totalParedConMerma = (areaPared * 1.1).toFixed(1);
        const cajasPared = Math.ceil(totalParedConMerma / 1.44);

        const totalPisoConMerma = (areaPiso * 1.1).toFixed(1);
        const cajasPiso = Math.ceil(totalPisoConMerma / 1.20);

        const sacosPegamento = Math.ceil((areaPiso + areaPared) * 4 / 25);
        const kgFragua = ((areaPiso + areaPared) * 0.25).toFixed(1);
        const m2Membrana = (areaPiso + (perim * 0.5)).toFixed(1);
        const diasObra = Math.ceil(5 + (areaPiso * 0.5));

        if (matWallText) matWallText.textContent = `${totalParedConMerma} m² (${cajasPared} ${currentLang === 'es' ? 'Cajas de 1.44m²' : 'Boxes of 1.44m²'})`;
        if (matFloorText) matFloorText.textContent = `${totalPisoConMerma} m² (${cajasPiso} ${currentLang === 'es' ? 'Cajas de 1.20m²' : 'Boxes of 1.20m²'})`;
        if (matGlueText) matGlueText.textContent = `${sacosPegamento} ${currentLang === 'es' ? 'Sacos de 25kg (C2TE Flexible)' : 'Bags of 25kg (C2TE Flexible)'}`;
        if (matGroutText) matGroutText.textContent = `${kgFragua} kg ${currentLang === 'es' ? 'Fragua Epóxica Antihumedad' : 'Waterproof Epoxy Grout'}`;
        if (matProofText) matProofText.textContent = `${m2Membrana} m² ${currentLang === 'es' ? 'Membrana de Impermeabilización' : 'Waterproofing Membrane'}`;
        if (matDaysText) matDaysText.textContent = `${diasObra} ${currentLang === 'es' ? 'a' : 'to'} ${diasObra + 2} ${currentLang === 'es' ? 'Días Hábiles de Trabajo' : 'Work Days'}`;
    }

    calculateTotal();

    const btnRequestQuote = document.getElementById('btnRequestQuote');
    if (btnRequestQuote) {
        btnRequestQuote.addEventListener('click', () => {
            const contactSec = document.getElementById('contacto');
            if (contactSec) contactSec.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function switchCalcTab(tabName) {
    const tabBudgetBtn = document.getElementById('tabBudgetBtn');
    const tabMaterialsBtn = document.getElementById('tabMaterialsBtn');
    const tabBudget = document.getElementById('tabBudget');
    const tabMaterials = document.getElementById('tabMaterials');

    if (tabName === 'budget') {
        tabBudgetBtn.classList.add('active');
        tabMaterialsBtn.classList.remove('active');
        tabBudget.classList.add('active');
        tabMaterials.classList.remove('active');
    } else {
        tabBudgetBtn.classList.remove('active');
        tabMaterialsBtn.classList.add('active');
        tabBudget.classList.remove('active');
        tabMaterials.classList.add('active');
    }
}

/* 5. Gallery Style Presets Quick Load */
function initGalleryPresets() {
    const loadBtns = document.querySelectorAll('.btn-load-style');
    loadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const presetKey = btn.dataset.preset;
            applyPreset(presetKey);
            
            const designerSec = document.getElementById('disenador');
            if (designerSec) {
                designerSec.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const projFilterBtns = document.querySelectorAll('[data-projfilter]');
    const projCards = document.querySelectorAll('.project-card');

    projFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            projFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.projfilter;
            projCards.forEach(card => {
                if (filter === 'all' || card.dataset.projcat === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

/* 6. Product Catalog Filters */
function initCatalogFilters() {
    const filterBtns = document.querySelectorAll('#catalogo .filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            productCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

/* 7. Product Modal */
function openProductModal(title, price, imgSrc) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalPrice = document.getElementById('modalPrice');
    const modalImg = document.getElementById('modalImg');

    if (modal && modalTitle && modalPrice && modalImg) {
        modalTitle.textContent = title;
        modalPrice.textContent = price;
        modalImg.src = imgSrc;
        modal.classList.add('active');
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.remove('active');
}

const modalCloseBtn = document.getElementById('modalClose');
if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeProductModal);
}

/* 8. Spec Sheet Modal */
function openSpecModal() {
    const modal = document.getElementById('specModal');
    const body = document.getElementById('specModalBody');
    if (!modal || !body) return;

    body.innerHTML = `
        <div class="spec-grid">
            <div class="spec-item"><strong>${currentLang === 'es' ? 'Pared Principal:' : 'Main Wall:'}</strong> <span>${designerState.wall.toUpperCase()}</span></div>
            <div class="spec-item"><strong>${currentLang === 'es' ? 'Revestimiento Piso:' : 'Floor Tile:'}</strong> <span>${designerState.floor.toUpperCase()}</span></div>
            <div class="spec-item"><strong>${currentLang === 'es' ? 'Grifería / Herrajes:' : 'Hardware / Faucets:'}</strong> <span>${designerState.hardware.toUpperCase()}</span></div>
            <div class="spec-item"><strong>${currentLang === 'es' ? 'Mueble Vanity:' : 'Vanity Unit:'}</strong> <span>${designerState.vanity.toUpperCase()}</span></div>
            <div class="spec-item"><strong>${currentLang === 'es' ? 'Espejo / LED:' : 'Mirror / LED:'}</strong> <span>${designerState.mirror.toUpperCase()}</span></div>
            <div class="spec-item"><strong>${currentLang === 'es' ? 'Formato Ducha/Tina:' : 'Shower/Tub Zone:'}</strong> <span>${designerState.fixture.toUpperCase()}</span></div>
            <div class="spec-item spec-highlight"><strong>${currentLang === 'es' ? 'Presupuesto Estimado:' : 'Estimated Budget:'}</strong> <span>$${designerState.estimatedCost.toLocaleString()} USD</span></div>
            <div class="spec-item spec-highlight"><strong>${currentLang === 'es' ? 'Maestro Asignado:' : 'Assigned Builder:'}</strong> <span>${selectedBuilder ? selectedBuilder.split('(')[0] : (currentLang === 'es' ? 'Equipo LuxBath' : 'LuxBath Team')}</span></div>
        </div>
    `;

    modal.classList.add('active');
}

function closeSpecModal() {
    const modal = document.getElementById('specModal');
    if (modal) modal.classList.remove('active');
}

/* 9. Contact Form Submission */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const origText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${currentLang === 'es' ? 'Procesando Solicitud...' : 'Processing Request...'}`;
        submitBtn.disabled = true;

        setTimeout(() => {
            showToast(currentLang === 'es' ? '¡Solicitud enviada con éxito! Un arquitecto de LuxBath se comunicará contigo.' : 'Request sent successfully! A LuxBath architect will contact you.', 'fa-paper-plane');
            contactForm.reset();
            submitBtn.innerHTML = origText;
            submitBtn.disabled = false;
        }, 1200);
    });
}

/* 10. Scroll Effects & Mobile Nav */
function initScrollEffects() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });

    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            if (navMenu.style.display === 'flex') {
                navMenu.style.display = 'none';
            } else {
                navMenu.style.display = 'flex';
                navMenu.style.flexDirection = 'column';
                navMenu.style.position = 'absolute';
                navMenu.style.top = '100%';
                navMenu.style.left = '0';
                navMenu.style.width = '100%';
                navMenu.style.background = 'rgba(11,15,25,0.98)';
                navMenu.style.padding = '20px';
            }
        });
    }
}
