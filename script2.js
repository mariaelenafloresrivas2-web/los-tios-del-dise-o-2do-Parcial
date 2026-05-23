const BASE_URL = "https://fuerza-g-grupo-1-samira.onrender.com";

let entidades = [];
let entidadSeleccionada = null;
let modoFormulario = null;

const inputCodOficina = document.querySelector(".campo-oficina input");
const selectOficina   = document.querySelector(".campo-oficina select");
const selectEstadoTop = document.querySelector(".estado");
const textareaObs     = document.querySelector("textarea");
const tbody           = document.querySelector("tbody");

const botonesAccion   = document.querySelectorAll(".acciones button");
const btnNuevoTop     = botonesAccion[0];
const btnModificarTop = botonesAccion[1];
const btnActivarTop   = botonesAccion[2];
const btnInactivarTop = botonesAccion[3];

const botonesInf  = document.querySelectorAll(".botones button");
const btnActivarInf   = botonesInf[0];
const btnInactivarInf = botonesInf[1];
const btnNuevoInf     = botonesInf[2];
const btnModificarInf = botonesInf[3];
const btnGuardar      = botonesInf[4];
const btnDeshacer     = botonesInf[5];
const btnSalir        = botonesInf[6];


document.addEventListener("DOMContentLoaded", () => {
    selectEstadoTop.innerHTML = `
        <option value="1">ACTIVO</option>
        <option value="0">INACTIVO</option>
    `;
    cargarEntidades();
    agregarEstilos();
});

async function cargarEntidades() {
    try {
        const res = await fetch(`${BASE_URL}/api/entidades`);
        if (!res.ok) throw new Error();
        entidades = await res.json();

        selectOficina.innerHTML = "";
        if (entidades.length === 0) {
            selectOficina.innerHTML = "<option>Sin registros</option>";
        } else {
            entidades.forEach(e => {
                const opt = document.createElement("option");
                opt.value = e.entidad;
                opt.textContent = `${e.entidad} - ${e.desc_ent ?? ""}`;
                selectOficina.appendChild(opt);
            });
        }

        renderizarTabla(entidades);
    } catch {
        mostrarMensaje("No se pudo conectar con el servidor.", "error");
    }
}

function renderizarTabla(lista) {
    tbody.innerHTML = "";
    const totalFilas = Math.max(lista.length, 8);

    for (let i = 0; i < totalFilas; i++) {
        const tr = document.createElement("tr");

        if (i < lista.length) {
            const e = lista[i];
            const estado = e.nivel_inst === 1 ? "ACTIVO" : "INACTIVO";
            tr.innerHTML = `
                <td>${e.entidad ?? ""}</td>
                <td>${e.desc_ent ?? ""}</td>
                <td>${e.sigla_ent ?? ""}</td>
                <td>${e.sector_ent ?? ""}</td>
                <td>${e.subsec_ent ?? ""}</td>
                <td>${estado}</td>
            `;
            tr.style.cursor = "pointer";
            tr.addEventListener("click", () => seleccionarFila(tr, e));
        } else {
            tr.innerHTML = `<td>&nbsp;</td><td></td><td></td><td></td><td></td><td></td>`;
        }

        tbody.appendChild(tr);
    }
}

