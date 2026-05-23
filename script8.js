const BASE_URL = "https://fuerza-g-grupo-1-samira.onrender.com";

const selectEntidad  = document.querySelector("select");
const inputSigla     = document.querySelectorAll("input")[0];
const inputInstit    = document.querySelectorAll("input")[1];
const btnOK          = document.querySelectorAll(".btn")[0];
const btnSalir       = document.querySelectorAll(".btn")[1];

let entidades = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarEntidades();
});

async function cargarEntidades() {
    try {
        const res = await fetch(`${BASE_URL}/api/entidades`);
        if (!res.ok) throw new Error();
        entidades = await res.json();

        selectEntidad.innerHTML = "";

        entidades
            .filter(e => e.nivel_inst === 1)
            .forEach(e => {
                const opt = document.createElement("option");
                opt.value = e.entidad;
                opt.textContent = `${String(e.entidad).padStart(4,"0")} - ${e.desc_ent ?? ""}`;
                selectEntidad.appendChild(opt);
            });

        // Llenar campos con la primera entidad
        actualizarCampos();

    } catch {
        mostrarMensaje("No se pudo conectar con el servidor.", "error");
    }
}

function actualizarCampos() {
    const id = parseInt(selectEntidad.value);
    const entidad = entidades.find(e => e.entidad === id);

    if (entidad) {
        inputSigla.value  = entidad.sigla_ent  ?? "";
        inputInstit.value = entidad.desc_ent   ?? "";
    }
}

selectEntidad.addEventListener("change", actualizarCampos);

btnOK.addEventListener("click", () => {
    const id = parseInt(selectEntidad.value);
    const entidad = entidades.find(e => e.entidad === id);

    if (!entidad) {
        mostrarMensaje("Seleccione una entidad válida.", "error");
        return;
    }

    // Guardar entidad en sesión
    sessionStorage.setItem("entidad_id",    entidad.entidad);
    sessionStorage.setItem("entidad_desc",  entidad.desc_ent  ?? "");
    sessionStorage.setItem("entidad_sigla", entidad.sigla_ent ?? "");

    mostrarMensaje("Entidad seleccionada correctamente.", "ok");

    setTimeout(() => {
        window.location.href = "index.html";
    }, 1000);
});

btnSalir.addEventListener("click", () => {
    if (confirm("¿Deseas salir sin guardar?")) {
        window.location.href = "login.html";
    }
});

function mostrarMensaje(texto, tipo) {
    document.getElementById("msg-alerta")?.remove();

    const div = document.createElement("div");
    div.id = "msg-alerta";
    div.textContent = texto;
    div.classList.add("msg-alerta");

    if (tipo === "ok")    div.classList.add("msg-ok");
    if (tipo === "error") div.classList.add("msg-error");

    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}