

const minimizar = document.querySelectorAll(".btn-control")[0];
const maximizar = document.querySelectorAll(".btn-control")[1];
const cerrar = document.querySelectorAll(".btn-control")[2];

const ventana = document.querySelector(".ventana");
minimizar.addEventListener("click", () => {

    ventana.style.display = "none";

});
maximizar.addEventListener("click", () => {

    if (ventana.style.width === "100%") {

        ventana.style.width = "90%";
        ventana.style.height = "90vh";
        ventana.style.margin = "20px auto";

    } else {

        ventana.style.width = "100%";
        ventana.style.height = "100vh";
        ventana.style.margin = "0";

    }

});
cerrar.addEventListener("click", () => {

    ventana.style.display = "none";

});

const botones = document.querySelectorAll(".btn");

botones.forEach((boton) => {

    boton.addEventListener("click", () => {

        botones.forEach((b) => {

            b.classList.remove("activo");

        });

        boton.classList.add("activo");

    });

});
const usuario = document.querySelector(".usuario");

const reloj = document.createElement("p");

usuario.appendChild(reloj);

function actualizarHora() {

    const fecha = new Date();

    reloj.innerHTML =
        "FECHA: " +
        fecha.toLocaleDateString() +
        " | HORA: " +
        fecha.toLocaleTimeString();

}

setInterval(actualizarHora, 1000);

actualizarHora();
const API_URL =
"https://fuerza-g-grupo-1-samira.onrender.com";
async function obtenerDatos() {

    try {

        const respuesta = await fetch(API_URL);

        const datos = await respuesta.json();

        console.log("DATOS API");
        console.log(datos);

    } catch (error) {

        console.log("ERROR API");
        console.error(error);

    }

}

obtenerDatos();
async function iniciarSesion(usuarioLogin, passwordLogin) {

    try {

        const respuesta = await fetch(API_URL + "/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                username: usuarioLogin,
                password: passwordLogin

            })

        });

        const datos = await respuesta.json();

        console.log("LOGIN API");
        console.log(datos);

    } catch (error) {

        console.log("ERROR LOGIN");
        console.error(error);

    }

}
botones.forEach((boton) => {

    boton.addEventListener("click", () => {

        console.log("CLICK EN:", boton.innerText);
    });
});