function crearFilaEditable(datos = {}) {
    const tr = document.createElement("tr");
    tr.classList.add("fila-editable");

    const nuevoCod = datos.entidad ?? (
        entidades.length > 0
            ? Math.max(...entidades.map(e => e.entidad ?? 0)) + 1
            : 1
    );

    const estiloInput = `
        width:100%;
        height:20px;
        background:#fffde7;
        border:1px solid #aaa;
        font-size:12px;
        padding-left:4px;
        box-sizing:border-box;
    `;

    tr.innerHTML = `
        <td style="padding:1px;">${nuevoCod}</td>
        <td style="padding:1px;"><input id="ed-nombre"   type="text"   value="${datos.desc_ent   ?? ""}" placeholder="Nombre completo" style="${estiloInput}" tabindex="1"></td>
        <td style="padding:1px;"><input id="ed-cargo"    type="text"   value="${datos.sigla_ent  ?? ""}" placeholder="Cargo"           style="${estiloInput}" tabindex="2"></td>
        <td style="padding:1px;"><input id="ed-ci"       type="number" value="${datos.sector_ent ?? ""}" placeholder="CI"              style="${estiloInput}" tabindex="3"></td>
        <td style="padding:1px;"><input id="ed-expedido" type="number" value="${datos.subsec_ent ?? ""}" placeholder="Exp."            style="${estiloInput}" tabindex="4"></td>
        <td style="padding:1px;">
            <select id="ed-estado" style="${estiloInput}" tabindex="5">
                <option value="1" ${(datos.nivel_inst ?? 1) === 1 ? "selected" : ""}>ACTIVO</option>
                <option value="0" ${(datos.nivel_inst ?? 1) === 0 ? "selected" : ""}>INACTIVO</option>
            </select>
        </td>
    `;

    tr.querySelector("#ed-estado").addEventListener("keydown", e => {
        if (e.key === "Tab") { e.preventDefault(); guardarEntidad(); }
    });

    tr.querySelectorAll("input, select").forEach(inp => {
        inp.addEventListener("keydown", e => {
            if (e.key === "Enter") guardarEntidad();
            if (e.key === "Escape") deshacer();
        });
    });

    return { tr, nuevoCod };
}

function modoNuevo() {
    document.querySelector("tr.fila-editable")?.remove();
    document.querySelectorAll("tbody tr").forEach(r => r.classList.remove("fila-seleccionada"));

    modoFormulario = "nuevo";
    entidadSeleccionada = null;

    const { tr, nuevoCod } = crearFilaEditable();

    const filas = tbody.querySelectorAll("tr");
    let insertada = false;
    for (let fila of filas) {
        if (fila.querySelector("td")?.textContent.trim() === "\u00a0" ||
            fila.querySelector("td")?.textContent.trim() === "") {
            tbody.insertBefore(tr, fila);
            fila.remove();
            insertada = true;
            break;
        }
    }
    if (!insertada) tbody.appendChild(tr);

    inputCodOficina.value = nuevoCod;
    selectEstadoTop.value = "1";
    textareaObs.value = "";

    tr.querySelector("#ed-nombre")?.focus();
}

function modoModificar() {
    if (!entidadSeleccionada) {
        mostrarMensaje("Selecciona una fila de la tabla primero.", "error");
        return;
    }

    document.querySelector("tr.fila-editable")?.remove();
    modoFormulario = "modificar";

    const { tr } = crearFilaEditable(entidadSeleccionada);

    
    const filaSelec = document.querySelector("tr.fila-seleccionada");
    if (filaSelec) {
        tbody.replaceChild(tr, filaSelec);
    } else {
        tbody.appendChild(tr);
    }

    tr.querySelector("#ed-nombre")?.focus();
    mostrarMensaje("Edita y presiona Guardar o Enter.", "ok");
}

async function guardarEntidad() {
    const filaEdit = document.querySelector("tr.fila-editable");
    if (!filaEdit) {
        mostrarMensaje("Presiona Nuevo o Modificar primero.", "error");
        return;
    }

    const nombre   = filaEdit.querySelector("#ed-nombre")?.value?.trim() ?? "";
    const cargo    = filaEdit.querySelector("#ed-cargo")?.value?.trim() ?? "";
    const ci       = parseInt(filaEdit.querySelector("#ed-ci")?.value) || 0;
    const expedido = parseInt(filaEdit.querySelector("#ed-expedido")?.value) || 0;
    const estado   = parseInt(filaEdit.querySelector("#ed-estado")?.value) ?? 1;
    const codVal   = parseInt(inputCodOficina.value) || 0;

    if (!nombre) {
        mostrarMensaje("El campo Responsable es obligatorio.", "error");
        filaEdit.querySelector("#ed-nombre")?.focus();
        return;
    }

    const datos = {
        entidad:    codVal,
        gestion:    new Date().getFullYear(),
        desc_ent:   nombre,
        sigla_ent:  cargo,
        sector_ent: ci,
        subsec_ent: expedido,
        area_ent:   0,
        subareaent: 0,
        nivel_inst: estado,
    };

    try {
        let res;
        if (modoFormulario === "nuevo") {
            res = await fetch(`${BASE_URL}/api/entidades`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos),
            });
        } else if (modoFormulario === "modificar" && entidadSeleccionada) {
            const id = entidadSeleccionada.entidad;
            res = await fetch(`${BASE_URL}/api/entidades/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos),
            });
        }

        if (!res.ok) throw new Error();

        mostrarMensaje(
            modoFormulario === "nuevo" ? "Registrado correctamente." : "Actualizado correctamente.",
            "ok"
        );
        modoFormulario = null;
        entidadSeleccionada = null;
        await cargarEntidades();

    } catch {
        mostrarMensaje("Error al guardar. Intenta de nuevo.", "error");
    }
}


async function activarEntidad() {
    if (!entidadSeleccionada) { mostrarMensaje("Selecciona una fila.", "error"); return; }
    try {
        const res = await fetch(`${BASE_URL}/api/entidades/${entidadSeleccionada.entidad}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...entidadSeleccionada, nivel_inst: 1 }),
        });
        if (!res.ok) throw new Error();
        mostrarMensaje("Activado correctamente.", "ok");
        entidadSeleccionada = null;
        await cargarEntidades();
    } catch { mostrarMensaje("Error al activar.", "error"); }
}


