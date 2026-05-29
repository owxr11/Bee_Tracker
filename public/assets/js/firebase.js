import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAH_NWOfvgLMgmPcpjoyPF079eTP-3o97Y",
    authDomain: "proyectadi.firebaseapp.com",
    projectId: "proyectadi",
    storageBucket: "proyectadi.firebasestorage.app",
    messagingSenderId: "863754262444",
    appId: "1:863754262444:web:e9549d171b6bc002130c09"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);