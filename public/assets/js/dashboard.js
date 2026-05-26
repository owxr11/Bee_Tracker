import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { logoutUser } from "./auth.js";
//mapa
import { initMap } from "./map.js";

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

    if (!user.emailVerified) {
        window.location.href = "verify_email.html";
        return;
    }

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
                //iniciarTransmisionUbicacion(user.uid);

                //escucharChoferesEnTiempoReal(user.uid);

            } else if (data.role === "estudiante") {
                console.log("Rol: Estudiante. Modo lectura de mapa activo.");
                //escucharChoferesEnTiempoReal(user.uid);
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

