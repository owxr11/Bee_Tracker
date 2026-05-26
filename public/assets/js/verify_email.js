import { auth } from "./firebase.js";
import {
    onAuthStateChanged,
    sendEmailVerification,
    reload
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { showAlert, hideAlert, logoutUser } from "./auth.js";
import { showLoader, hideLoader } from "./ui.js";

let cooldown = false;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "./login.html";
        return;
    }

    try {
        await reload(user);
        const currentUser = auth.currentUser;

        if (currentUser.emailVerified) {
            window.location.href = "./dashboard.html";
            return;
        }

        document.getElementById("userEmail").textContent = currentUser.email;
    } catch (error) {
        console.error("Error al actualizar usuario en el estado inicial:", error);
    }
});

// Reenviar correo con cooldown de 60 segundos
document.getElementById("btnResend").addEventListener("click", async () => {
    if (cooldown) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
        showLoader("btnResend", "Enviando...");
        await sendEmailVerification(user);
        showAlert("verifySuccess", "Correo reenviado. Revisa tu bandeja de entrada.");

        // Cooldown 60 segundos
        cooldown = true;
        let seconds = 60;
        const interval = setInterval(() => {
            document.getElementById("btnResend").innerHTML =
                `<i class="bi bi-clock me-2"></i>Reenviar en ${seconds}s`;
            seconds--;
            if (seconds < 0) {
                clearInterval(interval);
                cooldown = false;
                hideLoader("btnResend", '<i class="bi bi-send me-2"></i>Reenviar correo');
            }
        }, 1000);

    } catch (error) {
        showAlert("verifyAlert", "Error al reenviar. Intenta más tarde.");
        hideLoader("btnResend", '<i class="bi bi-send me-2"></i>Reenviar correo');
    }
});

// Verificar si ya confirmó
document.getElementById("btnCheck").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
        showLoader("btnCheck", "Verificando...");

        await reload(user);

        const currentUser = auth.currentUser;

        if (currentUser.emailVerified) {
            window.location.href = "./dashboard.html";
        } else {
            showAlert("verifyAlert", "Aún no has verificado tu correo. Revisa tu bandeja de entrada.");
        }
    } catch (error) {
        console.error(error);
        showAlert("verifyAlert", "Error al verificar. Intenta de nuevo.");
    } finally {
        hideLoader("btnCheck", '<i class="bi bi-arrow-clockwise me-2"></i>Ya verifiqué, continuar');
    }
});

// Logout
document.getElementById("btnLogout").addEventListener("click", async () => {
    await logoutUser();
    window.location.href = "./login.html";
});
