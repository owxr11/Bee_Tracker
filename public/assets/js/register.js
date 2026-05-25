import { hideAlert, showAlert, registerUser, getFirebaseErrorMessage } from "./auth.js";
import { validateRegister } from "./validators.js";
import { showLoader, hideLoader } from "./ui.js";

const form = document.getElementById("registerForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert("registerAlert");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();


    const validation = validateRegister(name, email, password, confirmPassword);


    if (!validation.isValid) {

        showAlert("registerAlert", validation.message);
        return;
    }

    try {
        showLoader("registerBtn", "Creando cuenta...");
        await registerUser({ name, email, password });
        showAlert("registerSuccess", "Cuenta creada. Revisa tu correo para verificarla.");
        setTimeout(() => {
            window.location.href = "./verify_email.html";
        }, 1500);

    } catch (error) {
        showAlert("registerAlert", getFirebaseErrorMessage(error));
    } finally {
        hideLoader("registerBtn", '<i class="bi bi-person-check me-2"></i>Crear cuenta');
    }
});