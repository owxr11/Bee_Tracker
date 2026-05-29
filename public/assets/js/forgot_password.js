import { auth } from "./firebase.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { showAlert, hideAlert, getFirebaseErrorMessage } from "./auth.js";
import { validateForgotPassword } from "./validators.js";
import { showLoader, hideLoader } from "./ui.js";

document.getElementById("btnForgot").addEventListener("click", async () => {
    hideAlert("forgotAlert");

    const email = document.getElementById("forgotEmail").value.trim();

    // Validar email
    const validation = validateForgotPassword(email);
    if (!validation.isValid) {
        showAlert("forgotAlert", validation.message);
        return;
    }

    try {
        showLoader("btnForgot", "Enviando...");
        await sendPasswordResetEmail(auth, email);

        // Siempre mostrar éxito aunque el correo no exista
        showAlert("forgotSuccess", "Correo de recuperación enviado correctamente, puede tardar unos minutos se paciente.");
        document.getElementById("forgotEmail").value = "";

    } catch (error) {
        showAlert("forgotAlert", getFirebaseErrorMessage(error));
    } finally {
        hideLoader("btnForgot", '<i class="bi bi-send me-2"></i>Enviar enlace');
    }
});