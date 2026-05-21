import { validateRegister } from './validators.js';
import { registerUser } from './auth.js'; // Asegúrate de que apunte a donde tienes tu función de Firebase

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const registerBtn = document.getElementById('registerBtn');
    const registerAlert = document.getElementById('registerAlert');
    const registerSuccess = document.getElementById('registerSuccess');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Ocultar alertas previas antes de validar de nuevo
            registerAlert.classList.add('d-none');
            registerSuccess.classList.add('d-none');

            // Obtener valores de los inputs
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // 1. Validar datos en el Front-End
            const validation = validateRegister(name, email, password, confirmPassword);

            if (!validation.isValid) {
                registerAlert.textContent = validation.message;
                registerAlert.classList.remove('d-none');
                return;
            }

            // 2. Mostrar Spinner y deshabilitar botón (Mapeado a requerimiento de P2)
            const originalBtnContent = registerBtn.innerHTML;
            registerBtn.disabled = true;
            registerBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Registrando...
            `;

            try {
                // 3. Ejecutar registro en Firebase
                console.log("[Auth] Intentando crear cuenta en Firebase...");
                const user = await registerUser(email, password, name); 

                if (user) {
                    // Alerta de Éxito
                    registerSuccess.textContent = "¡Cuenta creada con éxito! Redirigiendo...";
                    registerSuccess.classList.remove('d-none');
                    registerForm.reset();

                    // Pequeña pausa para que el usuario note el éxito antes del salto de página
                    setTimeout(() => {
                        window.location.href = './login.html';
                    }, 2000);
                }
            } catch (error) {
                console.error("[Auth] Error al registrar usuario:", error);
                
                // Manejo de errores comunes de Firebase Auth
                let errorMessage = "Ocurrió un problema al crear la cuenta.";
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = "Este correo electrónico ya está registrado.";
                }

                // Alerta de Error
                registerAlert.textContent = errorMessage;
                registerAlert.classList.remove('d-none');
            } finally {
                // 4. Restaurar estado del botón tras la carga
                registerBtn.disabled = false;
                registerBtn.innerHTML = originalBtnContent;
            }
        });
    }
});