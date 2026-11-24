// Busco los elementos de la página
let lista = document.getElementById("lista");
let archivo = document.getElementById("archivo");
let visor = document.getElementById("visor");
let barras = document.getElementById("barras");
let foto = document.getElementById("foto");
let cerrar = document.getElementById("cerrar");

//  Cargo las historias guardadas y elimino las que pasen de 24 horas
let historias = JSON.parse(localStorage.getItem("historias")) || [];
let ahora = Date.now();
historias = historias.filter(function(h) {
    return (ahora - h.fecha) < 86400000; // 24 horas en milisegundos
});
localStorage.setItem("historias", JSON.stringify(historias));

// Variables para el reproductor
let indice = 0;
let reloj;

//  Función que pinta los circulitos en pantalla
function pintarLista() {
    // Dejo el botón de "+" al inicio y agrego las imágenes
    lista.innerHTML = '<label class="botonMas" for="archivo">+</label>';
    for (let i = 0; i < historias.length; i++) {
        let img = document.createElement("img");
        img.src = historias[i].foto;
        img.className = "circulo";
        img.onclick = function() { abrir(i); };
        lista.appendChild(img);
    }
}

// cuando el usuario sube una imagen, la redimensiono y la guardo
archivo.onchange = function(evento) {
    let lector = new FileReader();
    lector.onload = function() {
        let imgOriginal = new Image();
        imgOriginal.onload = function() {
            // Uso un canvas para que la imagen no pase de 1080px de ancho
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");
            let escala = Math.min(1, 1080 / Math.max(imgOriginal.width, imgOriginal.height));
            canvas.width = imgOriginal.width * escala;
            canvas.height = imgOriginal.height * escala;
            ctx.drawImage(imgOriginal, 0, 0, canvas.width, canvas.height);

            // Guardo la imagen redimensionada en Base64
            historias.push({ foto: canvas.toDataURL("image/jpeg", 0.7), fecha: Date.now() });
            localStorage.setItem("historias", JSON.stringify(historias));
            pintarLista();
        };
        imgOriginal.src = lector.result;
    };
    lector.readAsDataURL(evento.target.files[0]);
};

// Abro el visor con la historia elegida
function abrir(i) {
    indice = i;
    visor.classList.remove("oculto");
    mostrar();
}

//  Muestro la foto y la barra de progreso (3 segundos)
function mostrar() {
    foto.src = historias[indice].foto;
    barras.innerHTML = "";

    // Creo una barra por cada historia (las anteriores llenas, la actual vacía)
    for (let i = 0; i < historias.length; i++) {
        let fondo = document.createElement("div");
        fondo.className = "barraFondo";
        let relleno = document.createElement("div");
        relleno.className = "barraLlena";

        if (i < indice) {
            relleno.style.transition = "none";
            relleno.style.width = "100%";
        }
        if (i === indice) {
            // Animación: en 3 segundos la barra actual se llena
            setTimeout(function() { relleno.style.width = "100%"; }, 50);
        }
        fondo.appendChild(relleno);
        barras.appendChild(fondo);
    }

    // Después de 3 segundos, paso a la siguiente historia
    clearTimeout(reloj);
    reloj = setTimeout(siguiente, 3000);
}

// Paso a la siguiente historia
function siguiente() {
    indice++;
    if (indice >= historias.length) {
        cerrarVisor();
    } else {
        mostrar();
    }
}

//  Cierro el visor
function cerrarVisor() {
    clearTimeout(reloj);
    visor.classList.add("oculto");
}
cerrar.onclick = cerrarVisor;

// Arranco pintando la lista
pintarLista();