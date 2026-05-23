// =======================================================================
// CONFIGURACIÓN CENTRALIZADA DE TU API REAL EN LA NUBE (AZURE)
// =======================================================================
const API_BASE_URL = "https://api-idec-sacpuy-gwdhcfafaec5c9g8.eastus-01.azurewebsites.net/api";

console.log("Archivo registro.js cargado y configurado en la nube ✅");

// =======================================================================
// 1. REGISTRO DE SEDES REGIONALES (FORMULARIO 1)
// =======================================================================
document.addEventListener("submit", async function (e) {
    if (e.target && e.target.id === "formregistro") {
        e.preventDefault();
        console.log("Formulario Sede detectado, capturando datos...");

        const registro = {
            Operacion: "Insertar",
            CodigoIglesia: document.getElementById("codigoig").value.trim(),
            Pais: document.getElementById("pais").value.trim(),
            Departamento: document.getElementById("departamento").value.trim(),
            Municipio: document.getElementById("municipio").value.trim(),
            Distrito: document.getElementById("distrito").value.trim(),
            Aldea: document.getElementById("aldea").value.trim(),
            Caserio: document.getElementById("caserio").value.trim(),
            Region: document.getElementById("region").value.trim(),
            Direccion: document.getElementById("direccion").value.trim(),
            Estado: document.getElementById("estado").value === "true"
        };

        try {
            const response = await fetch(`${API_BASE_URL}/registroidec`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(registro)
            });

            if (response.ok) {
                const mensaje = await response.text();
                Swal.fire({ icon: 'success', title: '¡Éxito!', text: mensaje, confirmButtonColor: '#003399' });
                e.target.reset();
            } else {
                const errorTexto = await response.text();
                Swal.fire({ icon: 'error', title: 'Error del servidor', text: errorTexto });
            }
        } catch (error) {
            console.error("Error en la conexión:", error);
            Swal.fire({ icon: 'error', title: 'Error de Red', text: 'No se pudo conectar con la API en Azure.' });
        }
    }
});

// =======================================================================
// 2. REGISTRO DE MIEMBROS DE LA IDEC (FORMULARIO 2)
// =======================================================================
let fotoBase64 = null;
const FOTO_DEFECTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%23666666'%3EFoto%3C/text%3E%3C/svg%3E";

document.addEventListener("change", function(e) {
    if (e.target && e.target.id === "fotoInput") {
        const file = e.target.files[0];
        const previewFoto = document.getElementById('previewFoto');

        if (file) {
            if (file.size > 1024 * 1024) {
                Swal.fire({ icon: 'warning', title: 'Archivo muy grande', text: 'La imagen supera el límite permitido de 1MB.' });
                e.target.value = "";
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                if (previewFoto) previewFoto.src = event.target.result;
                fotoBase64 = event.target.result.split(',')[1];
            };
            reader.readAsDataURL(file);
        }
    }
});

document.addEventListener("submit", async function (e) {
    if (e.target && e.target.id === "formMiembros") {
        e.preventDefault();
        console.log("Iniciando envío de Datos Personales...");

        const datos = {
            Operacion: "Insertar",
            DatosPersonalID: 0,
            Nombres: document.getElementById('nombres').value.trim(),
            Apellidos: document.getElementById('apellidos').value.trim(),
            DPI: document.getElementById('dpi').value.trim(),
            Edad: parseInt(document.getElementById('edad').value) || 0,
            Sexo: document.getElementById('sexo').value,
            EstadoCivil: document.getElementById('estadocivil').value,
            LugarNacimiento: document.getElementById('lugardenacimiento').value.trim(),
            Cargo: document.getElementById('cargo').value.trim(),
            Profesion: document.getElementById('profesion').value.trim(),
            NumeroRegistro: document.getElementById('numeroregistro').value.trim(),
            LibroNo: document.getElementById('libro').value.trim(),
            FolioNo: document.getElementById('folio').value.trim(),
            Leer: document.getElementById('leer').value,
            Escribir: document.getElementById('escribir').value,
            GradoAcademico: document.getElementById('grado').value.trim(),
            FechaConversion: document.getElementById('conversion').value || null,
            FechaBautismoAgua: document.getElementById('bautismoa').value || null,
            RecepcionMiembro: document.getElementById('recepcion').value || null,
            FechaBautismoES: document.getElementById('bautismo_es').value || null,
            FechaLlamadoMinisterio: document.getElementById('llamado').value || null,
            Fallecido: document.getElementById('fallecido').value === "true",
            Transferido: document.getElementById('transferido').value === "true",
            Estado: document.getElementById('reg_estado').value || "Activo",
            RegistroID: document.getElementById('codigoigle').value.trim(),
            Foto: fotoBase64
        };

        try {
            const response = await fetch(`${API_BASE_URL}/DatosPersonales`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(datos)
            });

            if (response.ok) {
                const resultado = await response.json();
                Swal.fire({ icon: 'success', title: '¡Registrado!', text: resultado.mensaje || "Miembro registrado exitosamente." });
                e.target.reset();
                if (document.getElementById('previewFoto')) document.getElementById('previewFoto').src = FOTO_DEFECTO;
                fotoBase64 = null;
            } else {
                const errorTexto = await response.text();
                Swal.fire({ icon: 'error', title: 'Error del Servidor', text: errorTexto });
            }
        } catch (error) {
            console.error("Error en la conexión:", error);
            Swal.fire({ icon: 'error', title: 'Fallo de Red', text: 'Revisa tu conexión a internet o el estado de la API.' });
        }
    }
});

