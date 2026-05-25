// ===============================================================
// CONFIGURACIÓN CENTRALIZADA DE LA API EN LA NUBE (AZURE)
// ===============================================================
const API_BASE_URL = "https://api-idec-sacpuy-gwdhcfafaec5c9g8.eastus-01.azurewebsites.net/api";

console.log("Módulo de autenticación (login.js) cargado correctamente ✅");

let usuarioIDTemporal = null;

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const authCodeSection = document.getElementById("authCodeSection");
    const btnVerificarCodigo = document.getElementById("btnVerificarCodigo");

    // ===============================================================
    // FLUJO 1: LOGIN PRINCIPAL Y DISPARO DE CÓDIGO
    // ===============================================================
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const nombreUsuario = document.getElementById("nombreUsuario").value.trim();
            const contrasena = document.getElementById("contrasena").value.trim();

            Swal.fire({ title: 'Verificando...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

            try {
                // 1. Intentar Login
                const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        NombreUsuario: nombreUsuario,
                        ContraseñaHash: contrasena 
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    usuarioIDTemporal = data.UsuarioID;
                    
                    // 2. Disparar generación de código (independientemente si falla el envío de correo)
                    try {
                        const emailResponse = await fetch(`${API_BASE_URL}/codigos/generar`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ UsuarioID: usuarioIDTemporal })
                        });
                        
                        const emailResult = await emailResponse.json();
                        
                        if (emailResponse.ok) {
                            Swal.fire("Código enviado", "Hemos enviado un código a tu correo.", "success");
                        } else {
                            Swal.fire("Aviso", emailResult.Mensaje || "Error al generar código.", "warning");
                        }
                    } catch (err) {
                        console.error("Error al disparar el envío:", err);
                        Swal.fire("Aviso", "Login exitoso, pero hubo un problema técnico al enviar el código.", "error");
                    }

                    Swal.close();
                    loginForm.classList.add("d-none");
                    authCodeSection.classList.remove("d-none");
                } else {
                    Swal.fire("Error", "Usuario o contraseña incorrectos.", "error");
                }
            } catch (error) {
                Swal.fire("Error", "Fallo de conexión con el servidor.", "error");
            }
        });
    }

    // ===============================================================
    // FLUJO 2: VERIFICACIÓN DEL SEGUNDO FACTOR
    // ===============================================================
    if (btnVerificarCodigo) {
        btnVerificarCodigo.addEventListener("click", async function () {
            const codigo = document.getElementById("codigo").value.trim();

            if (!codigo) {
                Swal.fire("Atención", "Por favor ingresa el código.", "warning");
                return;
            }

            Swal.fire({ title: 'Validando...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

            try {
                const response = await fetch(`${API_BASE_URL}/codigos/validar?usuarioID=${usuarioIDTemporal}&codigo=${codigo}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                });

                const resultado = await response.json();

                if (response.ok) {
                    localStorage.setItem("token", "autenticado");
                    localStorage.setItem("usuarioID", usuarioIDTemporal);
                    window.location.href = "html.html";
                } else {
                    Swal.fire("Código Inválido", resultado.Mensaje || "El código es incorrecto o ha expirado.", "error");
                }
            } catch (error) {
                Swal.fire("Error", "No se pudo validar el código.", "error");
            }
        });
    }
});
