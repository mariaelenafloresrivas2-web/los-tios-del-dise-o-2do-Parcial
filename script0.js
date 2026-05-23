const BASE_URL = "https://fuerza-g-grupo-1-samira.onrender.com";

let unidades  = [];
let entidades = [];
let entidadActual = null;

const inputUnidadActual      = document.querySelectorAll(".fila input")[0];
const inputOficinaActual     = document.querySelectorAll(".fila input")[1];
const inputResponsableActual = document.querySelectorAll(".fila input")[2];

const selectNuevaUnidad      = document.querySelectorAll(".fila select")[0];
const selectNuevaOficina     = document.querySelectorAll(".fila select")[1];
const selectNuevoResponsable = document.querySelectorAll(".fila select")[2];

const btnAceptar  = document.querySelector(".aceptar");
const btnCancelar = document.querySelector(".cancelar");

document.addEventListener("DOMContentLoaded", () => {
    cargarDatosActuales();
    cargarUnidades();
    cargarEntidades();
});

async function cargarDatosActuales() {
    try {
        const resU = await fetch(`${BASE_URL}/api/unidadadmin`);
        if (resU.ok) {
            const data = await resU.json();
            if (data.length > 0) {
                const u = data[0];
                inputUnidadActual.value = `${u.unidad} - ${u.descrip ?? ""}`;
            }
        }

        const resE = await fetch(`${BASE_URL}/api/entidades`);
        if (resE.ok) {
            const data = await resE.json();
            if (data.length > 0) {
                entidadActual = data[0];
                inputOficinaActual.value     = `${entidadActual.entidad} - ${entidadActual.desc_ent ?? ""}`;
                inputResponsableActual.value = entidadActual.desc_ent ?? "";
            }
        }
    } catch (err) {
        console.error("Error cargando datos actuales:", err);
    }
}

async function cargarUnidades() {
    try {
        const res = await fetch(`${BASE_URL}/api/unidadadmin`);
        if (!res.ok) throw new Error();
        unidades = await res.json();

        selectNuevaUnidad.innerHTML = "<option value=''>-- Seleccione Unidad --</option>";
        unidades.forEach(u => {
            const opt = document.createElement("option");
            opt.value = u.unidad;
            opt.textContent = `${u.unidad} - ${u.descrip ?? ""} (${u.ciudad ?? ""})`;
            selectNuevaUnidad.appendChild(opt);
        });
    } catch {
        console.error("Error al cargar unidades.");
    }
}

async function cargarEntidades() {
    try {
        const res = await fetch(`${BASE_URL}/api/entidades`);
        if (!res.ok) throw new Error();
        entidades = await res.json();
        poblarOficinas(entidades);
    } catch {
        console.error("Error al cargar entidades.");
    }
}

function poblarOficinas(lista) {
    selectNuevaOficina.innerHTML     = "<option value=''>-- Seleccione Oficina --</option>";
    selectNuevoResponsable.innerHTML = "<option value=''>-- Seleccione Responsable --</option>";

    lista.forEach(e => {
        const opt = document.createElement("option");
        opt.value = e.entidad;
        opt.textContent = `${e.entidad} - ${e.desc_ent ?? ""}`;
        selectNuevaOficina.appendChild(opt);
    });
}

selectNuevaUnidad.addEventListener("change", () => {
    const idUnidad = parseInt(selectNuevaUnidad.value);
    if (!idUnidad) {
        poblarOficinas(entidades);
        return;
    }
    const filtradas = entidades.filter(e => e.area_ent === idUnidad);
    poblarOficinas(filtradas.length > 0 ? filtradas : entidades);
});

selectNuevaOficina.addEventListener("change", () => {
    const idOficina = parseInt(selectNuevaOficina.value);
    selectNuevoResponsable.innerHTML = "<option value=''>-- Seleccione Responsable --</option>";
    if (!idOficina) return;

    const oficina = entidades.find(e => e.entidad === idOficina);
    if (oficina) {
        const opt = document.createElement("option");
        opt.value = oficina.entidad;
        opt.textContent = oficina.desc_ent ?? "";
        opt.selected = true;
        selectNuevoResponsable.appendChild(opt);
    }
});

btnAceptar.addEventListener("click", async () => {
    const nuevaOficinaId = parseInt(selectNuevaOficina.value);
    const nuevaUnidadId  = parseInt(selectNuevaUnidad.value);

    if (!nuevaUnidadId)  { alert("Selecciona una nueva unidad.");  return; }
    if (!nuevaOficinaId) { alert("Selecciona una nueva oficina."); return; }

    const entidadDestino = entidades.find(e => e.entidad === nuevaOficinaId);
    if (!entidadDestino) { alert("No se encontró la oficina."); return; }

    const datos = {
        ...entidadDestino,
        area_ent:   nuevaUnidadId,
        subareaent: entidadActual?.entidad ?? 0,
        nivel_inst: 1,
    };

    try {
        const res = await fetch(`${BASE_URL}/api/entidades/${nuevaOficinaId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos),
        });
        if (!res.ok) throw new Error();

        alert("Transferencia realizada correctamente.");


        const unidadObj = unidades.find(u => u.unidad === nuevaUnidadId);
        inputUnidadActual.value      = `${nuevaUnidadId} - ${unidadObj?.descrip ?? ""}`;
        inputOficinaActual.value     = `${entidadDestino.entidad} - ${entidadDestino.desc_ent ?? ""}`;
        inputResponsableActual.value = entidadDestino.desc_ent ?? "";
        entidadActual = entidadDestino;

        
        selectNuevaUnidad.value          = "";
        selectNuevoResponsable.innerHTML = "<option value=''>-- Seleccione Responsable --</option>";
        poblarOficinas(entidades);

    } catch {
        alert("Error al realizar la transferencia.");
    }
});

btnCancelar.addEventListener("click", () => {
    if (confirm("¿Deseas cancelar la transferencia?")) {
        selectNuevaUnidad.value          = "";
        selectNuevoResponsable.innerHTML = "<option value=''>-- Seleccione Responsable --</option>";
        poblarOficinas(entidades);
    }
});