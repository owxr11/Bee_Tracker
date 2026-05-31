import { rtdb, db } from './firebase.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { updateMarker, moverVista } from './map.js';

// Cache interna para almacenar los nombres de los choferes y no saturar Firestore
const cacheNombres = {};

async function obtenerNombreChofer(uid) {
    if (cacheNombres[uid]) return cacheNombres[uid];
    try {
        const docSnap = await getDoc(doc(db, "users", uid));
        if (docSnap.exists()) {
            const nombre = docSnap.data().name || "Chofer UG";
            cacheNombres[uid] = nombre;
            return nombre;
        }
    } catch (error) {
        console.error("Error al traer el nombre:", error);
    }
    return "Chofer de la Colmena";
}

/* Escucha la rama 'locations' de Realtime Database y actualiza los marcadores en el mapa */
export function escucharChoferesEnTiempoReal() {
    console.log("[Realtime] Conectando radar a Realtime Database...");
    
    const locationsRef = ref(rtdb, 'locations');

    onValue(locationsRef, async (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        const modalContainer = document.getElementById("lista-rutas-activas");
        if (modalContainer) {
            modalContainer.innerHTML = ""; 
        }

        for (const choferKey of Object.keys(data)) {
            const infoChofer = data[choferKey];
            const uidFinal = infoChofer.uid || choferKey;

            if (infoChofer.active && infoChofer.lat && infoChofer.lng) {
                console.log(`[Mapa] Moviendo camión ${uidFinal} a: ${infoChofer.lat}, ${infoChofer.lng}`);
                
                updateMarker(uidFinal, infoChofer.lat, infoChofer.lng);

                if (modalContainer) {
                    const nombreReal = await obtenerNombreChofer(uidFinal);
                    
                    const tarjeta = document.createElement("div");
                    
                    tarjeta.className = "p-3 rounded-3 d-flex flex-column gap-1 border border-secondary border-opacity-25 mb-2 user-select-none transition-base";
                    tarjeta.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
                    tarjeta.style.cursor = "pointer"; // Hace que aparezca la mano al pasar el cursor
                    
                    // Evento de clic para mover la cámara y cerrar el modal
                    tarjeta.addEventListener("click", () => {
                        // Llama a tu función de map.js pasándole las coordenadas del camión
                        moverVista(infoChofer.lat, infoChofer.lng);
                        
                        const modalEl = document.getElementById("modalDetallesRuta");
                        const bootstrapModal = bootstrap.Modal.getInstance(modalEl);
                        if (bootstrapModal) bootstrapModal.hide();
                    });

                    tarjeta.addEventListener("mouseenter", () => tarjeta.style.backgroundColor = "rgba(247, 219, 60, 0.08)");
                    tarjeta.addEventListener("mouseleave", () => tarjeta.style.backgroundColor = "rgba(255, 255, 255, 0.03)");
                    
                    tarjeta.innerHTML = `
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="fw-bold text-ug-gold-bright d-flex align-items-center gap-2">
                                <i class="bi bi-person-badge"></i> ${nombreReal}
                            </span>
                            <span class="badge bg-ug-gold-bright text-dark rounded-pill small fw-bold">
                                <span class="spinner-grow spinner-grow-sm me-1" style="width:8px; height:8px;"></span>En tránsito
                            </span>
                        </div>
                        <div class="small text-white-50 mt-1">
                            <i class="bi bi-geo-alt-fill text-danger me-1"></i>
                            <strong>Ubicación:</strong> ${infoChofer.lat.toFixed(5)}, ${infoChofer.lng.toFixed(5)}
                        </div>
                        <div class="text-end mt-2" style="font-size: 0.65rem; color: rgba(255,255,255,0.3);">
                            Último reporte: ${new Date(infoChofer.updatedAt).toLocaleTimeString()}
                        </div>
                    `;
                    modalContainer.appendChild(tarjeta);
                }
            }
        }
    });
}