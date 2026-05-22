import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { logoutUser } from "./auth.js";
//mapa
import { initMap } from "./map.js"; 

initMap();

// Protección de ruta
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const docSnap = await getDoc(doc(db, "users", user.uid));
    if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById("nombreUsuario").textContent = data.name || user.email;
    }
});

// Logout
document.getElementById("btnLogout").addEventListener("click", async () => {
    await logoutUser();
    window.location.href = "login.html";
});

