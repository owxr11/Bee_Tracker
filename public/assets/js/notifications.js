import { rtdb } from './firebase.js';
import { ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

let usuarioActualInfo = null;

/**
 * Configura los permisos del formulario según el rol del usuario logeado
 * @param {Object} userData - Información del usuario desde Firestore
 */
export function inicializarModuloNotificaciones(userData) {
    usuarioActualInfo = userData;
    const formNotif = document.getElementById("formNuevaNotificacion");

    // Condición: Si es chofer o admin, le quitamos la clase d-none para que pueda escribir
    if (userData && (userData.role === "chofer" || userData.role === "admin")) {
        formNotif?.classList.remove("d-none");
    }

    // Escuchar el envío del formulario
    formNotif?.addEventListener("submit", enviarNotificacion);

    // Iniciar la escucha asíncrona de mensajes en la Realtime Database
    escucharNotificaciones();
}

async function enviarNotificacion(e) {
    e.preventDefault();
    const txtInput = document.getElementById("txtNotificacion");
    const mensaje = txtInput.value.trim();
    if (!mensaje || !usuarioActualInfo) return;

    try {
        const notifRef = ref(rtdb, 'notifications');
        const nuevaNotifRef = push(notifRef); // Genera un ID único en la Realtime

        await set(nuevaNotifRef, {
            autor: usuarioActualInfo.name || "Personal UG",
            rol: usuarioActualInfo.role,
            mensaje: mensaje,
            timestamp: new Date().toISOString()
        });

        txtInput.value = ""; // Limpiar el input
    } catch (error) {
        console.error("[Notificaciones] Error al publicar aviso:", error);
    }
}

function escucharNotificaciones() {
    const notifRef = ref(rtdb, 'notifications');
    const container = document.getElementById("lista-notificaciones");
    const badge = document.getElementById("notifBadge");

    onValue(notifRef, (snapshot) => {
        if (!container) return;
        container.innerHTML = "";

        const data = snapshot.val();
        
        if (!data) {
            container.innerHTML = `<div class="text-center py-3 text-white-50 fst-italic small">No hay avisos publicados hoy.</div>`;
            if (badge) badge.classList.add("d-none");
            return;
        }

        // Convertimos el objeto en un array y lo ordenamos para que el más nuevo salga primero
        const listaOrdenada = Object.keys(data)
            .map(key => data[key])
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Actualizar el contador numérico flotante sobre la campana
        if (badge && listaOrdenada.length > 0) {
            badge.textContent = listaOrdenada.length;
            badge.classList.remove("d-none");
        }

        listaOrdenada.forEach(notif => {
            const item = document.createElement("div");
            item.className = "p-3 rounded-3 border border-secondary border-opacity-25";
            item.style.backgroundColor = "rgba(255, 255, 255, 0.02)";

            const badgeColor = notif.rol === "admin" ? "bg-danger" : "bg-ug-blue-muted text-white";
            const rolLabel = notif.rol === "admin" ? "Admin" : "Chofer";

            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <strong class="text-ug-gold-bright small d-flex align-items-center gap-1">
                        <i class="bi bi-person-circle"></i> ${notif.autor}
                    </strong>
                    <span class="badge ${badgeColor} rounded-pill" style="font-size:0.65rem;">${rolLabel}</span>
                </div>
                <p class="mb-1 small text-white-85 lh-base">${notif.mensaje}</p>
                <div class="text-end" style="font-size: 0.6rem; color: rgba(255,255,255,0.25);">
                    ${new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
            `;
            container.appendChild(item);
        });
    });
}