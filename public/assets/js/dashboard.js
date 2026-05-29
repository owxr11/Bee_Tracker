import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { logoutUser } from "./auth.js";
//mapa
import { initMap } from "./map.js";
// --- Nuevas importaciones de ubicación ---
import { iniciarTransmisionUbicacion } from "./location.js";
import { escucharChoferesEnTiempoReal } from "./realtime.js";

initMap();

let watchId = null;

// Generar iniciales desde el nombre 
function getInitials(name) {
    return name
        .trim()
        .split(" ")
        .filter(w => w.length > 0)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join("");
}

// Protección de ruta
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
            document.getElementById("sidebarName").textContent = data.name?.split(" ")[0] + " " + (data.name?.split(" ")[1]?.[0] || "") + ".";
            document.getElementById("sidebarRole").textContent = data.role === "estudiante" ? "Alumno" : data.role === "chofer" ? "Chofer" : "Admin";

            // --- VALIDACIÓN DE ROLES ---
            if (data.role === "chofer") {
                console.log("Rol: Chofer. Iniciando transmisión de ubicación...");
                // 1. El chofer ENVIARÁ su ubicación usando el GPS del celular
                iniciarTransmisionUbicacion(user.uid);
                // 2. También debe ESCUCHAR para verse a sí mismo moverse en su propio mapa
                escucharChoferesEnTiempoReal();

            } else if (data.role === "estudiante" || data.role === "admin") {
                console.log(`Rol: ${data.role}. Modo lectura de mapa activo.`);
                // 3. El estudiante y el admin NO transmiten, SOLO ESCUCHAN dónde están los choferes
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

    setTimeout(() => {
        const splash = document.getElementById("splash-screen");
        splash.classList.add("fade-out");
    }, 1000);

});

// Logout
document.getElementById("btnLogout").addEventListener("click", async () => {
    await logoutUser();
    window.location.href = "login.html";
});