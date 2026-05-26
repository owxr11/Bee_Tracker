// Importamos 'rtdb' en lugar del Firestore clásico
import { rtdb } from './firebase.js';
import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

/**
 * Pide permisos de GPS y transmite la ubicación del chofer a Realtime Database
 * @param {string} uid - El ID del usuario (Chofer)
 */
export function iniciarTransmisionUbicacion(uid) {
    if (!navigator.geolocation) {
        alert("Tu navegador o dispositivo no soporta geolocalización.");
        return;
    }

    console.log("[GPS] Solicitando permisos para Realtime Database...");

    const options = {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
    };

    navigator.geolocation.watchPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            try {
                // Guardamos en el nodo 'locations/ID_DEL_CHOFER' de Realtime Database
                await set(ref(rtdb, 'locations/' + uid), {
                    uid: uid,
                    lat: lat,
                    lng: lng,
                    updatedAt: new Date().toISOString(),
                    active: true
                });
                
                console.log(`[RTDB] Coordenadas enviadas a Realtime Database: ${lat}, ${lng}`);
            } catch (error) {
                console.error("[RTDB] Error al transmitir a Realtime Database:", error);
            }
        },
        (error) => {
            console.error("[GPS] Error de lectura:", error.message);
            if (error.code === 1) {
                alert("⚠️ Para transmitir la ruta, debes permitir el acceso a tu ubicación.");
            }
        },
        options
    );
}