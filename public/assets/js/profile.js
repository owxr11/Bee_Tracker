import { auth, db } from "./firebase.js";
import {
    onAuthStateChanged,
    reauthenticateWithCredential,
    updatePassword,
    updateProfile,
    EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showAlert, hideAlert, getFirebaseErrorMessage } from "./auth.js";
import { showLoader, hideLoader } from "./ui.js";

// Genera iniciales desde el nombre completo
export function getInitials(name) {
    return name
        .trim()
        .split(" ")
        .filter(w => w.length > 0)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join("");
}

// Cargar datos del usuario
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "./login.html";
        return;
    }

    const docSnap = await getDoc(doc(db, "users", user.uid));
    if (docSnap.exists()) {
        const data = docSnap.data();

        document.getElementById("avatarCircle").textContent = getInitials(data.name || user.email);
        document.getElementById("profileName").textContent = data.name || "";
        document.getElementById("profileNameInput").value = data.name || "";
        document.getElementById("profileEmail").value = data.email || user.email;
        document.getElementById("profileRole").textContent = data.role || "estudiante";
    }
});

// EDITAR NOMBRE

function enableEdit() {
    const input = document.getElementById("profileNameInput");
    const btnEdit = document.getElementById("btnEditName");

    input.disabled = false;
    input.focus();
    document.getElementById("saveNameSection").classList.remove("d-none");
    btnEdit.innerHTML = '<i class="bi bi-x-lg fs-5"></i>';
    btnEdit.removeEventListener("click", enableEdit);
    btnEdit.addEventListener("click", cancelEdit);
}

function cancelEdit() {
    const input = document.getElementById("profileNameInput");
    const btnEdit = document.getElementById("btnEditName");

    // Restaurar valor original
    input.value = document.getElementById("profileName").textContent;
    input.disabled = true;
    document.getElementById("saveNameSection").classList.add("d-none");
    btnEdit.innerHTML = '<i class="bi bi-pencil-square fs-5"></i>';
    btnEdit.removeEventListener("click", cancelEdit);
    btnEdit.addEventListener("click", enableEdit);
}

document.getElementById("btnEditName").addEventListener("click", enableEdit);

// Guardar nombre
document.getElementById("btnSaveName").addEventListener("click", async () => {
    hideAlert("profileAlert");

    const name = document.getElementById("profileNameInput").value.trim();

    if (!name) {
        showAlert("profileAlert", "El nombre no puede estar vacío.");
        return;
    }
    if (name.length < 3) {
        showAlert("profileAlert", "El nombre debe tener mínimo 3 caracteres.");
        return;
    }

    const user = auth.currentUser;
    if (!user) return;

    try {
        showLoader("btnSaveName", "Guardando...");

        await updateDoc(doc(db, "users", user.uid), {
            name: name,
            updatedAt: new Date().toISOString()
        });

        await updateProfile(user, { displayName: name });

        // Actualizar UI
        document.getElementById("profileName").textContent = name;
        document.getElementById("avatarCircle").textContent = getInitials(name);

        cancelEdit();
        showAlert("profileSuccess", "Nombre actualizado correctamente.");

    } catch (error) {
        showAlert("profileAlert", getFirebaseErrorMessage(error));
    } finally {
        hideLoader("btnSaveName", '<i class="bi bi-floppy me-2"></i>Guardar nombre');
    }
});

// CAMBIAR CONTRASEÑA 

document.getElementById("btnConfirmPassword").addEventListener("click", async () => {
    hideAlert("modalAlert");

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        showAlert("modalAlert", "Todos los campos son obligatorios.");
        return;
    }
    if (newPassword.length < 6) {
        showAlert("modalAlert", "La nueva contraseña debe tener mínimo 6 caracteres.");
        return;
    }
    if (newPassword !== confirmNewPassword) {
        showAlert("modalAlert", "Las contraseñas nuevas no coinciden.");
        return;
    }
    if (currentPassword === newPassword) {
        showAlert("modalAlert", "La nueva contraseña debe ser diferente a la actual.");
        return;
    }

    const user = auth.currentUser;
    if (!user) return;

    try {
        showLoader("btnConfirmPassword", "Verificando...");

        // Reautenticar con contraseña actual
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Actualizar contraseña
        await updatePassword(user, newPassword);

        // Limpiar campos del modal
        document.getElementById("currentPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmNewPassword").value = "";

        showAlert("modalSuccess", "Contraseña actualizada correctamente.");

    } catch (error) {
        const mensajes = {
            "auth/wrong-password": "La contraseña actual es incorrecta.",
            "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
            "auth/requires-recent-login": "Sesion expirada. Cierra sesion y vuelve a entrar."
        };
        showAlert("modalAlert", mensajes[error.code] || getFirebaseErrorMessage(error));
    } finally {
        hideLoader("btnConfirmPassword", '<i class="bi bi-floppy me-2"></i>Guardar');
    }
});