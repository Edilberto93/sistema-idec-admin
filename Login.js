// ===============================================================
// CONFIGURACIÓN CENTRALIZADA DE LA API EN LA NUBE (AZURE)
// ===============================================================
const API_BASE_URL = "https://api-idec-sacpuy-gwdhcfafaec5c9g8.eastus-01.azurewebsites.net/api";

console.log("Módulo de autenticación (login.js) cargado correctamente ✅");

// Variables globales para la sesión temporal del 2FA
let usuarioIDTemporal = null;
let nombreUsuarioTemporal = null;

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const authCodeSection = document.getElementById("authCodeSection");
    const btnVerificarCodigo = document.getElementById("btnVerificarCodigo");

    // ===============================================================
    // FLRE 1: LOGIN PRINCIPAL (VALIDAR USUARIO Y CONTRASEÑA)
    // ===============================================================
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const nombreUsuarioInput = document.getElementById("nombreUsuario");
            const contrasenaInput = document.getElementById("contrasena");

            if (!nombreUsuarioInput || !contrasenaInput) {
                Swal.fire("Error Interno", "Los campos del formulario no fueron detectados en el HTML.", "error");
                return;
            }

            const nombreUsuario = nombreUsuarioInput.value.trim();
            const contrasena = contrasenaInput.value.trim();

            if (!nombreUsuario || !contrasena) {
                Swal.fire("Atención", "Debe ingresar su usuario y contraseña obligatoriamente.", "warning");
                return;
            }

            // Alerta visual de espera para la comunicación con Azure
            Swal.fire({
                title: 'Verificando credenciales...',
                text: 'Conectando con el servidor de seguridad de Azure SQL...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            try {
                // Petición POST al endpoint de autenticación
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        NombreUsuario: nombreUsuario,
                        Contrasena: contrasena
                    })
                });

                Swal.close(); // Cerrar indicador de carga

                if (response.ok) {
                    const data = await response.json();

                    // Guardamos temporalmente los datos para el paso del 2FA
                    usuarioIDTemporal = data.UsuarioID || data.usuarioID;
                    nombreUsuarioTemporal = nombreUsuario;

                    // Guardamos de una vez el nombre completo para el uso en reportes PDF
                    const nombreMostrar = data.NombreCompleto || data.nombreCompleto || nombreUsuario;
                    localStorage.setItem("usuarioNombre", nombreMostrar);

                    // Transición estética en el HTML (Ocultar Login / Mostrar Código)
                    loginForm.classList.add("d-none");
                    if (authCodeSection) {
                        authCodeSection.classList.remove("d-none");
                    }

                    Swal.fire({
                        icon: 'success',
                        title: 'Acceso inicial autorizado',
                        text: 'Se ha enviado un código de verificación. Por favor verifique su bandeja o celular.',
                        timer: 3000,
                        showConfirmButton: false
                    });

                } else {
                    // Manejo seguro del error si el servidor no devuelve JSON
                    const errorText = await response.text();
                    let mensajeError = "Usuario o contraseña incorrectos.";
                    try {
                        const errorJson = JSON.parse(errorText);
                        mensajeError = errorJson.mensaje || errorJson.Message || mensajeError;
                    } catch (e) {
                        if (errorText) mensajeError = errorText;
                    }

                    Swal.fire("Error de Autenticación", mensajeError, "error");
                }

            } catch (error) {
                console.error("Error crítico en la comunicación de login:", error);
                Swal.fire("Fallo de Red", "No se pudo establecer conexión remota con el módulo de seguridad en Azure.", "error");
            }
        });
    }

    // ===============================================================
    // FLUJO 2: VERIFICACIÓN DEL SEGUNDO FACTOR (CÓDIGO DE 6 DÍGITOS)
    // ===============================================================
    if (btnVerificarCodigo) {
        btnVerificarCodigo.addEventListener("click", async function () {
            const codigoInput = document.getElementById("codigo");
            if (!codigoInput) return;

            const codigo = codigoInput.value.trim();

            if (!codigo || codigo.length < 6) {
                Swal.fire("Código Requerido", "Por favor, ingrese el código de verificación completo (6 dígitos).", "warning");
                return;
            }

            Swal.fire({
                title: 'Validando código de seguridad...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            try {
                // Endpoint para validar el token asignado al Usuario ID
                const response = await fetch(`${API_BASE_URL}/codigos/verificar/${usuarioIDTemporal}/${codigo}`, {
                    method: "GET", // Cambia a POST si tu endpoint así lo requiere en el backend
                    headers: { "Accept": "application/json" }
                });

                Swal.close();

                if (!response.ok) {
                    throw new Error("El servidor de seguridad rechazó la solicitud o el ID es inexistente.");
                }

                const resultado = await response.json();

                // Validación estricta del resultado proveniente de Azure SQL
                if (resultado.Valido === 1 || resultado.Valido === true) {
                    
                    Swal.fire({
                        title: '¡Verificación Exitosa!',
                        text: 'Identidad confirmada. Redireccionando al panel administrativo...',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    // Establecemos el token seguro que tu archivo 'html.txt' (menú) va a validar al entrar
                    localStorage.setItem("token", "autenticado");
                    localStorage.setItem("usuarioID", usuarioIDTemporal);

                    // Redirección automática hacia el menú principal
                    setTimeout(() => {
                        window.location.href = "html.html"; // Asegúrate de que coincida con el nombre exacto de tu HTML de inicio
                    }, 1800);

                } else {
                    Swal.fire("Código Inválido", "El código ingresado es incorrecto, ya fue utilizado o ha expirado.", "error");
                }

            } catch (error) {
                console.error("Error crítico en verificación de token:", error);
                Swal.fire("Error de Sincronización", "No se pudo validar el código. Asegúrese de que el servicio web de la API esté activo.", "error");
            }
        });
    }
});