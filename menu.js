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
// LÓGICA DE GUARDADO DEL FORMULARIO DE SEDES (CORREGIDA)
// =======================================================================
document.getElementById('formregistro').addEventListener('submit', async function(e) {
    // 1. Esto detiene el envío si el navegador detecta que falta un 'required'
    if (!this.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
        alert("¡Error! Debes llenar todos los campos.");
        return; 
    }

    // 2. Prevenir recarga solo si es válido
    e.preventDefault();

    // 3. Preparar datos
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

    // 4. Guardar
    try {
        const response = await fetch('TU_URL_AQUI', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('¡Guardado exitosamente!');
            this.reset();
        } else {
            alert('Error en el servidor.');
        }
    } catch (error) {
        alert('Error de conexión.');
    }
});


// Función para cargar las iglesias en el select
async function cargarIglesias() {
    const select = document.getElementById('codigoigle');
    // Validar si el elemento existe antes de hacer nada
    if (!select) return;
    try {
        const response = await fetch('https://api-idec-sacpuy-gwdhcfafaec5c9g8.eastus-01.azurewebsites.net/api/registroidec');
        // Mejora: Verificar si la respuesta fue exitosa (código 200-299)
        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status}`);
        }
        const registros = await response.json();

        // Limpiar y preparar el select
        select.innerHTML = '<option value="">Seleccione una iglesia</option>';

        if (registros.length === 0) {
            select.innerHTML = '<option value="">No hay registros disponibles</option>';
            return;
        }

        // Llenar el select
        registros.forEach(item => {
            const option = document.createElement('option');
            option.value = item.CodigoIglesia;
            option.textContent = `${item.CodigoIglesia} - ${item.Departamento}, ${item.Municipio}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar iglesias:", error);
        select.innerHTML = '<option value="">Error de conexión</option>';
    }
}
// Inicialización
document.addEventListener("DOMContentLoaded", cargarIglesias);



//Para mostrar en una lista los miembros
async function cargarPersonas() {
    const select = document.getElementById('codigoPerID');
    
    try {
        // La URL de tu controlador configurado en [RoutePrefix("api/datospersonales")]
        const response = await fetch('https://api-idec-sacpuy-gwdhcfafaec5c9g8.eastus-01.azurewebsites.net/api/datospersonales');
        
        if (!response.ok) throw new Error('Error al conectar con la API');
        
        const personas = await response.json();
        
        // Verifica en la consola qué está llegando exactamente
        console.log("Datos recibidos de la API:", personas);

        select.innerHTML = '<option value="">Seleccione un donante...</option>';

        personas.forEach(p => {
            const option = document.createElement('option');
            
            // Usamos las propiedades exactas definidas en tu clase DatosPersonales.cs
            // Asegúrate de usar mayúsculas como están en tu modelo C#
            option.value = p.DatosPersonalID; 
            option.textContent = `${p.Nombres} ${p.Apellidos} (ID: ${p.DatosPersonalID})`;
            
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar personas:", error);
        select.innerHTML = '<option value="">Error al cargar personas</option>';
    }
}

// Llamar al cargar la página
document.addEventListener("DOMContentLoaded", cargarPersonas);

//Para la lista de ID iglesias en activos
async function cargarIglesiasParaVincular() {
    const select = document.getElementById('codigoIglesia');
    
    // PROTECCIÓN: Si este ID no existe en la página, se sale sin dar error
    if (!select) return; 

    try {
        const response = await fetch('https://api-idec-sacpuy-gwdhcfafaec5c9g8.eastus-01.azurewebsites.net/api/registroidec');
        
        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status}`);
        }
        
        const registros = await response.json();

        // Limpiar y preparar el select
        select.innerHTML = '<option value="">Seleccione una iglesia...</option>';

        if (registros.length === 0) {
            select.innerHTML = '<option value="">No hay registros disponibles</option>';
            return;
        }

        // Llenar el select
        registros.forEach(item => {
            const option = document.createElement('option');
            // Asegúrate de que item.CodigoIglesia exista en la respuesta de la API
            option.value = item.CodigoIglesia;
            option.textContent = `${item.CodigoIglesia} - ${item.Departamento}, ${item.Municipio}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar iglesias para vinculación:", error);
        select.innerHTML = '<option value="">Error de conexión</option>';
    }
}

// Inicialización
document.addEventListener("DOMContentLoaded", cargarIglesiasParaVincular);

/////Para cargar codigo iglesias en obras sociales
async function cargarSedesIglesia() {
    const select = document.getElementById('codigoIglesiaObras');
    
    // Protección: si no existe el elemento en esta página, no hacemos nada
    if (!select) return;

    try {
        const response = await fetch('https://api-idec-sacpuy-gwdhcfafaec5c9g8.eastus-01.azurewebsites.net/api/registroidec');
        
        if (!response.ok) throw new Error(`Error en la API: ${response.status}`);
        
        const registros = await response.json();

        // Limpiamos y agregamos opción inicial
        select.innerHTML = '<option value="">Seleccione una sede...</option>';

        registros.forEach(item => {
            const option = document.createElement('option');
            option.value = item.CodigoIglesia; // Asegúrate de que coincida con tu JSON
            option.textContent = `${item.CodigoIglesia} - ${item.Departamento}, ${item.Municipio}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar sedes:", error);
        select.innerHTML = '<option value="">Error al cargar datos</option>';
    }
}

// Llamar a la función al cargar la página
document.addEventListener("DOMContentLoaded", cargarSedesIglesia);

/////Para la lista de idec en pagos 
async function cargarIglesiasParaPago() {
    const select = document.getElementById('codigoIglesiaPago');
    if (!select) return;

    try {
        const response = await fetch('https://api-idec-sacpuy-gwdhcfafaec5c9g8.eastus-01.azurewebsites.net/api/registroidec');
        if (!response.ok) throw new Error('Error al cargar iglesias');
        
        const registros = await response.json();

        select.innerHTML = '<option value="">Seleccione una iglesia...</option>';

        registros.forEach(item => {
            const option = document.createElement('option');
            option.value = item.CodigoIglesia; // Este es el valor que el botón tomará
            option.textContent = `${item.CodigoIglesia} - ${item.Departamento}, ${item.Municipio}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar iglesias para pago:", error);
        select.innerHTML = '<option value="">Error de conexión</option>';
    }
}

// Llamar al cargar
document.addEventListener("DOMContentLoaded", cargarIglesiasParaPago);








