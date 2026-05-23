const BASE_URL = "https://fuerza-g-grupo-1-samira.onrender.com";

const tbody         = document.querySelector("tbody");
const btnNuevo      = document.querySelectorAll(".btn")[0];
const btnEditar     = document.querySelectorAll(".btn")[1];
const btnEliminar   = document.querySelectorAll(".btn")[2];
const btnSeleccionar= document.querySelectorAll(".btn")[3];
const btnSalir      = document.querySelectorAll(".btn")[4];

let unidades = [];
let filaSeleccionada = null;
let unidadSeleccionada = null;

document.addEventListener("DOMContentLoaded", () => {
    cargarUnidades();
});

async function cargarUnidades() {
    try {
        const res = await fetch(`${BASE_URL}/unidadadmin`);
        if (!res.ok) throw new Error();
        unidades = await res.json();
        renderizarTabla(unidades);
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
            const u = lista[i];
            tr.innerHTML = `
                <td>${String(u.unidad ?? "").padStart(3, "0")}</td>
                <td>${u.desc_unidad ?? ""}</td>
                <td>${u.ciudad ?? ""}</td>
            `;
            tr.style.cursor = "pointer";
            tr.addEventListener("click", () => seleccionarFila(tr, u));
        } else {
            tr.innerHTML = `<td></td><td></td><td></td>`;
        }

        tbody.appendChild(tr);
    }
}

function seleccionarFila(tr, unidad) {
    if (document.querySelector("tr.fila-editable")) return;
    document.querySelectorAll("tbody tr").forEach(r => r.classList.remove("seleccionado"));
    tr.classList.add("seleccionado");
    filaSeleccionada = tr;
    unidadSeleccionada = unidad;
}

btnNuevo.addEventListener("click", () => {
    document.querySelector("tr.fila-editable")?.remove();
    document.querySelectorAll("tbody tr").forEach(r => r.classList.remove("seleccionado"));
    unidadSeleccionada = null;

    const tr = document.createElement("tr");
    tr.classList.add("fila-editable");
    tr.innerHTML = `
        <td><input id="ed-unidad" type="number" placeholder="Unidad"      style="width:100%;height:18px;"></td>
        <td><input id="ed-desc"   type="text"   placeholder="Descripción" style="width:100%;height:18px;"></td>
        <td><input id="ed-ciudad" type="text"   placeholder="Ciudad"      style="width:100%;height:18px;"></td>
    `;

    const filas = tbody.querySelectorAll("tr");
    let insertada = false;
    for (let fila of filas) {
        if (fila.querySelector("td")?.textContent.trim() === "") {
            tbody.insertBefore(tr, fila);
            fila.remove();
            insertada = true;
            break;
        }
    }
    if (!insertada) tbody.appendChild(tr);

    tr.querySelectorAll("input").forEach(inp => {
        inp.addEventListener("keydown", e => {
            if (e.key === "Enter")  guardarNuevo();
            if (e.key === "Escape") cancelarEdicion();
        });
    });

    tr.querySelector("#ed-unidad")?.focus();
});