// =======================================================================
// 3. INVENTARIO DE ACTIVOS FIJOS (FORMULARIO 3)
// =======================================================================
document.addEventListener("DOMContentLoaded", function () {
    const formActivos = document.getElementById("formActivos");
    if (formActivos) {
        formActivos.addEventListener("submit", function (e) {
            e.preventDefault();

            const activoData = {
                Operacion: "Insertar",
                ActivoID: 0,
                NumeroActivo: document.getElementById("numeroActivo").value.trim(),
                Area: document.getElementById("area").value.trim(),
                FechaAdquisicion: document.getElementById("fechaAdquisicion").value,
                Costo: parseFloat(document.getElementById("costo").value) || 0,
                Descripcion: document.getElementById("descripcion").value.trim(),
                Estado: document.getElementById("estadoActivo").value === "true",
                RegistroID: document.getElementById("codigoIglesia").value.trim()
            };
            enviarActivo(activoData);
        });
    }
});

async function enviarActivo(objetoDatos) {
    try {
        const response = await fetch(`${API_BASE_URL}/activos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(objetoDatos)
        });
        const texto = await response.text();
        let resultado;
        try { 
            resultado = JSON.parse(texto);
        } catch(e) { 
            resultado = { mensaje: texto }; 
        }

        if (response.ok) {
            Swal.fire({ icon: 'success', title: '¡Hecho!', text: resultado.mensaje || "Activo registrado con éxito" });
            document.getElementById("formActivos").reset();
        } else {
            Swal.fire({ icon: 'warning', title: 'Atención', text: resultado.Message || resultado.mensaje || "Verifique duplicidad en número de activo." });
        }
    } catch (error) {
        console.error("Error crítico:", error);
        Swal.fire({ icon: 'error', title: 'Error de Red', text: 'No se pudo establecer comunicación remota con los módulos financieros.' });
    }
}

// =======================================================================
// 4. MÓDULO DE OBRAS SOCIALES (FORMULARIO 4)
// =======================================================================
document.addEventListener("DOMContentLoaded", function () {
    const formObras = document.getElementById("formObrasSociales");
    const inputFoto = document.getElementById("fotoObras");

    if(inputFoto) {
        inputFoto.addEventListener("change", function() {
            if (this.files && this.files.length > 0) {
                this.nextElementSibling.innerText = this.files[0].name;
            }
        });
    }

    if (formObras) {
        formObras.addEventListener("submit", async function (e) {
            e.preventDefault();

            let fotoBase64Obras = null;
            if (inputFoto.files.length > 0) {
                fotoBase64Obras = await convertirABase64(inputFoto.files[0]);
            }

            const payload = {
                ObrasSocialesID: 0,
                CIU: document.getElementById("ciu").value.trim(),
                Nombres: document.getElementById("nombresObras").value.trim(),
                Apellidos: document.getElementById("apellidosObras").value.trim(),
                FechaNacimiento: document.getElementById("fechaNacObras").value,
                Lugar: document.getElementById("lugarObras").value.trim(),
                NumeroTelefono: document.getElementById("telefonoObras").value.trim(),
                Descripcion: document.getElementById("descripcionObras").value.trim(),
                Foto: fotoBase64Obras,
                CodigoIglesia: document.getElementById("codigoIglesiaObras").value.trim()
            };
            enviarObrasSociales(payload);
        });
    }
});

function convertirABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

async function enviarObrasSociales(objeto) {
    try {
        const response = await fetch(`${API_BASE_URL}/obrassociales`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(objeto)
        });
        if (response.ok) {
            const mensajeExito = await response.text();
            Swal.fire({ icon: 'success', title: '¡Éxito!', text: mensajeExito, confirmButtonColor: '#003399' });
            document.getElementById("formObrasSociales").reset();
            const fileLabel = document.querySelector(".custom-file-label");
            if(fileLabel) fileLabel.innerText = "Elegir archivo...";
        } else {
            const errorText = await response.text();
            Swal.fire({ icon: 'warning', title: 'Error Operacional', text: errorText });
        }
    } catch (error) {
        console.error("Error detallado:", error);
        Swal.fire({ icon: 'error', title: 'Error de Servidor', text: 'El nodo remoto de Azure no responde.' });
    }
}

// =======================================================================
// 5. CONTABILIDAD: GESTIÓN DE PAGOS MENSUALES (FORMULARIO 5)
// =======================================================================
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formPagos");
    const inputIglesia = document.getElementById("codigoIglesiaPago");
    const labelSaldo = document.getElementById("txtSaldoActual");
    const btnRefresh = document.getElementById("btnConsultarSaldo");
    const totalBadge = document.getElementById('totalBadge');

    if (!form) return;

    const consultarSaldo = async () => {
        const iglesia = inputIglesia.value.trim();
        if (!iglesia) return;

        try {
            labelSaldo.innerText = "Consultando...";
            const res = await fetch(`${API_BASE_URL}/contabilidad/saldo-actual/${iglesia}`);
            if (res.ok) {
                const data = await res.json();
                const saldo = data.saldoActual;
                labelSaldo.dataset.valor = saldo;
                labelSaldo.innerText = `Q ${saldo.toLocaleString('es-GT', {minimumFractionDigits: 2})}`;
                labelSaldo.style.color = saldo < 0 ? "#ff8080" : "white";
                totalizar();
            }
        } catch (err) {
            console.error("Error saldo:", err);
            labelSaldo.innerText = "Error";
        }
    };

    const totalizar = () => {
        let t = 0;
        document.querySelectorAll('.sumable-pago').forEach(i => {
            t += parseFloat(i.value || 0);
        });
        totalBadge.innerText = `Q ${t.toFixed(2)}`;

        const saldoDisponible = parseFloat(labelSaldo.dataset.valor || 0);
        if (t > saldoDisponible) {
            totalBadge.classList.replace('text-success', 'text-danger');
            totalBadge.title = "Atención: El monto supera el saldo disponible";
        } else {
            totalBadge.classList.replace('text-danger', 'text-success');
            totalBadge.title = "";
        }
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const selectMes = document.getElementById("MesPagado");
        const valorMes = selectMes.value;

        if (!valorMes) {
            Swal.fire({ icon: 'warning', title: 'Faltan Campos', text: 'Por favor, seleccione un Mes.' });
            return;
        }

        const pagoData = {
            PagoEnergia: parseFloat(document.getElementById("pagoEnergia").value) || 0,
            PagoAgua: parseFloat(document.getElementById("pagoAgua").value) || 0,
            PagoInsumosLimpieza: parseFloat(document.getElementById("pagoInsumos").value) || 0,
            OtrosPagos: parseFloat(document.getElementById("otrosPagos").value) || 0,
            MesPagado: valorMes,
            AnioPagado: parseInt(document.getElementById("anioPagado").value) || 2026,
            Fecha: new Date().toISOString().split('T')[0],
            Descripcion: document.getElementById("descripcionPago").value.trim(),
            CodigoIglesia: inputIglesia.value.trim()
        };

        try {
            const res = await fetch(`${API_BASE_URL}/contabilidad/procesar-pago`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pagoData)
            });
            const dataRes = await res.json();

            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'Pago Exitoso', text: dataRes.mensaje });
                form.reset();
                totalizar();
                consultarSaldo();
            } else {
                const msgError = dataRes.Message || dataRes.mensaje || JSON.stringify(dataRes);
                Swal.fire({ icon: 'error', title: 'Transacción Declinada', text: msgError });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Fallo Crítico', text: 'Error de conexión con el servidor en la nube.' });
        }
    });

    // Se eliminó el bloque de listeners duplicados que estaba aquí [Evita sobrecarga de red]
    inputIglesia.addEventListener("blur", consultarSaldo);
    btnRefresh.addEventListener("click", consultarSaldo);
    
    document.querySelectorAll('.sumable-pago').forEach(i => {
        i.addEventListener('input', totalizar);
        i.addEventListener('focus', function() { if(this.value == "0.00" || this.value == "0") this.value = ""; });
        i.addEventListener('blur', function() { if(this.value == "") this.value = "0.00"; totalizar(); });
    });
});

// =======================================================================
// 6. CONTABILIDAD: REGISTRO DE INGRESOS (FORMULARIO 7)
// =======================================================================
document.addEventListener("DOMContentLoaded", () => {
    const formIngresos = document.getElementById('formIngresos');
    if (formIngresos) {
        formIngresos.addEventListener('submit', function(e) {
            e.preventDefault();

            const datosIngreso = {
                Diezmos: parseFloat(document.getElementById('diezmos').value) || 0,
                Ofrendas: parseFloat(document.getElementById('ofrendas').value) || 0,
                Primicias: parseFloat(document.getElementById('primicias').value) || 0,
                MesPagado: document.getElementById('mesPagado').value,
                Fecha: document.getElementById('fechaIngreso').value,
                Descripcion: document.getElementById('descripcionIngreso').value.trim(),
                CodigoPerID: parseInt(document.getElementById('codigoPerID').value) || 0
            };

            fetch(`${API_BASE_URL}/ingresos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosIngreso)
            })
            .then(response => {
                if (response.ok) {
                    Swal.fire({ icon: 'success', title: 'Ingreso Guardado', text: 'Ingreso registrado exitosamente 💰' });
                    formIngresos.reset();
                } else {
                    return response.json().then(err => { throw new Error(err.Message || "Error desconocido"); });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({ icon: 'error', title: 'Atención', text: 'No se pudo guardar: ' + error.message });
            });
        });
    }
});

