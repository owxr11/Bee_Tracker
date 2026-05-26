import { auth, db } from "./firebase.js";
import { collection, getDocs, doc, getDoc, updateDoc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { registerUser, getFirebaseErrorMessage, logoutUser } from "./auth.js";


const formChofer = document.getElementById("formChofer");
const btnCrearChofer = document.getElementById("btnCrearChofer");
const tablaUsuarios = document.getElementById("tablaUsuarios");


function mostrarAlertaAcceso(mensaje, destino) {
    const mainDiv = document.querySelector("main");
    if(mainDiv) mainDiv.classList.add("d-none");

    const alertBox = document.createElement("div");
    alertBox.className = "alert alert-danger shadow-lg d-flex align-items-center position-fixed top-0 start-50 translate-middle-x mt-4 z-3 rounded-4";
    alertBox.style.border = "1px solid #dc3545";
    alertBox.innerHTML = `<i class="bi bi-shield-lock-fill fs-3 me-3 text-danger"></i><div><h6 class="mb-1 fw-bold">Acceso Restringido</h6><p class="mb-0 small">${mensaje}</p></div>`;
    document.body.appendChild(alertBox);

    setTimeout(() => {
        alertBox.style.transition = "opacity 0.4s ease";
        alertBox.style.opacity = "0";
        setTimeout(() => window.location.href = destino, 400); 
    }, 2500);
}

async function cargarUsuariosReales() {
    tablaUsuarios.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-white-50">Cargando...</td></tr>`;
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        tablaUsuarios.innerHTML = "";
        let total = 0, choferes = 0, inactivos = 0;

        querySnapshot.forEach((docSnap) => {
            const user = docSnap.data();
            const uid = docSnap.id;
            total++;
            
            let isActive = user.active !== false;
            if (user.role === 'chofer' && isActive) choferes++;
            if (!isActive) inactivos++;

            let badgeColor = user.role === 'chofer' ? 'bg-secondary' : 
                             user.role === 'admin' ? 'bg-danger' : 'bg-primary';

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="ps-4 fw-medium">${user.name || 'Sin nombre'}</td>
                <td class="text-white">${user.email}</td>
                <td class="text-center"><span class="badge ${badgeColor} text-capitalize">${user.role || 'estudiante'}</span></td>
                <td class="text-center">${isActive ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>'}</td>
                <td class="text-center">
                    <button class="btn btn-sm ${isActive ? 'btn-outline-warning' : 'btn-outline-success'} btn-toggle me-1" data-uid="${uid}" data-status="${isActive}"><i class="bi ${isActive ? 'bi-power' : 'bi-check-circle'}"></i></button>
                    <button class="btn btn-sm btn-outline-primary btn-edit me-1" data-uid="${uid}"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger btn-delete" data-uid="${uid}"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tablaUsuarios.appendChild(tr);
        });

        document.getElementById('kpiTotal').textContent = total;
        document.getElementById('kpiChoferes').textContent = choferes;
        document.getElementById('kpiInactivos').textContent = inactivos;

        //botones
        document.querySelectorAll('.btn-toggle').forEach(btn => btn.addEventListener('click', async (e) => {
            const uid = e.currentTarget.getAttribute('data-uid');
            const status = e.currentTarget.getAttribute('data-status') === 'true';
            await updateDoc(doc(db, "users", uid), { active: !status });
            cargarUsuariosReales();
        }));

        document.querySelectorAll('.btn-delete').forEach(btn => btn.addEventListener('click', async (e) => {
            const uid = e.currentTarget.getAttribute('data-uid');
            if(confirm("¿Eliminar usuario?")) {
                await deleteDoc(doc(db, "users", uid));
                cargarUsuariosReales();
            }
        }));

    } catch (e) { 
        console.error(e); 
    }
}


formChofer.addEventListener("submit", async (e) => {
    e.preventDefault();
    btnCrearChofer.disabled = true;
    try {
        await registerUser({
            name: document.getElementById("choferName").value,
            email: document.getElementById("choferEmail").value,
            password: document.getElementById("choferPassword").value,
            role: "chofer"
        });
        bootstrap.Modal.getInstance(document.getElementById('modalChofer')).hide();
        cargarUsuariosReales();
    } catch (error) { alert("Error: " + getFirebaseErrorMessage(error)); }
    finally { btnCrearChofer.disabled = false; }
});

document.addEventListener('click', async (e) => {
    if (e.target.closest('.btn-edit')) {
        const uid = e.target.closest('.btn-edit').getAttribute('data-uid');
        const userDoc = await getDoc(doc(db, "users", uid));
        const userData = userDoc.data();
        document.getElementById('editUid').value = uid;
        document.getElementById('editName').value = userData.name || '';
        document.getElementById('editEmail').value = userData.email || '';
        new bootstrap.Modal(document.getElementById('modalEditUser')).show();
    }
});

document.getElementById('formEditUser').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await updateDoc(doc(db, "users", document.getElementById('editUid').value), {
            name: document.getElementById('editName').value,
            email: document.getElementById('editEmail').value
        });
        bootstrap.Modal.getInstance(document.getElementById('modalEditUser')).hide();
        cargarUsuariosReales();
    } catch (error) { alert("Error: " + error.message); }
});

document.getElementById("btnLogout").addEventListener("click", async () => {
    await logoutUser();
    window.location.href = "login.html";
});


onAuthStateChanged(auth, async (user) => {
    if (!user) return mostrarAlertaAcceso("Sesión no iniciada.", "login.html");
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists() && userDoc.data().role === 'admin') {
        document.getElementById("adminName").textContent = userDoc.data().name;
        cargarUsuariosReales();
    } else {
        mostrarAlertaAcceso("No tienes privilegios de administrador.", "dashboard.html");
    }
});