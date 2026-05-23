const BASE_URL = "https://fuerza-g-grupo-1-samira.onrender.com";
let filaSeleccionada = null;

document.addEventListener("DOMContentLoaded", () => {
    cargarUnidades();
});

async function cargarUnidades() {
    try {
        const res = await fetch(`${BASE_URL}/unidadadmin`);
        if (!res.ok) throw new Error("Error " + res.status);
        const datos = await res.json();
        llenarTabla(datos);
    } catch (e) {
        alert("Error al cargar: " + e.message);
    }
}

function llenarTabla(datos) {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";
    datos.forEach((item) => {
        const tr = document.createElement("tr");
        tr.dataset.entidad = item.entidad;
        tr.dataset.unidad  = item.unidad;
        tr.dataset.descrip = item.descrip;
        tr.dataset.ciudad  = item.ciudad;
        tr.innerHTML = `
            <td>${item.unidad  ?? ""}</td>
            <td>${item.descrip ?? ""}</td>
            <td>${item.ciudad  ?? ""}</td>
        `;
        tr.addEventListener("click", () => seleccionarFila(tr));
        tbody.appendChild(tr);
    });
    while (tbody.rows.length < 8) {
        const tr = document.createElement("tr");
        tr.innerHTML = "<td></td><td></td><td></td>";
        tbody.appendChild(tr);
    }
}

function seleccionarFila(tr) {
    if (filaSeleccionada) filaSeleccionada.classList.remove("seleccionado");
    filaSeleccionada = tr;
    tr.classList.add("seleccionado");
}

async function nuevaUnidad() {
    const entidad = prompt("Entidad (número):");
    if (!entidad) return;
    const unidad  = prompt("Código de unidad (número):");
    if (!unidad) return;
    const descrip = prompt("Descripción:");
    if (!descrip) return;
    const ciudad  = prompt("Ciudad:");
    if (!ciudad) return;

    try {
        const res = await fetch(`${BASE_URL}/unidadadmin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                entidad: parseInt(entidad),
                unidad:  parseInt(unidad),
                descrip: descrip,
                ciudad:  ciudad
            })
        });
        if (!res.ok) throw new Error("Error " + res.status);
        alert("Unidad creada correctamente");
        cargarUnidades();
    } catch (e) {
        alert("Error al crear: " + e.message);
    }
}

async function editarUnidad() {
    if (!filaSeleccionada || !filaSeleccionada.dataset.unidad) {
        alert("Primero haz clic en una fila de la tabla.");
        return;
    }
    const descrip = prompt("Nueva descripción:", filaSeleccionada.dataset.descrip);
    if (descrip === null) return;
    const ciudad  = prompt("Nueva ciudad:", filaSeleccionada.dataset.ciudad);
    if (ciudad === null) return;

    try {
        const res = await fetch(`${BASE_URL}/unidadadmin/${filaSeleccionada.dataset.unidad}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                entidad: parseInt(filaSeleccionada.dataset.entidad),
                unidad:  parseInt(filaSeleccionada.dataset.unidad),
                descrip: descrip,
                ciudad:  ciudad
            })
        });
        if (!res.ok) throw new Error("Error " + res.status);
        alert("Unidad actualizada correctamente");
        filaSeleccionada = null;
        cargarUnidades();
    } catch (e) {
        alert("Error al editar: " + e.message);
    }
}

async function eliminarUnidad() {
    if (!filaSeleccionada || !filaSeleccionada.dataset.unidad) {
        alert("Primero haz clic en una fila de la tabla.");
        return;
    }
    if (!confirm(`¿Eliminar la unidad "${filaSeleccionada.dataset.unidad}"?`)) return;

    try {
        const res = await fetch(`${BASE_URL}/unidadadmin/${filaSeleccionada.dataset.unidad}`, {
            method: "DELETE"
        });
        if (!res.ok) throw new Error("Error " + res.status);
        alert("Unidad eliminada correctamente");
        filaSeleccionada = null;
        cargarUnidades();
    } catch (e) {
        alert("Error al eliminar: " + e.message);
    }
}

function salir() {
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";
    while (tbody.rows.length < 8) {
        const tr = document.createElement("tr");
        tr.innerHTML = "<td></td><td></td><td></td>";
        tbody.appendChild(tr);
    }
    filaSeleccionada = null;
}