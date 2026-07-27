/* ==========================================================================
   ImpactRaise / Fondify Hub - Interactive Application Engine
   ========================================================================== */

// Initial Seed Data for Campaigns
const INITIAL_CAMPAIGNS = [
    {
        id: "c1",
        title: "Tratamiento Oncológico Infantil y Medicamentos de Especialidad",
        org: "Fundación Niños Con Fe A.C.",
        cat: "salud",
        goal: 150000,
        raised: 118500,
        donors: 342,
        daysLeft: 8,
        desc: "Suministro urgente de tratamientos oncológicos y apoyo nutricional especializado para 25 niños de escasos recursos en atención hospitalaria.",
        image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80",
        verified: true,
        featured: true
    },
    {
        id: "c2",
        title: "Equipamiento de Aulas STEM en Comunitarios Rurales",
        org: "Aula Futuro A.C.",
        cat: "educacion",
        goal: 85000,
        raised: 52000,
        donors: 148,
        daysLeft: 15,
        desc: "Instalación de computadoras puronicses y kits de robótica educativa para 120 estudiantes en escuelas de comunidades vulnerables.",
        image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
        verified: true,
        featured: false
    },
    {
        id: "c3",
        title: "Reforestación Activa del Bosque de Agua",
        org: "Bosques Vivos A.C.",
        cat: "ambiente",
        goal: 200000,
        raised: 174000,
        donors: 612,
        daysLeft: 5,
        desc: "Plantación comunitaria de 15,000 árboles nativos para restaurar acuíferos esenciales y conservar la biodiversidad local.",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
        verified: true,
        featured: false
    },
    {
        id: "c4",
        title: "Santuario y Rescate de Animales en Situación de Calle",
        org: "Huellitas de Amor A.C.",
        cat: "animales",
        goal: 60000,
        raised: 41200,
        donors: 215,
        daysLeft: 12,
        desc: "Atención veterinaria, esterilización gratuita y acondicionamiento de refugio temporal para más de 80 perritos rescatados.",
        image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80",
        verified: true,
        featured: false
    },
    {
        id: "c5",
        title: "Comedor Comunitario Nutritivo para Adultos Mayores",
        org: "Nutriendo Sonrisas A.C.",
        cat: "social",
        goal: 95000,
        raised: 88000,
        donors: 289,
        daysLeft: 3,
        desc: "Provisión mensual de 3,000 raciones calientes de comida de alta calidad nutricional para adultos mayores en desamparo.",
        image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
        verified: true,
        featured: false
    },
    {
        id: "c6",
        title: "Fondo de Emergencia e Insumos por Inundaciones",
        org: "Red de Auxilio Social A.C.",
        cat: "emergencia",
        goal: 300000,
        raised: 245000,
        donors: 890,
        daysLeft: 2,
        desc: "Entrega inmediata de cobijas, agua potable y kits de higiene a familias damnificadas por desbordamiento de ríos.",
        image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80",
        verified: true,
        featured: false
    }
];

// App State Management
let campaigns = [];
let activeCategory = "all";
let currentSearch = "";
let currentSort = "recent";
let activeDonationCampaignId = null;

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    loadCampaigns();
    initEventListeners();
    renderAll();
    if (window.lucide) {
        lucide.createIcons();
    }
});

// Load Campaigns from LocalStorage or Seed Data
function loadCampaigns() {
    const saved = localStorage.getItem("impactraise_campaigns");
    if (saved) {
        try {
            campaigns = JSON.parse(saved);
        } catch (e) {
            campaigns = [...INITIAL_CAMPAIGNS];
        }
    } else {
        campaigns = [...INITIAL_CAMPAIGNS];
        saveCampaigns();
    }
}

function saveCampaigns() {
    localStorage.setItem("impactraise_campaigns", JSON.stringify(campaigns));
}

// Render Functions
function renderAll() {
    renderFeatured();
    renderGrid();
    updateHeaderStats();
}

function updateHeaderStats() {
    const totalRaised = campaigns.reduce((acc, c) => acc + c.raised, 0);
    const statEl = document.getElementById("totalRaisedStat");
    if (statEl) {
        statEl.textContent = `$${totalRaised.toLocaleString()} MXN`;
    }
}

