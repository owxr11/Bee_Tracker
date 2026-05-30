# 🐝 UGPS — BeeTracker
Sistema de rastreo de transporte escolar universitario en tiempo real.
Desarrollado para la Universidad de Guanajuato — DICIS Salamanca.

## ¿Cómo funciona?
Los choferes abren la app en su celular y envían su ubicación en tiempo real.
Los estudiantes la visualizan en un mapa interactivo desde cualquier dispositivo.

## Tecnologías
- HTML, CSS, JavaScript puro (ES Modules)
- Bootstrap 5.3 + Bootstrap Icons
- Leaflet.js + OpenStreetMap
- Firebase Authentication + Firestore

## Roles
| Rol | Cómo accede |
|---|---|
| Estudiante | Registro público, **solo con correo institucional `@ugto.mx`** |
| Chofer | Cuenta creada por el administrador |
| Admin | Cuenta creada directamente en Firebase Console |

> ⚠️ El registro está restringido a correos institucionales de la Universidad de Guanajuato.
> Cualquier intento de registro con un dominio diferente a `@ugto.mx` será rechazado.

## Instalación local
```bash
git clone https://github.com/owxr11/Bee_Tracker
cd Bee_Tracker
```
Abrir `public/login.html` con Live Server en VS Code.

## Despliegue
El proyecto está disponible en:
`https://bee-tracker1.vercel.app`

## Usuario de prueba
| | |
|---|---|
| Correo | `test.email@ugto.mx` |
| Contraseña | `123456` |
| Rol | Estudiante |