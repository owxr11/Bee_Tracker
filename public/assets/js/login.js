import { validateLogin } from "./validators.js";
import { loginUser, showAlert, hideAlert, setButtonLoading, getFirebaseErrorMessage } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const loginBtn = loginForm?.querySelector("button[type='submit']");
    
    // Crear dinámicamente o buscar un contenedor de alertas arriba del formulario si deseas
    // Por simplicidad, usaremos alertas tipo alert o puedes inyectar un contenedor dinámico.

    loginForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("userEmail").value.trim();
        const password = document.getElementById("userPassword").value;

        // 1. Validar Front-End usando tu módulo validators
        const validation = validateLogin(email, password);
        if (!validation.isValid) {
            alert(validation.message); // Puedes refactorizarlo para usar un contenedor en el HTML si gustas
            return;
        }

        // Guardar HTML original para restaurar el botón de la colmena luego
        const originalHTML = loginBtn.innerHTML;

        try {
            // 2. Activar cargador visual de tu auth.js
            setButtonLoading(loginBtn, true, originalHTML, "Verificando...");

            // 3. Petición asíncrona a Firebase Auth
            await loginUser(email, password);

            // Redirección exitosa al Dashboard de rutas activas
            window.location.href = "./dashboard.html";

        } catch (error) {
            console.error("[Login Error]:", error);
            // Traducir el error usando la función nativa que incluiste en tu auth.js
            alert(getFirebaseErrorMessage(error));
        } finally {
            // 4. Apagar estado de carga
            setButtonLoading(loginBtn, false, originalHTML, "");
        }
    });
});