// ===============================================================
// CONTROLADOR GENERAL DEL MENÚ PRINCIPAL E INTERFAZ (IDEC)
// ===============================================================

console.log("Módulo de navegación y control de sesión activo ✅");

document.addEventListener("DOMContentLoaded", function () {
    
    // 1. VERIFICACIÓN ESTRICTA DE SEGURIDAD (PROTECCIÓN DE RUTA)
    const token = localStorage.getItem("token");
    if (token !== "autenticado") {
        console.warn("Acceso no autorizado. Redireccionando al Login... 🔒");
        window.location.href = "Login.html";
        return; // Detiene la ejecución del resto del script
    }

    // 2. MOSTRAR EL NOMBRE DEL USUARIO EN LA INTERFAZ (SI EXISTE UN ELEMENTO)
    // Busca un elemento en tu HTML con id="nombreUsuarioActivo" para saludar al usuario
    const txtUsuario = document.getElementById("nombreUsuarioActivo");
    if (txtUsuario) {
        const nombreGuardado = localStorage.getItem("usuarioNombre") || "Administrador";
        txtUsuario.innerText = nombreGuardado;
    }

    // ===============================================================
    // 3. MANEJO DE NAVEGACIÓN LATERAL DINÁMICA
    // ===============================================================
    const links = document.querySelectorAll("[data-section]");
    const sections = document.querySelectorAll(".content-section");

    if (links.length > 0) {
        links.forEach(link => {
            link.addEventListener("click", function (e) {
                e.preventDefault();

                const sectionId = this.dataset.section;
                console.log(`Cambiando a la sección: ${sectionId}`);

                // Desactivar estado activo visual en todos los enlaces del menú
                links.forEach(l => l.classList.remove("active"));
                // Agregar clase activa al menú seleccionado
                this.classList.add("active");

                // Ocultar todas las secciones del contenedor principal
                sections.forEach(section => {
                    section.classList.add("d-none");
                });

                // Mostrar la sección seleccionada por el usuario
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    targetSection.classList.remove("d-none");
                } else {
                    console.error(`La sección con ID '${sectionId}' no existe en el HTML.`);
                }
            });
        });
    }
});

// ===============================================================
// 4. FUNCIÓN GLOBAL: MOSTRAR SECCIÓN DESDE BOTONES EXTERNOS
// ===============================================================
function mostrarSeccion(idSeccion) {
    const secciones = document.querySelectorAll('.content-section');
    secciones.forEach(sec => {
        sec.classList.add('d-none');
    });

    const seccionAMostrar = document.getElementById(idSeccion);
    if (seccionAMostrar) {
        seccionAMostrar.classList.remove('d-none');
        
        // Sincronizar el estado activo del menú lateral
        const links = document.querySelectorAll("[data-section]");
        links.forEach(link => {
            if (link.dataset.section === idSeccion) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });
    } else {
        console.error(`No se pudo alternar a la sección interactiva: ${idSeccion}`);
    }
}

// ===============================================================
// 5. FUNCIÓN GLOBAL: CERRAR SESIÓN SEGURA
// ===============================================================
function cerrarSesion() {
    Swal.fire({
        title: '¿Cerrar Sesión?',
        text: "Se dará de baja el token temporal de acceso en este navegador.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Limpieza absoluta de credenciales en caché local
            localStorage.removeItem("token");
            localStorage.removeItem("usuarioID");
            localStorage.removeItem("usuarioNombre");
            sessionStorage.clear();

            // Redirección inmediata al portal de firmas
            window.location.href = "Login.html";
        }
    });
}

// =======================================================================
// 5. LÓGICA DE GUARDADO DEL FORMULARIO DE SEDES (BLOQUE CORREGIDO)
// =======================================================================
const form = document.getElementById('formregistro');

if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault(); 

        const ids = ['codigoig', 'pais', 'departamento', 'municipio', 'distrito', 'aldea', 'caserio', 'region', 'direccion'];
        let formularioValido = true;
        let primerCampoConError = null;

        // 1. VALIDACIÓN RIGUROSA
        ids.forEach(id => {
            const input = document.getElementById(id);
            // .trim() quita espacios, si es falso, el campo está vacío
            if (!input.value.trim()) {
                input.classList.add('is-invalid');
                formularioValido = false;
                if (!primerCampoConError) primerCampoConError = input;
            } else {
                input.classList.remove('is-invalid');
            }
        });

        // 2. BLOQUEO TOTAL SI HAY ERROR
        if (!formularioValido) {
            alert("¡Error! Debes llenar todos los espacios en blanco antes de guardar.");
            primerCampoConError.focus();
            return; // <--- ESTO ES LO MÁS IMPORTANTE. Si falta algo, aquí termina la función.
        }

        // 3. SI LLEGA A ESTE PUNTO, ES PORQUE TODO ESTÁ LLENO
        const data = {
            CodigoIglesia: document.getElementById('codigoig').value,
            Pais: document.getElementById('pais').value,
            Departamento: document.getElementById('departamento').value,
            Municipio: document.getElementById('municipio').value,
            Distrito: document.getElementById('distrito').value,
            Aldea: document.getElementById('aldea').value,
            Caserio: document.getElementById('caserio').value,
            Region: document.getElementById('region').value,
            Direccion: document.getElementById('direccion').value,
            Estado: document.getElementById('estado').value === 'true'
        };

        // 4. ENVÍO A LA BASE DE DATOS
        try {
            const response = await fetch('TU_URL_AQUI', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('¡Registro guardado exitosamente!');
                form.reset();
            } else {
                alert('Error al guardar. Verifica los datos.');
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión con el servidor.');
        }
    });
}
