import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { logoutUser } from "./auth.js";
import { initMap } from "./map.js";
import { iniciarTransmisionUbicacion } from "./location.js";
import { escucharChoferesEnTiempoReal } from "./realtime.js";

initMap();

let watchId = null;

function getInitials(name) {
    return name
        .trim()
        .split(" ")
        .filter(w => w.length > 0)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join("");
}


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

window.addEventListener("load", () => {
    setTimeout(window.ocultarSplashScreen, 4000);
});

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


//error corregido, aparicion logo-modal responsive
const modalHorarios = document.getElementById("modalHorarios");
const logoPill = document.querySelector(".sidebar > a");
const bottomNav = document.querySelector("ul.nav"); 

if (modalHorarios) {
    modalHorarios.addEventListener("show.bs.modal", () => {
        renderizarHorarios();
        
        if (window.innerWidth <= 768) {
            if (bottomNav) {
                bottomNav.style.transition = "opacity 0.2s, transform 0.2s";
                bottomNav.style.opacity = "0";
                bottomNav.style.transform = "translate(-50%, 20px)";
                bottomNav.style.pointerEvents = "none";
            }
            if (logoPill) {
                logoPill.style.transition = "opacity 0.2s, transform 0.2s";
                logoPill.style.opacity = "0";
                logoPill.style.transform = "translate(-50%, -20px)";
                logoPill.style.pointerEvents = "none";
            }
        }
    });

    modalHorarios.addEventListener("hide.bs.modal", () => {
        if (window.innerWidth <= 768) {
            if (bottomNav) {
                bottomNav.style.opacity = "1";
                bottomNav.style.transform = ""; 
                bottomNav.style.pointerEvents = "auto";
            }
            if (logoPill) {
                logoPill.style.opacity = "1";
                logoPill.style.transform = ""; 
                logoPill.style.pointerEvents = "auto";
            }
        }
    });
}

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

function getMinutes(timeStr) {
    const [h, m] = timeStr.split(":");
    return parseInt(h) * 60 + parseInt(m);
}

function formatTime(time24) {
    let [h, m] = time24.split(":");
    let hours = parseInt(h);
    const suffix = hours >= 12 ? "p.m." : "a.m.";
    hours = hours % 12 || 12;
    return `${hours}:${m} ${suffix}`;
}

function renderizarHorarios() {
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

            if (!isWeekend && !nextFound && timeMins >= currentMinutes) {
                badge.classList.add("next-bus");
                badge.innerHTML = `<span class="live-dot"></span>${formatTime(time24)}`;
                nextFound = true;
            } else {
                badge.textContent = formatTime(time24);
            }

            container.appendChild(badge);
        });

        if (!nextFound && container.children.length > 0) {
            const aviso = document.createElement("p");
            aviso.className = "text-white-50 fst-italic small mt-2";
            aviso.style.gridColumn = "1 / -1";
            aviso.textContent = "No hay más salidas por hoy.";
            container.appendChild(aviso);
        }
    });

    const espContainer = document.getElementById("lista-especiales");
    if (!espContainer) return;
    espContainer.innerHTML = "";

    horarios.especiales.forEach(esp => {
        const row = document.createElement("div");
        row.className = "d-flex justify-content-between align-items-center p-3 rounded-3";
        row.style.backgroundColor = "#2a2b30";
        row.innerHTML = `
            <span class="text-white-50 d-flex align-items-center gap-2">
                <i class="bi bi-geo-alt text-ug-gold-bright"></i>
                ${esp.nombre}
            </span>
            <div class="d-flex gap-2">
                ${esp.horas.map(h => `
                    <span class="badge rounded-pill px-3 py-2 fw-semibold bg-ug-blue-muted text-white"
                          style="font-size:0.8rem;">
                        ${formatTime(h)}
                    </span>
                `).join("")}
            </div>
        `;
        espContainer.appendChild(row);
    });
}


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

            if (data.role === "chofer") {
                console.log("Rol: Chofer. Iniciando transmisión de ubicación...");
                iniciarTransmisionUbicacion(user.uid);
                escucharChoferesEnTiempoReal();
            } else if (data.role === "estudiante" || data.role === "admin") {
                console.log(`Rol: ${data.role}. Modo lectura de mapa activo.`);
                escucharChoferesEnTiempoReal();
            }

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

    window.ocultarSplashScreen();
});


document.getElementById("btnLogout").addEventListener("click", async () => {
    await logoutUser();
    window.location.href = "login.html";
});