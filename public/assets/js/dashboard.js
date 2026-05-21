import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { logoutUser } from "./auth.js";

// Protección de ruta
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        // Muestra el nombre o email del usuario
        document.getElementById("nombreUsuario").textContent = user.displayName || user.email;
    }
});

// Logout
document.getElementById("btnLogout").addEventListener("click", async () => {
    await logoutUser();
    window.location.href = "login.html";
});