function renderFeatured() {
    const featuredCardContainer = document.getElementById("featuredCampaignCard");
    if (!featuredCardContainer) return;

    const featured = campaigns.find(c => c.featured) || campaigns[0];
    const percent = Math.min(100, Math.round((featured.raised / featured.goal) * 100));

    featuredCardContainer.innerHTML = `
        <img src="${featured.image}" alt="${featured.title}">
        <span class="cat-badge">${getCategoryName(featured.cat)}</span>
        <h3>${featured.title}</h3>
        <p class="org-name"><i data-lucide="check-circle-2"></i> ${featured.org}</p>
        <div class="progress-container">
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${percent}%"></div>
            </div>
            <div class="progress-stats">
                <span class="amount-raised">$${featured.raised.toLocaleString()} / $${featured.goal.toLocaleString()} MXN</span>
                <span class="percent-raised">${percent}%</span>
            </div>
        </div>
        <button class="btn btn-primary btn-block" onclick="openDonateModal('${featured.id}')">
            <i data-lucide="heart"></i> Donar a esta Causa
        </button>
    `;
    if (window.lucide) lucide.createIcons();
}

function renderGrid() {
    const grid = document.getElementById("campaignsGrid");
    if (!grid) return;

    let filtered = campaigns.filter(c => {
        const matchesCat = (activeCategory === "all" || c.cat === activeCategory);
        const matchesSearch = c.title.toLowerCase().includes(currentSearch.toLowerCase()) || 
                              c.org.toLowerCase().includes(currentSearch.toLowerCase()) ||
                              c.desc.toLowerCase().includes(currentSearch.toLowerCase());
        return matchesCat && matchesSearch;
    });

    // Sorting
    if (currentSort === "urgent") {
        filtered.sort((a, b) => (b.raised / b.goal) - (a.raised / a.goal));
    } else if (currentSort === "raised") {
        filtered.sort((a, b) => b.raised - a.raised);
    } else {
        // recent
        filtered.sort((a, b) => a.daysLeft - b.daysLeft);
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 0; color: var(--text-muted);">
                <i data-lucide="search-x" style="width: 50px; height: 50px; opacity: 0.4; margin-bottom: 12px;"></i>
                <h3>No se encontraron causas</h3>
                <p>Intenta con otra palabra clave o selecciona una categoría distinta.</p>
            </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
    }

    grid.innerHTML = filtered.map(c => {
        const percent = Math.min(100, Math.round((c.raised / c.goal) * 100));
        return `
            <div class="campaign-card">
                <div class="card-img-wrapper">
                    <img src="${c.image}" alt="${c.title}">
                    <span class="category-badge-overlay">
                        ${getCategoryIcon(c.cat)} ${getCategoryName(c.cat)}
                    </span>
                </div>
                <div class="card-body">
                    <div class="org-name"><i data-lucide="shield-check" style="width: 14px; color: var(--primary);"></i> ${c.org}</div>
                    <h3 class="campaign-title">${c.title}</h3>
                    <p class="campaign-desc">${c.desc}</p>
                    
                    <div class="progress-container">
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${percent}%"></div>
                        </div>
                        <div class="progress-stats">
                            <span class="amount-raised">$${c.raised.toLocaleString()} MXN</span>
                            <span class="percent-raised">${percent}%</span>
                        </div>
                    </div>

                    <div class="card-footer-meta">
                        <span class="meta-item"><i data-lucide="users" style="width:14px;"></i> ${c.donors} donadores</span>
                        <span class="meta-item"><i data-lucide="clock" style="width:14px;"></i> ${c.daysLeft} días restantes</span>
                    </div>
                    
                    <button class="btn btn-outline btn-block" style="margin-top: 16px;" onclick="openDonateModal('${c.id}')">
                        <i data-lucide="heart" style="color: var(--primary);"></i> Apoyar Causa
                    </button>
                </div>
            </div>
        `;
    }).join("");

    if (window.lucide) lucide.createIcons();
}

