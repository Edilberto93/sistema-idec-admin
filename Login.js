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
    // FLUJO 1: LOGIN PRINCIPAL (VALIDAR USUARIO Y CONTRASEÑA)
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

            Swal.fire({
                title: 'Verificando credenciales...',
                text: 'Conectando con el servidor de seguridad de Azure SQL...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            try {
                // RUTA CORREGIDA: Apunta a /usuarios/login según tu controlador C#
                const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        NombreUsuario: nombreUsuario,
                        ContraseñaHash: contrasena // Asegúrate de que este nombre coincida con tu modelo Usuario en C#
                    })
                });

                Swal.close();

                if (response.ok) {
                    const data = await response.json();

                    usuarioIDTemporal = data.UsuarioID || data.usuarioID;
                    nombreUsuarioTemporal = nombreUsuario;

                    const nombreMostrar = data.NombreCompleto || data.nombreCompleto || nombreUsuario;
                    localStorage.setItem("usuarioNombre", nombreMostrar);

                    loginForm.classList.add("d-none");
                    if (authCodeSection) {
                        authCodeSection.classList.remove("d-none");
                    }

                    Swal.fire({
                        icon: 'success',
                        title: 'Acceso inicial autorizado',
                        text: 'Se ha enviado un código de verificación.',
                        timer: 3000,
                        showConfirmButton: false
                    });
                } else {
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
                Swal.fire("Fallo de Red", "No se pudo establecer conexión con Azure.", "error");
            }
        });
    }

    // ===============================================================
    // FLUJO 2: VERIFICACIÓN DEL SEGUNDO FACTOR
    // ===============================================================
    if (btnVerificarCodigo) {
        btnVerificarCodigo.addEventListener("click", async function () {
            const codigoInput = document.getElementById("codigo");
            if (!codigoInput) return;

            const codigo = codigoInput.value.trim();
            if (!codigo || codigo.length < 6) {
                Swal.fire("Código Requerido", "Ingrese el código de 6 dígitos.", "warning");
                return;
            }

            Swal.fire({
                title: 'Validando...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            try {
                const response = await fetch(`${API_BASE_URL}/codigos/verificar/${usuarioIDTemporal}/${codigo}`, {
                    method: "GET",
                    headers: { "Accept": "application/json" }
                });

                Swal.close();
                if (!response.ok) throw new Error("Error en la validación.");

                const resultado = await response.json();

                if (resultado.Valido === 1 || resultado.Valido === true) {
                    localStorage.setItem("token", "autenticado");
                    localStorage.setItem("usuarioID", usuarioIDTemporal);
                    window.location.href = "html.html";
                } else {
                    Swal.fire("Código Inválido", "El código es incorrecto o expiró.", "error");
                }
            } catch (error) {
                Swal.fire("Error", "No se pudo validar el código.", "error");
            }
        });
    }
});
