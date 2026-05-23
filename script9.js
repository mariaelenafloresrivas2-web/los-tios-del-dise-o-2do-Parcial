const BASE_URL = "https://fuerza-g-grupo-1-samira.onrender.com";

const inputUsuario    = document.querySelectorAll(".campo input")[0];
const inputContrasena = document.querySelectorAll(".campo input")[1];
const btnAceptar      = document.querySelector(".inferior-login button");

const USUARIO_VALIDO    = "admin";
const CONTRASENA_VALIDA = "12345";

btnAceptar.addEventListener("click", iniciarSesion);

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") iniciarSesion();
});

async function iniciarSesion() {
    const usuario    = inputUsuario.value.trim();
    const contrasena = inputContrasena.value.trim();

    if (!usuario || !contrasena) {
        mostrarMensaje("Complete todos los campos.", "error");
        return;
    }

    if (usuario !== USUARIO_VALIDO || contrasena !== CONTRASENA_VALIDA) {
        mostrarMensaje("Usuario o contraseña incorrectos.", "error");
        inputContrasena.value = "";
        inputUsuario.focus();
        return;
    }

    mostrarMensaje("Verificando conexión...", "info");

    try {
        const res = await fetch(`${BASE_URL}/api/entidades`);

        if (!res.ok) throw new Error();

        mostrarMensaje("Acceso correcto. Ingresando...", "ok");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

    } catch {
        mostrarMensaje("No se pudo conectar con el servidor SIAF.", "error");
    }
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

    if (tipo !== "info") {
        setTimeout(() => div.remove(), 3000);
    }
}