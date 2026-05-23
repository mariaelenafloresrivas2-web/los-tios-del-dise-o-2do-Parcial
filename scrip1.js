const BASE_URL = "https://fuerza-g-grupo-1-samira.onrender.com";
let filaSeleccionada = null;
let modoNuevo = false;

document.addEventListener("DOMContentLoaded", () => {
    cargarGrupos();
    bloquearFormulario(true);
});

function abrirModal(titulo, contenido, botones) {
    document.getElementById("modal-titulo").textContent = titulo;
    document.getElementById("modal-mensaje").innerHTML = contenido;
    const divBot = document.getElementById("modal-botones");
    divBot.innerHTML = "";
    botones.forEach(b => {
        const btn = document.createElement("button");
        btn.textContent = b.texto;
        btn.style.cssText = "background:linear-gradient(#3c6f94,#2a5573);border:1px solid white;color:white;padding:4px 18px;margin:3px;font-weight:bold;cursor:pointer;font-family:Arial,sans-serif;";
        btn.onclick = () => {
            document.getElementById("modal-overlay").style.display = "none";
            b.accion();
        };
        divBot.appendChild(btn);
    });
    document.getElementById("modal-overlay").style.display = "flex";
}

function mensaje(titulo, texto) {
    return new Promise(resolve => {
        abrirModal(titulo, texto, [{ texto: "Aceptar", accion: resolve }]);
    });
}

function confirmar(titulo, texto) {
    return new Promise(resolve => {
        abrirModal(titulo, texto, [
            { texto: "Aceptar",  accion: () => resolve(true)  },
            { texto: "Cancelar", accion: () => resolve(false) }
        ]);
    });
}

function bloquearFormulario(bloquear) {
    document.getElementById("campo-partida").disabled = bloquear;
    document.getElementById("campo-descrip").disabled = bloquear;
    document.getElementById("campo-gestion").disabled = bloquear;
    document.getElementById("campo-obs").disabled     = bloquear;
}

function limpiarFormulario() {
    document.getElementById("campo-partida").value = "";
    document.getElementById("campo-descrip").value = "";
    document.getElementById("campo-gestion").value = "";
    document.getElementById("campo-obs").value     = "";
}

function cargarEnFormulario(item) {
    document.getElementById("campo-partida").value = item.partida ?? "";
    document.getElementById("campo-descrip").value = item.descrip ?? "";
    document.getElementById("campo-gestion").value = item.gestion ?? "";
    document.getElementById("campo-obs").value     = "";
}

async function cargarGrupos() {
    try {
        const res = await fetch(`${BASE_URL}/api/objgasto`);
        if (!res.ok) throw new Error("Error " + res.status);
        const datos = await res.json();
        llenarTabla(datos);
    } catch (e) {
        await mensaje("Error", "No se pudo conectar: " + e.message);
    }
}

function llenarTabla(datos) {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";
    datos.forEach(item => {
        const tr = document.createElement("tr");
        tr.dataset.partida = item.partida;
        tr.dataset.gestion = item.gestion;
        tr.dataset.descrip = item.descrip;
        tr.innerHTML = `<td>${item.partida ?? ""}</td><td>${item.descrip ?? ""}</td>`;
        tr.addEventListener("click", () => seleccionarFila(tr));
        tbody.appendChild(tr);
    });
}

function seleccionarFila(tr) {
    if (filaSeleccionada) filaSeleccionada.classList.remove("seleccionado");
    filaSeleccionada = tr;
    tr.classList.add("seleccionado");
    cargarEnFormulario({
        partida: tr.dataset.partida,
        gestion: tr.dataset.gestion,
        descrip: tr.dataset.descrip
    });
    modoNuevo = false;
}

function nuevoGrupo() {
    limpiarFormulario();
    bloquearFormulario(false);
    modoNuevo = true;
    if (filaSeleccionada) {
        filaSeleccionada.classList.remove("seleccionado");
        filaSeleccionada = null;
    }
    document.getElementById("campo-partida").focus();
}

async function guardar() {
    const partida = document.getElementById("campo-partida").value.trim();
    const descrip = document.getElementById("campo-descrip").value.trim();
    const gestion = document.getElementById("campo-gestion").value.trim();

    if (!partida || !descrip) {
        await mensaje("Atención", "Los campos Grupo y Nombre son obligatorios.");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/api/objgasto`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                partida: partida,
                gestion: parseInt(gestion) || 0,
                descrip: descrip
            })
        });
        if (!res.ok) throw new Error("Error " + res.status);
        await mensaje("Éxito", "Guardado correctamente.");
        bloquearFormulario(true);
        limpiarFormulario();
        modoNuevo = false;
        cargarGrupos();
    } catch (e) {
        await mensaje("Error", "No se pudo guardar: " + e.message);
    }
}

async function modificar() {
    if (!filaSeleccionada) {
        await mensaje("Atención", "Primero haz clic en una fila de la tabla.");
        return;
    }
    bloquearFormulario(false);
    document.getElementById("campo-partida").disabled = true;
    document.getElementById("campo-descrip").focus();
}

async function eliminar() {
    if (!filaSeleccionada) {
        await mensaje("Atención", "Primero haz clic en una fila de la tabla.");
        return;
    }
    const ok = await confirmar("Eliminar", `¿Eliminar el grupo "${filaSeleccionada.dataset.partida}"?`);
    if (!ok) return;

    try {
        const res = await fetch(`${BASE_URL}/api/objgasto/${filaSeleccionada.dataset.partida}`, {
            method: "DELETE"
        });
        if (!res.ok) throw new Error("Error " + res.status);
        await mensaje("Éxito", "Eliminado correctamente.");
        filaSeleccionada = null;
        limpiarFormulario();
        bloquearFormulario(true);
        cargarGrupos();
    } catch (e) {
        await mensaje("Error", "No se pudo eliminar: " + e.message);
    }
}

function deshacer() {
    limpiarFormulario();
    bloquearFormulario(true);
    modoNuevo = false;
    if (filaSeleccionada) {
        filaSeleccionada.classList.remove("seleccionado");
        filaSeleccionada = null;
    }
}

function salir() {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";
    limpiarFormulario();
    bloquearFormulario(true);
    filaSeleccionada = null;
    modoNuevo = false;
}