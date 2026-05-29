import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { logoutUser } from "./auth.js";
import { initMap } from "./map.js";
import { iniciarTransmisionUbicacion } from "./location.js";
import { escucharChoferesEnTiempoReal } from "./realtime.js";

// ==========================================
// INICIALIZAR MAPA
// ==========================================
initMap();

let watchId = null;

// ==========================================
// ESTILOS DEL MODAL DE HORARIOS
// (Inyectados por JS para no tocar style.css)
// ==========================================
const estilosHorarios = document.createElement("style");
estilosHorarios.textContent = `
    /* Grid de 3 columnas para los horarios */
    #lista-ascenso,
    #lista-descenso {
        display: grid !important;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
    }

    /* Badge base */
    .time-badge {
        background-color: #2a2b30;
        color: #cccccc;
        border-radius: 12px;
        padding: 14px 8px;
        text-align: center;
        font-size: 0.95rem;
        font-weight: 500;
        cursor: default;
        transition: background 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        line-height: 1.2;
    }

    /* Próximo camión — resaltado dorado */
    .time-badge.next-bus {
        background-color: var(--ug-gold-bright, #FFD000);
        color: #1a1b1f;
        font-weight: 800;
        font-size: 1rem;
    }

    /* Punto animado dentro del badge próximo */
    .time-badge.next-bus .live-dot {
        width: 8px;
        height: 8px;
        min-width: 8px;
        background-color: #1a1b1f;
        border-radius: 50%;
        display: inline-block;
        animation: pulse-dot 1.4s infinite;
    }

    @keyframes pulse-dot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50%       { opacity: 0.4; transform: scale(0.7); }
    }

    /* Tabs personalizados — estilo píldora */
    #horariosTab .nav-link {
        background-color: #2a2b30;
        color: #888;
        border: none;
        border-radius: 50px !important;
        padding: 12px 20px;
        font-size: 1rem;
        transition: all 0.2s;
    }

    #horariosTab .nav-link.active {
        background-color: var(--ug-gold-bright, #FFD000) !important;
        color: #1a1b1f !important;
        font-weight: 800;
    }
`;
document.head.appendChild(estilosHorarios);

// ==========================================
// UTILIDADES
// ==========================================
function getInitials(name) {
    return name
        .trim()
        .split(" ")
        .filter(w => w.length > 0)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join("");
}

// ==========================================
// CONTROL DEL SPLASH SCREEN
// ==========================================
let splashOculto = false;

window.ocultarSplashScreen = function () {
    if (splashOculto) return;
    splashOculto = true;

    const splash = document.getElementById("splash-screen");
    if (splash) {
        setTimeout(() => {
            splash.classList.add("fade-out");
            setTimeout(() => splash.remove(), 1000);
        }, 600);
    }
};

// Respaldo: si Firebase tarda demasiado, ocultamos splash a los 4 segundos
window.addEventListener("load", () => {
    setTimeout(window.ocultarSplashScreen, 4000);
});

// ==========================================
// MODAL — RUTAS ACTIVAS
// ==========================================
const linkRuta = document.getElementById("linkRutasActivas");
const modalDetallesEl = document.getElementById("modalDetallesRuta");

if (linkRuta && modalDetallesEl) {
    const bsModalRuta = new bootstrap.Modal(modalDetallesEl);

    linkRuta.addEventListener("click", (e) => {
        e.preventDefault();
        modalDetallesEl.classList.contains("show") ? bsModalRuta.hide() : bsModalRuta.show();
    });

    modalDetallesEl.addEventListener("show.bs.modal", () => linkRuta.classList.add("active"));
    modalDetallesEl.addEventListener("hide.bs.modal", () => linkRuta.classList.remove("active"));
}

// ==========================================
// SISTEMA DE HORARIOS
// ==========================================
const horarios = {
    ascenso: [
        "07:00", "07:10", "07:20", "07:30", "07:45", "08:00", "08:30", "09:00", "09:10",
        "09:20", "09:30", "09:45", "10:00", "10:30", "11:00", "11:10", "11:20", "11:30",
        "12:00", "12:30", "13:00", "13:15", "13:30", "13:40", "13:45", "14:00", "14:20",
        "14:40", "15:00", "15:15", "15:30", "15:40", "16:00"
    ],
    descenso: [
        "08:30", "09:00", "09:30", "09:45", "10:00", "10:30", "11:00", "11:20", "11:40",
        "12:00", "12:20", "12:40", "13:00", "13:25", "13:45", "14:00", "14:20", "14:40",
        "15:10", "15:40", "16:10", "16:20", "16:35", "17:00", "17:25", "17:45", "18:00", "18:15"
    ],
    especiales: [
        { nombre: "Puentes Gemelos",      horas: ["07:10", "07:30"] },
        { nombre: "Central de Autobuses", horas: ["07:35"] },
        { nombre: "Aurrera",              horas: ["09:35"] }
    ]
};

/** Convierte "14:30" a minutos desde medianoche */
function getMinutes(timeStr) {
    const [h, m] = timeStr.split(":");
    return parseInt(h) * 60 + parseInt(m);
}

