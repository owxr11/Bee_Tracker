import { validateLogin } from "./validators.js";
import { loginUser, showAlert, hideAlert, setButtonLoading, getFirebaseErrorMessage } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const loginBtn = loginForm?.querySelector("button[type='submit']");


    loginForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("userEmail").value.trim();
        const password = document.getElementById("userPassword").value;


        const validation = validateLogin(email, password);
        if (!validation.isValid) {
            alert(validation.message);
            return;
        }


        const originalHTML = loginBtn.innerHTML;

        try {

            setButtonLoading(loginBtn, true, originalHTML, "Verificando...");


            await loginUser(email, password);


            window.location.href = "./dashboard.html";

        } catch (error) {
            console.error("[Login Error]:", error);

            alert(getFirebaseErrorMessage(error));
        } finally {

            setButtonLoading(loginBtn, false, originalHTML, "");
        }
    });
});