// Helpers for Category Names and Icons
function getCategoryName(cat) {
    const map = {
        salud: "Salud y Médica",
        educacion: "Educación",
        ambiente: "Medio Ambiente",
        animales: "Protección Animal",
        social: "Desarrollo Social",
        emergencia: "Emergencias"
    };
    return map[cat] || "General";
}

function getCategoryIcon(cat) {
    const map = {
        salud: '<i data-lucide="activity"></i>',
        educacion: '<i data-lucide="book-open"></i>',
        ambiente: '<i data-lucide="leaf"></i>',
        animales: '<i data-lucide="paw-print"></i>',
        social: '<i data-lucide="users"></i>',
        emergencia: '<i data-lucide="siren"></i>'
    };
    return map[cat] || '<i data-lucide="heart"></i>';
}

// Event Listeners
function initEventListeners() {
    // Category Pills
    const pills = document.getElementById("categoryPills");
    if (pills) {
        pills.addEventListener("click", (e) => {
            const btn = e.target.closest(".pill-btn");
            if (!btn) return;
            document.querySelectorAll(".pill-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeCategory = btn.dataset.cat;
            renderGrid();
        });
    }

    // Search Input
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            currentSearch = e.target.value;
            renderGrid();
        });
    }

    // Sort Select
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            currentSort = e.target.value;
            renderGrid();
        });
    }

    // Donation Amount Preset Buttons
    const amountPresets = document.getElementById("amountPresets");
    const customAmountInput = document.getElementById("customAmountInput");
    if (amountPresets && customAmountInput) {
        amountPresets.addEventListener("click", (e) => {
            const btn = e.target.closest(".amount-btn");
            if (!btn) return;
            document.querySelectorAll(".amount-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            customAmountInput.value = btn.dataset.val;
            updateDonationImpact(btn.dataset.val);
        });

        customAmountInput.addEventListener("input", (e) => {
            document.querySelectorAll(".amount-btn").forEach(b => b.classList.remove("active"));
            updateDonationImpact(e.target.value || 0);
        });
    }

    // Payment Tabs Switcher
    const tabsHeader = document.querySelector(".tabs-header");
    if (tabsHeader) {
        tabsHeader.addEventListener("click", (e) => {
            const tabBtn = e.target.closest(".pay-tab");
            if (!tabBtn) return;
            document.querySelectorAll(".pay-tab").forEach(t => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            tabBtn.classList.add("active");
            const targetContent = document.getElementById(`tab-${tabBtn.dataset.tab}`);
            if (targetContent) targetContent.classList.add("active");
        });
    }

    // Tax Receipt Toggle
    const chkTax = document.getElementById("chkTaxReceipt");
    const taxFields = document.getElementById("taxFields");
    if (chkTax && taxFields) {
        chkTax.addEventListener("change", () => {
            if (chkTax.checked) {
                taxFields.classList.remove("hidden");
            } else {
                taxFields.classList.add("hidden");
            }
        });
    }

    // Open/Close Modals
    document.getElementById("btnOpenCreate")?.addEventListener("click", () => openModal("createModal"));
    document.getElementById("btnCloseCreate")?.addEventListener("click", () => closeModal("createModal"));
    document.getElementById("btnCancelCreate")?.addEventListener("click", () => closeModal("createModal"));
    
    document.getElementById("btnQuickDonate")?.addEventListener("click", () => openDonateModal(campaigns[0]?.id));
    document.getElementById("btnCloseDonate")?.addEventListener("click", () => closeModal("donationModal"));
    document.getElementById("btnCancelDonate")?.addEventListener("click", () => closeModal("donationModal"));
    document.getElementById("btnCloseReceipt")?.addEventListener("click", () => closeModal("receiptModal"));

    // Confirm Donation
    document.getElementById("btnConfirmDonate")?.addEventListener("click", processDonation);

    // Create Campaign Form Submit
    document.getElementById("createCampaignForm")?.addEventListener("submit", handleCreateCampaign);

    // AI Analysis Form Submit
    document.getElementById("aiAnalysisForm")?.addEventListener("submit", handleAIAnalysis);
    
    // Copy SPEI CLABE
    document.getElementById("btnCopyClabe")?.addEventListener("click", () => {
        const clabe = document.getElementById("speiClabe")?.innerText;
        if (clabe) {
            navigator.clipboard.writeText(clabe);
            alert("¡CLABE copiada al portapapeles!");
        }
    });
}

function updateDonationImpact(amount) {
    const val = parseInt(amount, 10) || 0;
    const impactText = document.getElementById("impactText");
    const donateBtnAmount = document.getElementById("donateBtnAmount");
    
    if (donateBtnAmount) donateBtnAmount.textContent = val.toLocaleString();
    if (!impactText) return;

    if (val < 200) {
        impactText.textContent = `Con $${val} MXN aseguras 2 raciones calientes de alimento en albergues comunitarios.`;
    } else if (val < 500) {
        impactText.textContent = `Con $${val} MXN aseguras insumos médicos de primera necesidad para 3 familias.`;
    } else if (val < 1500) {
        impactText.textContent = `Con $${val} MXN financias el kit completo de insumos o beca mensual de 1 beneficiario.`;
    } else {
        impactText.textContent = `Con $${val} MXN co-financias una jornada completa de intervención o infraestructura de alto impacto.`;
    }
}

// Modal Controllers
function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add("active");
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove("active");
}