async function guardarNuevo() {
    const filaEdit = document.querySelector("tr.fila-editable");
    if (!filaEdit) return;

    const unidad  = parseInt(filaEdit.querySelector("#ed-unidad")?.value) || 0;
    const desc    = filaEdit.querySelector("#ed-desc")?.value?.trim() ?? "";
    const ciudad  = filaEdit.querySelector("#ed-ciudad")?.value?.trim() ?? "";

    if (!desc) {
        mostrarMensaje("La descripción es obligatoria.", "error");
        filaEdit.querySelector("#ed-desc")?.focus();
        return;
    }

    const datos = { unidad, desc_unidad: desc, ciudad };

    try {
        const res = await fetch(`${BASE_URL}/unidadadmin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos),
        });
        if (!res.ok) throw new Error();
        mostrarMensaje("Unidad registrada correctamente.", "ok");
        await cargarUnidades();
    } catch {
        mostrarMensaje("Error al registrar.", "error");
    }
}

btnEditar.addEventListener("click", () => {
    if (!unidadSeleccionada) {
        mostrarMensaje("Selecciona una fila primero.", "error");
        return;
    }

    document.querySelector("tr.fila-editable")?.remove();
    const u = unidadSeleccionada;

    const tr = document.createElement("tr");
    tr.classList.add("fila-editable");
    tr.innerHTML = `
        <td>${String(u.unidad ?? "").padStart(3, "0")}</td>
        <td><input id="ed-desc"   type="text" value="${u.desc_unidad ?? ""}" style="width:100%;height:18px;"></td>
        <td><input id="ed-ciudad" type="text" value="${u.ciudad ?? ""}"      style="width:100%;height:18px;"></td>
    `;

    if (filaSeleccionada) {
        tbody.replaceChild(tr, filaSeleccionada);
    }

    tr.querySelectorAll("input").forEach(inp => {
        inp.addEventListener("keydown", e => {
            if (e.key === "Enter")  guardarEdicion();
            if (e.key === "Escape") cancelarEdicion();
        });
    });

    tr.querySelector("#ed-desc")?.focus();
    mostrarMensaje("Edita y presiona Enter para guardar.", "info");
});

async function guardarEdicion() {
    const filaEdit = document.querySelector("tr.fila-editable");
    if (!filaEdit || !unidadSeleccionada) return;

    const desc   = filaEdit.querySelector("#ed-desc")?.value?.trim() ?? "";
    const ciudad = filaEdit.querySelector("#ed-ciudad")?.value?.trim() ?? "";

    if (!desc) {
        mostrarMensaje("La descripción es obligatoria.", "error");
        return;
    }

    const datos = {
        ...unidadSeleccionada,
        desc_unidad: desc,
        ciudad,
    };

    try {
        const res = await fetch(`${BASE_URL}/unidadadmin/${unidadSeleccionada.unidad}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos),
        });
        if (!res.ok) throw new Error();
        mostrarMensaje("Unidad actualizada correctamente.", "ok");
        unidadSeleccionada = null;
        await cargarUnidades();
    } catch {
        mostrarMensaje("Error al actualizar.", "error");
    }
}

btnEliminar.addEventListener("click", async () => {
    if (!unidadSeleccionada) {
        mostrarMensaje("Selecciona una fila primero.", "error");
        return;
    }

    if (!confirm(`¿Eliminar la unidad "${unidadSeleccionada.desc_unidad}"?`)) return;

    try {
        const res = await fetch(`${BASE_URL}/unidadadmin/${unidadSeleccionada.unidad}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error();
        mostrarMensaje("Unidad eliminada correctamente.", "ok");
        unidadSeleccionada = null;
        filaSeleccionada = null;
        await cargarUnidades();
    } catch {
        mostrarMensaje("Error al eliminar.", "error");
    }
});

btnSeleccionar.addEventListener("click", () => {
    if (!unidadSeleccionada) {
        mostrarMensaje("Selecciona una fila primero.", "error");
        return;
    }
    sessionStorage.setItem("unidad_id",   unidadSeleccionada.unidad);
    sessionStorage.setItem("unidad_desc", unidadSeleccionada.desc_unidad ?? "");
    mostrarMensaje("Unidad seleccionada correctamente.", "ok");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1000);
});

btnSalir.addEventListener("click", () => {
    if (confirm("¿Deseas salir?")) {
        window.location.href = "index.html";
    }
});

function cancelarEdicion() {
    unidadSeleccionada = null;
    filaSeleccionada = null;
    cargarUnidades();
}

function mostrarMensaje(texto, tipo) {
    document.getElementById("msg-alerta")?.remove();
    const div = document.createElement("div");
    div.id = "msg-alerta";
    div.textContent = texto;
    div.classList.add("msg-alerta");
    if (tipo === "ok")    div.classList.add("msg-ok");
    if (tipo === "error") div.classList.add("msg-error");
    if (tipo === "info")  div.classList.add("msg-info");
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}