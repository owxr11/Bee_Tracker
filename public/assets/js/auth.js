// js/auth.js
import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// 1. Registrar usuario y crear su documento en Firestore
export async function registerUser(email, password, name) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Guardar el documento en la colección 'users'
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name,
            email: email,
            role: "client",
            createdAt: new Date().toISOString(),
            active: true
        });

        console.log("Usuario registrado con éxito:", user.uid);
        return user;
    } catch (error) {
        console.error("Error en registro:", error.code, error.message);
        throw error;
    }
}

// 2. Iniciar Sesión
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

// 3. Cerrar Sesión
export async function logoutUser() {
    try {
        await signOut(auth);
        console.log("Sesión cerrada");
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
}

// 4. Observador del estado del usuario (Saber si hay alguien logueado)
export function getCurrentUser(callback) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            callback(user);
        } else {
            callback(null);
        }
    });
}