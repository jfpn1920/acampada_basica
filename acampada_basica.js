// ===== REFERENCIAS A LOS ELEMENTOS DEL HTML =====
const formulario = document.getElementById('formulario');
const inputNombre = document.getElementById('nombre');
const selectCategoria = document.getElementById('categoria');
const mensaje = document.getElementById('mensaje');
const lista = document.getElementById('lista');
const textoVacio = document.getElementById('vacio');
const textoProgreso = document.getElementById('textoProgreso');
const relleno = document.getElementById('relleno');
const textoListo = document.getElementById('listo');
const btnDesmarcar = document.getElementById('btnDesmarcar');
const botonesFiltro = document.querySelectorAll('.filtro');
// ===== CLAVE DE LOCALSTORAGE =====
const CLAVE = 'acampada_estado';
// ===== OBJETOS BÁSICOS (solo se usan la primera vez) =====
const basicos = [
    ['Carpa', 'Dormir'], ['Saco de dormir', 'Dormir'], ['Colchoneta', 'Dormir'],
    ['Agua potable', 'Comida'], ['Comida no perecedera', 'Comida'],
    ['Linterna', 'Seguridad'], ['Botiquín', 'Seguridad'], ['Repelente', 'Otros']
];
// ===== ESTADO POR DEFECTO =====
// items: lista de objetos | filtro: vista actual | borrador: lo escrito en el formulario
// Es una función para crear una copia nueva cada vez
function crearEstadoInicial() {
    return {
        items: basicos.map(([nombre, categoria], i) => ({ id: i + 1, nombre, categoria, listo: false })),
        filtro: 'todos',
        borrador: { nombre: '', categoria: 'Dormir' }
    };
}
// ===== LEER EL ESTADO GUARDADO =====
function leerEstado() {
    try {
        const guardado = localStorage.getItem(CLAVE);
        // Si hay datos guardados los usamos; si no, creamos el estado inicial
        return guardado ? { ...crearEstadoInicial(), ...JSON.parse(guardado) } : crearEstadoInicial();
    } catch (error) {
      return crearEstadoInicial(); // si algo falla, empezamos desde cero
    }
}
// Al cargar la página recuperamos todo lo guardado
let estado = leerEstado();
// ===== GUARDAR EL ESTADO =====
function guardarEstado() {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
}
// ===== AGREGAR UN OBJET =====
function agregarObjeto(evento) {
    evento.preventDefault();  // evita que la página se recargue
    const nombre = inputNombre.value.trim();
    // Validaciones: si algo está mal, mostramos el error y salimos
    if (nombre.length < 2) return (mensaje.textContent = 'Escribe el nombre del objeto.');
    if (estado.items.some(i => i.nombre.toLowerCase() === nombre.toLowerCase())) {
        return (mensaje.textContent = 'Ese objeto ya está en la lista.');
    }
    estado.items.push({ id: Date.now(), nombre, categoria: selectCategoria.value, listo: false });
    estado.borrador = { nombre: '', categoria: selectCategoria.value };
    guardarEstado();
    inputNombre.value = '';
    mensaje.textContent = '';
    inputNombre.focus();
    dibujarPantalla();
}
// ===== MARCAR O DESMARCAR UN OBJETO COMO EMPACADO =====
function alternarObjeto(id) {
    const item = estado.items.find(i => i.id === id);
    item.listo = !item.listo;  // invierte el valor (true pasa a false y viceversa)
    guardarEstado();
    dibujarPantalla();
}
// ===== ELIMINAR UN OBJETO =====
function eliminarObjeto(id) {
    estado.items = estado.items.filter(i => i.id !== id);  // conserva todos menos ese id
    guardarEstado();
    dibujarPantalla();
}
// ===== QUITAR TODAS LAS MARCAS =====
function desmarcarTodo() {
    estado.items.forEach(item => { item.listo = false; });
    guardarEstado();
    dibujarPantalla();
}
// ===== ACTUALIZAR TODO LO QUE SE VE EN PANTALLA =====
function dibujarPantalla() {
    // Progreso: cuántos objetos están empacados
    const total = estado.items.length;
    const empacados = estado.items.filter(i => i.listo).length;
    const porcentaje = total ? (empacados / total) * 100 : 0;
    textoProgreso.textContent = `${empacados} de ${total} objetos empacados`;
    relleno.style.width = porcentaje + '%';
    textoListo.hidden = !(total > 0 && empacados === total);  // solo si todo está empacado
    // Según el filtro mostramos todos, los que faltan o los empacados
    const visibles = estado.items.filter(i =>
        estado.filtro === 'todos' || (estado.filtro === 'listos' ? i.listo : !i.listo));
    lista.innerHTML = '';
    visibles.forEach(objeto => {
        const item = document.createElement('li');
        item.className = objeto.listo ? 'item listo' : 'item';
        // Parte izquierda: casilla, nombre y categoría (toda dentro de un <label>)
        const etiqueta = document.createElement('label');
        etiqueta.innerHTML = '<input type="checkbox"><span class="nombre"></span><span class="etiqueta"></span>';
        etiqueta.querySelector('input').checked = objeto.listo;
        etiqueta.querySelector('input').addEventListener('change', () => alternarObjeto(objeto.id));
        etiqueta.querySelector('.nombre').textContent = objeto.nombre;
        etiqueta.querySelector('.etiqueta').textContent = objeto.categoria;
        // Botón para eliminar solo este objeto
        const boton = document.createElement('button');
        boton.className = 'btn-texto';
        boton.type = 'button';
        boton.textContent = 'Eliminar';
        boton.addEventListener('click', () => eliminarObjeto(objeto.id));
        item.append(etiqueta, boton);
        lista.appendChild(item);
    });
    textoVacio.hidden = visibles.length > 0;  // mensaje si no hay objetos en la vista
    botonesFiltro.forEach(b => b.classList.toggle('activo', b.dataset.filtro === estado.filtro));
}
// ===== EVENTOS =====
formulario.addEventListener('submit', agregarObjeto);
btnDesmarcar.addEventListener('click', desmarcarTodo);
botonesFiltro.forEach(boton => boton.addEventListener('click', () => {
    estado.filtro = boton.dataset.filtro;
    guardarEstado();
    dibujarPantalla();
}));
// Guarda lo que se escribe en el formulario para no perderlo al refrescar
formulario.addEventListener('input', () => {
    estado.borrador = { nombre: inputNombre.value, categoria: selectCategoria.value };
    guardarEstado();
});
// ===== INICIO: se ejecuta al cargar o refrescar la página =====
inputNombre.value = estado.borrador.nombre;        // recupera el borrador
selectCategoria.value = estado.borrador.categoria;
dibujarPantalla();                                  // dibuja la lista guardada