async function inactivarEntidad() {
    if (!entidadSeleccionada) { mostrarMensaje("Selecciona una fila.", "error"); return; }
    try {
        const res = await fetch(`${BASE_URL}/api/entidades/${entidadSeleccionada.entidad}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...entidadSeleccionada, nivel_inst: 0 }),
        });
        if (!res.ok) throw new Error();
        mostrarMensaje("Inactivado correctamente.", "ok");
        entidadSeleccionada = null;
        await cargarEntidades();
    } catch { mostrarMensaje("Error al inactivar.", "error"); }
}


function seleccionarFila(tr, entidad) {
    if (document.querySelector("tr.fila-editable")) return;
    document.querySelectorAll("tbody tr").forEach(r => r.classList.remove("fila-seleccionada"));
    tr.classList.add("fila-seleccionada");
    entidadSeleccionada = entidad;
    inputCodOficina.value = entidad.entidad ?? "";
    selectEstadoTop.value = entidad.nivel_inst ?? 1;
    for (let opt of selectOficina.options) {
        if (opt.value == entidad.entidad) { opt.selected = true; break; }
    }
}

function deshacer() {
    modoFormulario = null;
    entidadSeleccionada = null;
    renderizarTabla(entidades);
    inputCodOficina.value = "";
    textareaObs.value = "";
}

function mostrarMensaje(texto, tipo) {
    document.getElementById("msg-alerta")?.remove();
    const div = document.createElement("div");
    div.id = "msg-alerta";
    div.textContent = texto;
    div.style.cssText = `
        position:fixed; top:15px; right:15px;
        padding:10px 18px; border-radius:4px;
        font-size:13px; font-weight:bold; color:white;
        z-index:9999;
        background:${tipo === "ok" ? "#2a7a2a" : "#a02020"};
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}


function agregarEstilos() {
    const style = document.createElement("style");
    style.textContent = `
        tbody tr.fila-seleccionada td { background-color:#b8d4f0 !important; font-weight:bold; }
        tbody tr.fila-editable td    { background-color:#fffde7 !important; }
        tbody tr:hover td            { background-color:#dceeff; }
    `;
    document.head.appendChild(style);
}

btnNuevoTop.addEventListener("click",      modoNuevo);
btnModificarTop.addEventListener("click",  modoModificar);
btnActivarTop.addEventListener("click",    activarEntidad);
btnInactivarTop.addEventListener("click",  inactivarEntidad);
btnNuevoInf.addEventListener("click",      modoNuevo);
btnModificarInf.addEventListener("click",  modoModificar);
btnActivarInf.addEventListener("click",    activarEntidad);
btnInactivarInf.addEventListener("click",  inactivarEntidad);
btnGuardar.addEventListener("click",       guardarEntidad);
btnDeshacer.addEventListener("click",      deshacer);
btnSalir.addEventListener("click", () => {
    if (confirm("¿Deseas salir de esta pantalla?")) window.history.back();
});