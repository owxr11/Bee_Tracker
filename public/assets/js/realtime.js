import { rtdb } from './firebase.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { updateMarker } from './map.js';

/**
 * Escucha la rama 'locations' de Realtime Database y actualiza los marcadores en el mapa
 */
export function escucharChoferesEnTiempoReal() {
    console.log("[Realtime] Conectando radar a Realtime Database...");
    
    const locationsRef = ref(rtdb, 'locations');

    // onValue escucha los cambios en tiempo real en la Realtime Database
    onValue(locationsRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // Iteramos sobre cada chofer dentro del objeto JSON
        Object.keys(data).forEach((choferKey) => {
            const infoChofer = data[choferKey];
            
            // Usamos la llave del nodo como UID de respaldo por seguridad
            const uidFinal = infoChofer.uid || choferKey;

            if (infoChofer.active && infoChofer.lat && infoChofer.lng) {
                console.log(`[Mapa] Moviendo camión ${uidFinal} a: ${infoChofer.lat}, ${infoChofer.lng}`);
                
                // Mueve físicamente el marcador en Leaflet
                updateMarker(uidFinal, infoChofer.lat, infoChofer.lng);
            }
        });
    });
}