function openDonateModal(campaignId) {
    const campaign = campaigns.find(c => c.id === campaignId) || campaigns[0];
    if (!campaign) return;

    activeDonationCampaignId = campaign.id;
    document.getElementById("donateModalTitle").textContent = `Donar a: ${campaign.title}`;
    document.getElementById("donateModalSubtitle").textContent = `Organización: ${campaign.org}`;
    openModal("donationModal");
}

// Process Donation Flow
function processDonation() {
    const donorName = document.getElementById("donorName")?.value || "Donador Anónimo";
    const donorComment = document.getElementById("donorComment")?.value || "";
    const amountVal = parseInt(document.getElementById("customAmountInput").value, 10) || 250;
    const campaign = campaigns.find(c => c.id === activeDonationCampaignId);

    if (campaign) {
        campaign.raised += amountVal;
        campaign.donors += 1;
        saveCampaigns();
        renderAll();
    }

    closeModal("donationModal");

    // Build Receipt HTML
    const isTax = document.getElementById("chkTaxReceipt").checked;
    const taxRfc = document.getElementById("taxRfc")?.value || "N/A";
    const receiptId = "IMP-" + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString("es-MX", { year: 'numeric', month: 'long', day: 'numeric' });

    const receiptBox = document.getElementById("receiptBoxContent");
    if (receiptBox) {
        receiptBox.innerHTML = `
            <div class="receipt-row"><span>Folio Transacción:</span> <strong>${receiptId}</strong></div>
            <div class="receipt-row"><span>Fecha:</span> <span>${dateStr}</span></div>
            <div class="receipt-row"><span>Causa Apoyada:</span> <span>${campaign ? campaign.title : 'Causa Social'}</span></div>
            <div class="receipt-row"><span>Organización Receptor:</span> <span>${campaign ? campaign.org : 'ONG Verificada'}</span></div>
            <div class="receipt-row"><span>Estado Fiscal:</span> <span>${isTax ? 'Deducible SAT (' + taxRfc + ')' : 'Donativo Simple'}</span></div>
            <div class="receipt-row"><span>Monto Total Aportado:</span> <span>$${amountVal.toLocaleString()} MXN</span></div>
        `;
    }

    
    // Live Toast Notification Simulation
    showToast(`🎉 ¡${donorName} acaba de donar $${amountVal.toLocaleString()} MXN!`);
    
    openModal("receiptModal");
}

