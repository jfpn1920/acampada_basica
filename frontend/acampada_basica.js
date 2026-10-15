//-----------------------------------//
//--|funcionalidad_acampada_basica|--//
//-----------------------------------//
const formulario = document.getElementById("formulario");
const inputNombre = document.getElementById("nombre");
const selectCategoria = document.getElementById("categoria");
const mensaje = document.getElementById("mensaje");
const lista = document.getElementById("lista");
const textoVacio = document.getElementById("vacio");
const textoProgreso = document.getElementById("textoProgreso");
const relleno = document.getElementById("relleno");
const textoListo = document.getElementById("listo");
const btnDesmarcar = document.getElementById("btnDesmarcar");
const botonesFiltro = document.querySelectorAll(".filtro");
const basicos = [
    { nombre: "Carpa", categoria: "Dormir" },
    { nombre: "Saco de dormir", categoria: "Dormir" },
    { nombre: "Colchoneta", categoria: "Dormir" },
    { nombre: "Agua potable", categoria: "Comida" },
    { nombre: "Comida no perecedera", categoria: "Comida" },
    { nombre: "Linterna", categoria: "Seguridad" },
    { nombre: "Botiquín", categoria: "Seguridad" },
    { nombre: "Repelente", categoria: "Otros" }
];
function crearEstadoInicial() {
    const items = [];
    for (let i = 0; i < basicos.length; i++) {
        items.push({
            id: i + 1,
            nombre: basicos[i].nombre,
            categoria: basicos[i].categoria,
            listo: false
        });
    }
    return {
        items: items,
        filtro: "todos",
        borrador: { nombre: "", categoria: "Dormir" }
    };
}
//--------------------------//
//--|almacenamiento_local|--//
//--------------------------//
const CLAVE = "acampada_estado";
function leerEstado() {
    try {
        const guardado = localStorage.getItem(CLAVE);
        if (guardado) {
            return JSON.parse(guardado);
        }
        return crearEstadoInicial();
    } catch (error) {
        return crearEstadoInicial();
    }
}
function guardarEstado() {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
}
let estado = leerEstado();
//-----------------------//
//--|funciones_objetos|--//
//-----------------------//
function agregarObjeto(evento) {
    evento.preventDefault();
    const nombre = inputNombre.value.trim();
    if (nombre.length < 2) {
        mensaje.textContent = "Escribe el nombre del objeto.";
        return;
    }
    const repetido = estado.items.some((item) => item.nombre.toLowerCase() === nombre.toLowerCase());
    if (repetido) {
        mensaje.textContent = "Ese objeto ya está en la lista.";
        return;
    }
    estado.items.push({
        id: Date.now(),
        nombre: nombre,
        categoria: selectCategoria.value,
        listo: false
    });
    estado.borrador = { nombre: "", categoria: selectCategoria.value };
    guardarEstado();
    inputNombre.value = "";
    mensaje.textContent = "";
    inputNombre.focus();
    dibujarPantalla();
}
function alternarObjeto(id) {
    const item = estado.items.find((i) => i.id === id);
    item.listo = !item.listo;
    guardarEstado();
    dibujarPantalla();
}
function eliminarObjeto(id) {
    estado.items = estado.items.filter((i) => i.id !== id);
    guardarEstado();
    dibujarPantalla();
}
function desmarcarTodo() {
    estado.items.forEach((item) => {
        item.listo = false;
    });
    guardarEstado();
    dibujarPantalla();
}
//--------------//
//--|pantalla|--//
//--------------//
function dibujarPantalla() {
    const total = estado.items.length;
    const empacados = estado.items.filter((i) => i.listo).length;
    let porcentaje = 0;
    if (total > 0) {
        porcentaje = (empacados / total) * 100;
    }
    textoProgreso.textContent = empacados + " de " + total + " objetos empacados";
    relleno.style.width = porcentaje + "%";
    textoListo.hidden = !(total > 0 && empacados === total);
    const visibles = [];
    estado.items.forEach((objeto) => {
        if (estado.filtro === "todos") {
            visibles.push(objeto);
        } else if (estado.filtro === "listos" && objeto.listo) {
            visibles.push(objeto);
        } else if (estado.filtro === "faltan" && !objeto.listo) {
            visibles.push(objeto);
        }
    });
    lista.innerHTML = "";
    visibles.forEach((objeto) => {
        const item = document.createElement("li");
        item.className = "item";
        if (objeto.listo) {
            item.className = "item empacado";
        }
        const etiqueta = document.createElement("label");
        const casilla = document.createElement("input");
        casilla.type = "checkbox";
        casilla.checked = objeto.listo;
        casilla.addEventListener("change", () => alternarObjeto(objeto.id));
        const nombre = document.createElement("span");
        nombre.className = "nombre";
        nombre.textContent = objeto.nombre;
        const categoria = document.createElement("span");
        categoria.className = "etiqueta";
        categoria.textContent = objeto.categoria;
        etiqueta.appendChild(casilla);
        etiqueta.appendChild(nombre);
        etiqueta.appendChild(categoria);
        const boton = document.createElement("button");
        boton.className = "btn-texto";
        boton.type = "button";
        boton.textContent = "Eliminar";
        boton.addEventListener("click", () => eliminarObjeto(objeto.id));
        item.appendChild(etiqueta);
        item.appendChild(boton);
        lista.appendChild(item);
    });
    textoVacio.hidden = visibles.length > 0;
    botonesFiltro.forEach((boton) => {
        boton.classList.toggle("activo", boton.dataset.filtro === estado.filtro);
    });
}
//-------------//
//--|eventos|--//
//-------------//
formulario.addEventListener("submit", agregarObjeto);
btnDesmarcar.addEventListener("click", desmarcarTodo);
botonesFiltro.forEach((boton) => {
    boton.addEventListener("click", () => {
        estado.filtro = boton.dataset.filtro;
        guardarEstado();
        dibujarPantalla();
    });
});
formulario.addEventListener("input", () => {
    estado.borrador = { nombre: inputNombre.value, categoria: selectCategoria.value };
    guardarEstado();
});
//--------------//
//--|arranque|--//
//--------------//
inputNombre.value = estado.borrador.nombre;
selectCategoria.value = estado.borrador.categoria;
dibujarPantalla();