// =======================================================================
// 7. GESTIÓN DE BAJAS LÓGICAS (FORMULARIO 8 - MANTENIMIENTO)
// =======================================================================
document.addEventListener("DOMContentLoaded", function() {
    const formBajas = document.getElementById("formBajas");

    if (formBajas) {
        formBajas.addEventListener("submit", function(e) {
            e.preventDefault();

            const tabla = document.getElementById("tipoTablaBaja").value;
            const id = document.getElementById("idRegistroBaja").value.trim();
            const contenedorMensaje = document.getElementById("mensajeBaja");

            if(!tabla || !id) {
                Swal.fire('Atención', 'Debe seleccionar un módulo e ingresar un ID.', 'warning');
                return;
            }

            Swal.fire({
                title: '¿Está seguro de procesar la baja?',
                text: `Se cambiará a estado inactivo el registro ${id} en el módulo de ${tabla.toUpperCase()}.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, inactivar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    procesarBajaAPI(tabla, id, contenedorMensaje);
                }
            });
        });
    }
});

async function procesarBajaAPI(tabla, id, alertElement) {
    const url = `${API_BASE_URL}/bajas/ejecutar?tabla=${tabla}&id=${id}`;
    try {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        const data = await response.json();

        if(alertElement) alertElement.classList.remove("d-none", "alert-success", "alert-danger");

        if (response.ok && data.Resultado === "Success") {
            if(alertElement) {
                alertElement.classList.add("alert-success");
                alertElement.innerHTML = `<i class="fas fa-check-circle"></i> ${data.Mensaje}`;
            }
            document.getElementById("formBajas").reset();
            Swal.fire('¡Logrado!', data.Mensaje, 'success');
        } else {
            if(alertElement) {
                alertElement.classList.add("alert-danger");
                alertElement.innerHTML = `<i class="fas fa-times-circle"></i> Error: ${data.Mensaje}`;
            }
            Swal.fire('Atención', data.Mensaje, 'error');
        }
    } catch (error) {
        console.error("Error en fetch Bajas:", error);
        if(alertElement) {
            alertElement.classList.remove("d-none");
            alertElement.classList.add("alert-danger");
            alertElement.innerText = "Error crítico: No se pudo conectar con el servidor remoto.";
        }
    }
}

// =======================================================================
// 8. GENERACIÓN DE REPORTES DINÁMICOS EN PDF (MÓDULO 6)
// =======================================================================
function gestionarFiltros(tipo) {
    const fEstado = document.getElementById("estadoFiltro");
    const fMes = document.getElementById("mesFiltro");
    const fAnio = document.getElementById("anioFiltro");

    if(!fEstado || !fMes || !fAnio) return;
    [fEstado, fMes, fAnio].forEach(el => { el.disabled = false; el.style.backgroundColor = "white"; });
    
    switch (tipo) {
        case 1: 
            fEstado.value = "Activo";
            fMes.disabled = true;
            fMes.style.backgroundColor = "#e9ecef";
            fEstado.disabled = true;
            fEstado.style.backgroundColor = "#e9ecef";
            break;
        case 2: 
            fMes.disabled = true;
            fMes.style.backgroundColor = "#e9ecef";
            break;
        case 3: 
            [fEstado, fMes, fAnio].forEach(el => { el.disabled = true; el.style.backgroundColor = "#e9ecef"; });
            break;
        case 4: case 5: case 6: 
            fEstado.disabled = true;
            fEstado.style.backgroundColor = "#e9ecef";
            break;
    }
}

function cargarImagen(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
    });
}

window.generarReportePDF = async function(tipo) {
    const API_BASE_REPORTES = `${API_BASE_URL}/reportes`;
    gestionarFiltros(tipo);
    
    const iglesia = document.getElementById("codigoIglesiaFiltro").value;
    const mes = document.getElementById("mesFiltro").value;
    const anio = document.getElementById("anioFiltro").value;
    const estado = document.getElementById("estadoFiltro").value;
    const nombreUsuario = localStorage.getItem("usuarioNombre") || "Administrador";
    
    if (!iglesia) { 
        Swal.fire('Filtro Requerido', 'Por favor, ingrese el código de la iglesia para procesar.', 'warning');
        return; 
    }

    // Unificado a formato de contabilidad nacional de Guatemala (es-GT)
    const formatearMoneda = (valor) => {
        const num = new Intl.NumberFormat('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(valor) || 0);
        return `Q ${num}`;
    };

    let url = "";
    let titulo = "";
    switch (tipo) {
        case 1: url = `${API_BASE_REPORTES}/usuarios?iglesia=${iglesia}&estado=Activo&anio=${anio}`; titulo = "Usuarios Activos"; break;
        case 2: url = `${API_BASE_REPORTES}/usuarios?iglesia=${iglesia}&estado=${estado}&anio=${anio}`; titulo = `Usuarios: ${estado}`; break;
        case 3: url = `${API_BASE_REPORTES}/activos?iglesia=${iglesia}`; titulo = "Inventario de Activos"; break;
        case 4: url = `${API_BASE_REPORTES}/obras?iglesia=${iglesia}&mes=${mes}&anio=${anio}`; titulo = "Obras Sociales"; break;
        case 5: url = `${API_BASE_REPORTES}/pagos?iglesia=${iglesia}&mes=${mes}&anio=${anio}`; titulo = "Pagos de Servicios"; break;
        case 6: url = `${API_BASE_REPORTES}/ingresos?iglesia=${iglesia}&mes=${mes}&anio=${anio}`; titulo = "Ingresos Mensuales"; break;
    }

    try {
        Swal.fire({ title: 'Recopilando datos...', text: 'Buscando registros en Azure SQL', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
        const response = await fetch(url);

        if (response.status === 404) {
            const mensajeError = await response.json();
            Swal.fire('Sin Datos', `🔍 ${mensajeError.Message || mensajeError}`, 'info');
            return;
        }

        if (!response.ok) throw new Error("Error en servidor remoto.");
        const data = await response.json(); 
        
        if (!data || data.length === 0) { 
            Swal.fire('Vacío', 'No hay datos disponibles para los criterios seleccionados.', 'info');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        try {
            const imgLogo = await cargarImagen("../rlogo.png");
            doc.addImage(imgLogo, 'PNG', 12, 8, 22, 22);
        } catch (err) { 
            console.error("No se pudo cargar rlogo.png");
        }

        const fila0 = data[0];
        let resumenSQL = "";
        if (fila0.TotalGeneralIngresos) resumenSQL = `TOTAL INGRESOS: ${formatearMoneda(fila0.TotalGeneralIngresos)}`;
        else if (fila0.GranTotalMensual) resumenSQL = `TOTAL GASTOS: ${formatearMoneda(fila0.GranTotalMensual)}`;
        else if (fila0.InversionTotal && tipo === 3) resumenSQL = `INVERSIÓN TOTAL EN ACTIVOS: ${formatearMoneda(fila0.InversionTotal)}`;
        
        const dataTabla = data.map((item, index) => {
            let row = {};
            row["No."] = index + 1;
            if ([1, 2].includes(tipo)) { row["ID Personal"] = item.CodigoPerID || "N/A"; }

            Object.keys(item).forEach(key => {
                const ocultas = ["CodigoPerID", "TotalGeneralIngresos", "GranTotalMensual", "InversionTotal", "TotalGeneral"];
                if (!ocultas.includes(key)) { row[key] = item[key]; }
            });

            if (row.Fecha && typeof row.Fecha === "string") row.Fecha = row.Fecha.split('T')[0];
            if (row.RecepcionMiembro && typeof row.RecepcionMiembro === "string") row.RecepcionMiembro = row.RecepcionMiembro.split('T')[0];
            return row;
        });

        const encabezados = Object.keys(dataTabla[0]);
        const sumasPorColumna = encabezados.map(col => {
            const columnasASumar = ['PagoEnergia', 'PagoAgua', 'PagoInsumosLimpieza', 'OtrosPagos', 'TotalFila', 'Diezmos', 'Ofrendas', 'Primicias', 'Costo'];
            if (columnasASumar.includes(col)) {
                const total = dataTabla.reduce((sum, row) => sum + (parseFloat(row[col]) || 0), 0);
                return formatearMoneda(total);
            }
            return col === 'No.' ? "TOTALES:" : "";
        });

        doc.setFontSize(14).setFont(undefined, 'bold');
        doc.text("IGLESIA DE DIOS EVANGELIO COMPLETO SACPUY", 105, 15, { align: "center" });
        doc.setFontSize(11).text(titulo.toUpperCase(), 105, 22, { align: "center" });
        doc.setFontSize(9).setFont(undefined, 'normal');
        
        let sublinea = `Sede: ${iglesia} | Año: ${anio}`;
        if ([4, 5, 6].includes(tipo)) sublinea += ` | Mes: ${mes}`;
        doc.text(sublinea, 105, 28, { align: "center" });
        
        doc.autoTable({
            startY: 35,
            head: [encabezados],
            body: dataTabla.map(obj => Object.values(obj)),
            foot: ([1, 2, 4].includes(tipo)) ? null : [sumasPorColumna],
            theme: 'grid',
            headStyles: { fillColor: [0, 51, 153], fontSize: 7 },
            styles: { fontSize: 6.5, cellPadding: 1.5 },
            footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
            didDrawPage: (d) => {
                const ph = doc.internal.pageSize.height;
                doc.setFontSize(8).setFont(undefined, 'italic');
                doc.text(`Generado por: ${nombreUsuario} | Página ${doc.internal.getNumberOfPages()}`, 15, ph - 10);
            }
        });

        if (resumenSQL && (tipo === 5 || tipo === 6 || tipo === 3)) {
            doc.setFont(undefined, 'bold').setFontSize(10);
            doc.text(resumenSQL, 15, doc.lastAutoTable.finalY + 10);
        }

        Swal.close();
        doc.save(`Reporte_${titulo.replace(/ /g, "_")}.pdf`);
    } catch (error) { 
        console.error(error);
        Swal.fire('Error', 'Ocurrió un error inesperado al compilar el reporte.', 'error');
    }
};

// =======================================================================
// 9. EVENTOS DE NAVEGACIÓN ENTRE SECCIONES
// =======================================================================
document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-section');
            if (!targetId) return;
            
            document.querySelectorAll('.content-section').forEach(s => s.classList.add('d-none'));
            
            const finalId = targetId === 'reportes' ? 'section-reportes' : targetId;
            const targetSection = document.getElementById(finalId);
            
            if (targetSection) {
                targetSection.classList.remove('d-none'); 
            }
            
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});