// Handle New Campaign Creation Wizard
function handleCreateCampaign(e) {
    e.preventDefault();
    const title = document.getElementById("newTitle").value;
    const org = document.getElementById("newOrg").value;
    const cat = document.getElementById("newCat").value;
    const goal = parseInt(document.getElementById("newGoal").value, 10);
    const desc = document.getElementById("newDesc").value;
    let image = document.getElementById("newImageUrl").value;

    if (!image) {
        const fallbacks = [
            "https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80"
        ];
        image = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    const newCampaign = {
        id: "c_" + Date.now(),
        title,
        org,
        cat,
        goal,
        raised: 0,
        donors: 0,
        daysLeft: 30,
        desc,
        image,
        verified: true,
        featured: false
    };

    campaigns.unshift(newCampaign);
    saveCampaigns();
    renderAll();
    closeModal("createModal");
    e.target.reset();

    alert("¡Causa publicada exitosamente! Ya se encuentra disponible en la plataforma.");
}

// Handle AI Financial & Fundraising Readiness Engine
function handleAIAnalysis(e) {
    e.preventDefault();
    const budget = parseFloat(document.getElementById("aiBudget").value) || 300000;
    const goal = parseFloat(document.getElementById("aiGoal").value) || 50000;
    const donors = document.getElementById("aiDonors").value;
    const social = document.getElementById("aiSocial").checked;
    const email = document.getElementById("aiEmail").checked;
    const media = document.getElementById("aiMedia").checked;

    // Calculate score
    let score = 50;
    
    // Goal vs Budget ratio check
    const ratio = goal / budget;
    if (ratio <= 0.3) score += 20;
    else if (ratio <= 0.5) score += 10;
    else score -= 10;

    // Donors base
    if (donors === "high") score += 20;
    else if (donors === "medium") score += 10;

    // Channels
    if (social) score += 5;
    if (email) score += 5;
    if (media) score += 10;

    score = Math.min(98, Math.max(35, score));

    const resultsContainer = document.getElementById("aiResults");
    if (!resultsContainer) return;

    let diagnosisText = "";
    if (score >= 80) {
        diagnosisText = "Alta Factibilidad: Tu organización posee la madurez y canales sólidos para alcanzar la meta en menos de 25 días.";
    } else if (score >= 60) {
        diagnosisText = "Factibilidad Moderada: Se recomienda potenciar la estrategia de mailing y establecer alianzas con empresas para match-funding.";
    } else {
        diagnosisText = "Atención Requerida: La meta representa un porcentaje alto del presupuesto. Te sugerimos ajustar el objetivo o incorporar activaciones comunitarias.";
    }

    resultsContainer.innerHTML = `
        <div style="width: 100%;">
            <div class="score-display">
                <div class="score-badge-circle">
                    <span class="score-val">${score}</span>
                    <span class="score-sub">Puntos / 100</span>
                </div>
                <h3 style="color: var(--primary); margin-bottom: 6px;">Diagnóstico Fondify IA</h3>
                <p style="font-size: 0.9rem; color: var(--text-muted);">${diagnosisText}</p>
            </div>

            <div class="ai-recommendations">
                <div class="ai-rec-item">
                    <strong>1. Proyección a 30 Días:</strong> Estimado de recaudación en día 15: <strong>$${Math.round(goal * (score/100) * 0.6).toLocaleString()} MXN</strong>.
                </div>
                <div class="ai-rec-item">
                    <strong>2. Canal Sugerido:</strong> Amplificar donaciones vía WhatsApp & Newsletter con micro-módulos de donación recurrente.
                </div>
                <div class="ai-rec-item">
                    <strong>3. Acción RSE:</strong> Postular esta iniciativa a programas de donación corporativa 1:1 para duplicar meta.
                </div>
            </div>
        </div>
    `;

    if (window.lucide) lucide.createIcons();
}

function showToast(msg) {
    let toast = document.getElementById("liveToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "liveToast";
        toast.style.cssText = "position:fixed;bottom:24px;right:24px;background:var(--primary);color:#fff;padding:14px 24px;border-radius:12px;font-weight:700;box-shadow:0 10px 30px rgba(0,0,0,0.5);z-index:9999;transition:all 0.3s ease;transform:translateY(100px);opacity:0;";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";
    setTimeout(() => {
        toast.style.transform = "translateY(100px)";
        toast.style.opacity = "0";
    }, 4000);
}
