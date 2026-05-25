// ===============================================================
// CONFIGURACIÓN CENTRALIZADA DE LA API EN LA NUBE (AZURE)
// ===============================================================
// CONFIGURACIÓN CENTRALIZADA
const API_BASE_URL = "https://api-idec-sacpuy-gwdhcfafaec5c9g8.eastus-01.azurewebsites.net/api";

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

                    // Mantenemos tu ruta /generar
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
                Swal.fire("Error", "Fallo de conexión.", "error");
            }
        });
    }

    // FLUJO 2: VERIFICACIÓN (CORREGIDO PARA ENVIAR JSON EN BODY)
    if (btnVerificarCodigo) {
        btnVerificarCodigo.addEventListener("click", async function () {
            const codigo = document.getElementById("codigo").value.trim();
            if (!codigo) { Swal.fire("Atención", "Ingresa el código.", "warning"); return; }

            Swal.fire({ title: 'Validando...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

            try {
                // CORRECCIÓN: Si tu controlador espera [FromBody], debes enviar un objeto JSON, no parámetros en la URL
                const response = await fetch(`${API_BASE_URL}/codigos/validar`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        UsuarioID: usuarioIDTemporal, 
                        Codigo: codigo 
                    })
                });

                const resultado = await response.json();

                // Nota: Tu controlador devuelve { Valido: 1/0 }
                if (response.ok && (resultado.Valido === 1 || resultado.Valido === true)) {
                    localStorage.setItem("token", "autenticado");
                    window.location.href = "html.html";
                } else {
                    Swal.fire("Código Inválido", "El código es incorrecto o expiró.", "error");
                }
            } catch (error) {
                Swal.fire("Error", "No se pudo conectar al servidor.", "error");
            }
        });
    }
});
