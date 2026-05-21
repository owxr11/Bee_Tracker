import { validateRegister } from './validators.js';
import { registerUser } from './auth.js'; 
import { getCurrentUser } from './auth.js';

//logica de redireccion 
getCurrentUser((user) => {
    if (user) {
        window.location.href = 'dashboard.html';
    } else {
        window.location.href = 'login.html';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const registerBtn = document.getElementById('registerBtn');
    const registerAlert = document.getElementById('registerAlert');
    const registerSuccess = document.getElementById('registerSuccess');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

           
            registerAlert.classList.add('d-none');
            registerSuccess.classList.add('d-none');

          
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

    
            const validation = validateRegister(name, email, password, confirmPassword);

            if (!validation.isValid) {
                registerAlert.textContent = validation.message;
                registerAlert.classList.remove('d-none');
                return;
            }

            const originalBtnContent = registerBtn.innerHTML;
            registerBtn.disabled = true;
            registerBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Registrando...
            `;

            try {
                
                console.log("[Auth] Intentando crear cuenta en Firebase...");
                const user = await registerUser(email, password, name); 

                if (user) {
                  
                    registerSuccess.textContent = "¡Cuenta creada con éxito! Redirigiendo...";
                    registerSuccess.classList.remove('d-none');
                    registerForm.reset();

                    
                    setTimeout(() => {
                        window.location.href = './login.html';
                    }, 2000);
                }
            } catch (error) {
                console.error("[Auth] Error al registrar usuario:", error);
                
              
                let errorMessage = "Ocurrió un problema al crear la cuenta.";
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = "Este correo electrónico ya está registrado.";
                }

               
                registerAlert.textContent = errorMessage;
                registerAlert.classList.remove('d-none');
            } finally {
               
                registerBtn.disabled = false;
                registerBtn.innerHTML = originalBtnContent;
            }
        });
    }
});