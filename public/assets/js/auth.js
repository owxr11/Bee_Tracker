import { auth, db } from './firebase.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


export async function registerUser({ name, email, password, role = "client" }) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name,
            email: email,
            role: role,
            createdAt: new Date().toISOString(),
            active: true
        });

        return user;
    } catch (error) {
        throw error;
    }
}

export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Sesión iniciada:", userCredential.user.email);
        return userCredential.user;
    } catch (error) {
        console.error("Error en login:", error.code, error.message);
        throw error;
    }
}

export async function logoutUser() {
    try {
        await signOut(auth);
        console.log("Sesión cerrada");
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
}

export function getCurrentUser(callback) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            callback(user);
        } else {
            callback(null);
        }
    });
}

export function showAlert(id, message) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.classList.remove("d-none");
}


export function hideAlert(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("d-none");
    el.textContent = "";
}

export function setButtonLoading(btn, isLoading, defaultHTML, loadingText) {
    if (!btn) return;
    btn.disabled = isLoading;
    btn.innerHTML = isLoading
        ? `<span class="spinner-border spinner-border-sm me-2"></span>${loadingText}`
        : defaultHTML;
}

export function getFirebaseErrorMessage(error) {
    const mensajes = {
        "auth/email-already-in-use": "Este correo ya está registrado.",
        "auth/invalid-email": "El correo no tiene un formato válido.",
        "auth/weak-password": "La contraseña debe tener mínimo 6 caracteres.",
        "auth/user-not-found": "No existe una cuenta con este correo.",
        "auth/wrong-password": "Contraseña incorrecta.",
        "auth/too-many-requests": "Demasiados intentos. Intenta más tarde."
    };
    return mensajes[error.code] || "Ocurrió un error. Intenta de nuevo.";
}