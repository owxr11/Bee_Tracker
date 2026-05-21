export function validateRegister(name, email, password, confirmPassword) {
    if (!name)
        return "El nombre es obligatorio.";

    if (name.length < 3)
        return "El nombre debe tener mínimo 3 caracteres.";

    if (!email)
        return "El correo es obligatorio.";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return "El correo no tiene un formato válido.";

    if (!password)
        return "La contraseña es obligatoria.";

    if (password.length < 6)
        return "La contraseña debe tener mínimo 6 caracteres.";

    if (password !== confirmPassword)
        return "Las contraseñas no coinciden.";

    return null;
}

export function validateLogin(email, password) {
    if (!email)
        return "El correo es obligatorio.";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return "El correo no tiene un formato válido.";

    if (!password)
        return "La contraseña es obligatoria.";

    return null;
}