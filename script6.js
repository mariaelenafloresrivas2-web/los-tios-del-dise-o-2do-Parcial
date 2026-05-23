const API_URL = "https://grupo-3-s55k.onrender.com/organismos";
const inputCodigo      = document.getElementById('inputCodigo');
const inputCiudad      = document.getElementById('inputCiudad');
const inputDescripcion = document.getElementById('inputDescripcion');
const btnGrabar      = document.getElementById('btnGrabar');
const btnSalir       = document.getElementById('btnSalir');
const ventanaModal   = document.getElementById('ventanaModal');
const iconoModal     = document.getElementById('iconoModal');
const textoModal     = document.getElementById('textoModal');
const btnAceptar     = document.getElementById('btnAceptar');
const btnCerrarModal = document.getElementById('btnCerrarModal');
function mostrarModal(mensaje, esError = false) {
    textoModal.textContent     = mensaje;
    iconoModal.textContent     = esError ? '!' : 'i';
    iconoModal.className       = esError ? 'icono error' : 'icono';
    ventanaModal.style.display = 'block';
}

function cerrarModal() {
    ventanaModal.style.display = 'none';
}

btnAceptar.addEventListener('click', cerrarModal);
btnCerrarModal.addEventListener('click', cerrarModal);

function validar() {
    if (!inputCodigo.value.trim()) {
        mostrarModal('El campo Unidad Administrativa es obligatorio.', true);
        return false;
    }
    if (!inputCiudad.value.trim()) {
        mostrarModal('El campo Ciudad es obligatorio.', true);
        return false;
    }
    if (!inputDescripcion.value.trim()) {
        mostrarModal('El campo Descripción es obligatorio.', true);
        return false;
    }
    return true;
}

async function existeRegistro(sigla) {
    try {
        const res = await fetch(`${API_URL}/${sigla}`);
        return res.ok;
    } catch {
        return false;
    }
}

btnGrabar.addEventListener('click', async () => {
    if (!validar()) return;

    const datos = {
        of:      inputCodigo.value.trim(),
        sigla:   inputCiudad.value.trim(),
        des:     inputDescripcion.value.trim(),
        gestion: new Date().getFullYear()
    };

    btnGrabar.disabled = true;

    try {
        const existe = await existeRegistro(datos.sigla);

        let res;
        if (existe) {
            res = await fetch(`${API_URL}/${datos.sigla}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
        } else {
            res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos)
            });
        }

        if (!res.ok) throw new Error("Error en el servidor: " + res.status);

        mostrarModal('Los datos fueron ingresados correctamente');
        inputCodigo.value      = "";
        inputCiudad.value      = "";
        inputDescripcion.value = "";

    } catch (e) {
        mostrarModal('Ocurrió un error al grabar: ' + e.message, true);
    } finally {
        btnGrabar.disabled = false;
    }
});

btnSalir.addEventListener('click', () => {
    if (confirm('¿Desea salir del módulo?')) {
        window.close();
    }
});