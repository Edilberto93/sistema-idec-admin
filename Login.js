// ===============================================================
// CONFIGURACIÓN CENTRALIZADA DE LA API EN LA NUBE (AZURE)
// ===============================================================
const API_BASE_URL = "https://api-idec-sacpuy-gwdhcfafaec5c9g8.eastus-01.azurewebsites.net/api";

// Declaramos la variable global para que sea accesible en ambos flujos
let usuarioIDTemporal = null; 

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const authCodeSection = document.getElementById("authCodeSection");
    const btnVerificarCodigo = document.getElementById("btnVerificarCodigo");

    // FLUJO 1: LOGIN Y GENERAR
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const nombreUsuario = document.getElementById("nombreUsuario").value.trim();
            const contrasena = document.getElementById("contrasena").value.trim();

            Swal.fire({ title: 'Verificando...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

            try {
                const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ NombreUsuario: nombreUsuario, ContraseñaHash: contrasena })
                });

                if (response.ok) {
                    const data = await response.json();
                    usuarioIDTemporal = data.UsuarioID; 

                    const emailResponse = await fetch(`${API_BASE_URL}/codigos/generar`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ UsuarioID: usuarioIDTemporal })
                    });
                    
                    if (emailResponse.ok) {
                        Swal.fire("Código enviado", "Revisa tu correo.", "success");
                        loginForm.classList.add("d-none");
                        authCodeSection.classList.remove("d-none");
                    } else {
                        Swal.fire("Aviso", "Login exitoso, pero fallo al generar código.", "warning");
                    }
                } else {
                    Swal.fire("Error", "Usuario o contraseña incorrectos.", "error");
                }
            } catch (error) {
                console.error("Error en login:", error);
                Swal.fire("Error", "Fallo de conexión al servidor.", "error");
            }
        });
    }

    // FLUJO 2: VERIFICACIÓN
    if (btnVerificarCodigo) {
        btnVerificarCodigo.addEventListener("click", async function () {
            const codigo = document.getElementById("codigo").value.trim();
            
            if (!usuarioIDTemporal) {
                Swal.fire("Error", "Sesión expirada, por favor inicia sesión de nuevo.", "error");
                return;
            }
            if (!codigo) { Swal.fire("Atención", "Ingresa el código.", "warning"); return; }

            Swal.fire({ title: 'Validando...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

            try {
                const response = await fetch(`${API_BASE_URL}/codigos/validar`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        UsuarioID: parseInt(usuarioIDTemporal), 
                        Codigo: codigo 
                    })
                });

                const resultado = await response.json();

                // Validación de éxito (el resultado viene de tu controlador)
                if (response.ok && (resultado.Valido === 1 || resultado.Valido === true)) {
                    localStorage.setItem("token", "autenticado");
                    window.location.href = "Menu.html"; // Asegúrate que este archivo exista en tu servidor
                } else {
                    Swal.fire("Código Inválido", "El código es incorrecto o expiró.", "error");
                }
            } catch (error) {
                console.error("Error en validación:", error);
                Swal.fire("Error", "No se pudo conectar al servidor.", "error");
            }
        });
    }
});
