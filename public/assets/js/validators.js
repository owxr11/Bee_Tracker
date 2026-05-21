export function validateRegister(name, email, password, confirmPassword) {
    if (!name.trim())
        return { isValid: false, message: "El nombre completo es obligatorio." };

    if (name.trim().length < 3)
        return { isValid: false, message: "El nombre debe tener mínimo 3 caracteres." };

    if (!email.trim())
        return { isValid: false, message: "El correo electrónico es obligatorio." };

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return { isValid: false, message: "El correo no tiene un formato válido." };

    
    if (!email.endsWith(".ugto.mx") && !email.endsWith("@ugto.mx")) {
        return { isValid: false, message: "Debes registrarte con un correo institucional de la UG." };
    }

    if (!password)
        return { isValid: false, message: "La contraseña es obligatoria." };

    if (password.length < 6)
        return { isValid: false, message: "La contraseña debe tener mínimo 6 caracteres." };

    if (password !== confirmPassword)
        return { isValid: false, message: "Las contraseñas no coinciden." };

    return { isValid: true, message: null };
}

export function validateLogin(email, password) {
    if (!email.trim())
        return { isValid: false, message: "El correo electrónico es obligatorio." };

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return { isValid: false, message: "El correo no tiene un formato válido." };

    if (!password)
        return { isValid: false, message: "La contraseña es obligatoria." };

    return { isValid: true, message: null };
}