/** Convierte "14:30" → "2:30 p.m." */
function formatTime(time24) {
    let [h, m] = time24.split(":");
    let hours = parseInt(h);
    const suffix = hours >= 12 ? "p.m." : "a.m.";
    hours = hours % 12 || 12;
    return `${hours}:${m} ${suffix}`;
}

function renderizarHorarios() {
    // Hora actual del dispositivo del usuario
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    ["ascenso", "descenso"].forEach(ruta => {
        const container = document.getElementById(`lista-${ruta}`);
        if (!container) return;
        container.innerHTML = "";

        let nextFound = false;

        horarios[ruta].forEach(time24 => {
            const timeMins = getMinutes(time24);
            const badge = document.createElement("div");
            badge.className = "time-badge";

            // Resaltar el próximo camión según la hora del dispositivo
            if (!isWeekend && !nextFound && timeMins >= currentMinutes) {
                badge.classList.add("next-bus");
                badge.innerHTML = `<span class="live-dot"></span>${formatTime(time24)}`;
                nextFound = true;
            } else {
                badge.textContent = formatTime(time24);
            }

            container.appendChild(badge);
        });

        // Si ya pasaron todos los camiones del día
        if (!nextFound && container.children.length > 0) {
            const aviso = document.createElement("p");
            aviso.className = "text-white-50 fst-italic small mt-2";
            aviso.style.gridColumn = "1 / -1";
            aviso.textContent = "No hay más salidas por hoy.";
            container.appendChild(aviso);
        }
    });

    // Paradas Especiales
    const espContainer = document.getElementById("lista-especiales");
    if (!espContainer) return;
    espContainer.innerHTML = "";

    horarios.especiales.forEach(esp => {
        const row = document.createElement("div");
        row.className = "d-flex justify-content-between align-items-center p-3 rounded-3";
        row.style.backgroundColor = "#2a2b30";
        row.innerHTML = `
            <span class="text-white-50 d-flex align-items-center gap-2">
                <i class="bi bi-geo-alt" style="color: var(--ug-gold-bright);"></i>
                ${esp.nombre}
            </span>
            <div class="d-flex gap-2">
                ${esp.horas.map(h => `
                    <span class="badge rounded-pill px-3 py-2 fw-semibold"
                          style="background-color:#3a4a6b; color:#a8c4f0; font-size:0.8rem;">
                        ${formatTime(h)}
                    </span>
                `).join("")}
            </div>
        `;
        espContainer.appendChild(row);
    });
}

// Renderizar cada vez que se abra el modal (hora siempre actualizada)
const modalHorarios = document.getElementById("modalHorarios");
if (modalHorarios) {
    modalHorarios.addEventListener("show.bs.modal", renderizarHorarios);
}

// ==========================================
// FIREBASE — PROTECCIÓN DE RUTA Y ROLES
// ==========================================
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    /*     if (!user.emailVerified) {
            window.location.href = "verify_email.html";
            return;
        } */

    try {
        const docSnap = await getDoc(doc(db, "users", user.uid));

        if (docSnap.exists()) {
            const data = docSnap.data();

            document.getElementById("avatarCircle").textContent = getInitials(data.name || user.email);
            document.getElementById("sidebarName").textContent =
                data.name?.split(" ")[0] + " " + (data.name?.split(" ")[1]?.[0] || "") + ".";
            document.getElementById("sidebarRole").textContent =
                data.role === "estudiante" ? "Alumno" :
                data.role === "chofer"     ? "Chofer" : "Admin";

            // Lógica por rol
            if (data.role === "chofer") {
                console.log("Rol: Chofer. Iniciando transmisión de ubicación...");
                iniciarTransmisionUbicacion(user.uid);
                escucharChoferesEnTiempoReal();

            } else if (data.role === "estudiante" || data.role === "admin") {
                console.log(`Rol: ${data.role}. Modo lectura de mapa activo.`);
                escucharChoferesEnTiempoReal();
            }

            // Enlace al panel admin (solo admins)
            if (data.role === "admin") {
                const sidebar = document.querySelector(".nav.nav-pills");
                const li = document.createElement("li");
                li.className = "nav-item mt-2";
                li.innerHTML = `
                    <a href="admin.html" class="nav-link d-flex align-items-center p-3 transition-base">
                        <i class="bi bi-shield-lock-fill text-ug-gold-bright text-center"></i>
                        <span class="nav-text ms-3 fs-5 text-ug-gold-bright fw-bold opacity-0 invisible transition-fade">Panel Admin</span>
                    </a>
                `;
                sidebar.appendChild(li);
            }

        } else {
            console.error("El usuario no existe en Firestore.");
        }

    } catch (error) {
        console.error("Error al validar el rol:", error);
    }

    // Ocultar splash cuando Firebase ya respondió
    window.ocultarSplashScreen();
});

// ==========================================
// LOGOUT
// ==========================================
document.getElementById("btnLogout").addEventListener("click", async () => {
    await logoutUser();
    window.location.href = "login.html";
});