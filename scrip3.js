const BASE_URL = "https://fuerza-g-grupo-1-samira.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    cargarGestiones();
});

async function cargarGestiones() {
    try {
        const res = await fetch(`${BASE_URL}/api/entidades`);
        if (!res.ok) throw new Error("Error " + res.status);
        const datos = await res.json();
        const select = document.getElementById("select-entidades");
        select.innerHTML = "";
        datos.forEach(item => {
            const op = document.createElement("option");
            op.value = item.entidad;
            op.dataset.gestion = item.gestion;
            op.textContent = `${item.gestion} - ${item.desc_ent}`;
            select.appendChild(op);
        });
    } catch (e) {
        mostrarVentana("Error al cargar entidades: " + e.message);
    }
}

function cerrarGestion() {
    document.getElementById("ventana-msg").textContent = "Es usted el unico usuario del sistema";
    document.getElementById("ventana").style.display = "block";
}

function cambiarGestion() {
    const select = document.getElementById("select-entidades");
    const opcion = select.options[select.selectedIndex];
    if (opcion && opcion.dataset.gestion) {
        document.getElementById("input-gestion").value = opcion.dataset.gestion;
    } else {
        mostrarVentana("Seleccione una entidad de la lista.");
    }
}

async function confirmarSi() {
    const select  = document.getElementById("select-entidades");
    const entidad = select.value;
    if (!entidad) {
        mostrarVentana("Seleccione una entidad primero.");
        return;
    }
    try {
        const res = await fetch(`${BASE_URL}/api/entidades/${entidad}`);
        if (!res.ok) throw new Error("Error " + res.status);
        const dato = await res.json();
        document.getElementById("input-gestion").value = dato.gestion;
        document.getElementById("ventana").style.display = "none";
    } catch (e) {
        mostrarVentana("Error: " + e.message);
    }
}

function confirmarNo() {
    document.getElementById("ventana").style.display = "none";
}

function salir() {
    document.getElementById("input-gestion").value = "";
    document.getElementById("select-entidades").innerHTML = "<option></option>";
    document.getElementById("ventana-msg").textContent = "Es usted el unico usuario del sistema";
}

function mostrarVentana(msg) {
    document.getElementById("ventana-msg").textContent = msg;
    document.getElementById("ventana").style.display = "block";
}