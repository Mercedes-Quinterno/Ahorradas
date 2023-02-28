/*reloj en fecha y hora*/
let $inputDate = document.querySelector(".inputDate");
let fecha = new Date();
let mes = fecha.getMonth() + 1;
let dia = fecha.getDate();
let anio = fecha.getFullYear();
if (dia < 10) dia = "0" + dia;
if (mes < 10) mes = "0" + mes;
let fechaActualParaInput = `${anio}-${mes}-${dia}`;
$inputDate.value = fechaActualParaInput;


/*Despliegue navegador*/
const $navbarBurgers = Array.prototype.slice.call(
  document.querySelectorAll(".navbar-burger"),
  0
);
$navbarBurgers.forEach((el) => {
  el.addEventListener("click", () => {
    const target = el.dataset.target;
    const $target = document.getElementById(target);
    el.classList.toggle("is-active");
    $target.classList.toggle("is-active");
  });
});

/* Local Storage */

const obtenerDatos = () => {
  return JSON.parse(localStorage.getItem('datos'))
}

const actualizarDatos = (datos) => {
  localStorage.setItem('datos', JSON.stringify({ ...obtenerDatos(), ...datos }))
  mostrarDatos()
}

const mostrarDatos = () => {
  actualizarCategorias()
  actualizarOperaciones()
  actualizarBalance()
  filtrarOperaciones()
  actualizarReportes()
}

const obtenerCategorias = () => {
  return obtenerDatos().categorias
}

const obtenerOperaciones = () => {
  return obtenerDatos().operaciones
}

/* DOM */

/* Auxiliares */

function $(elem) {
	return document.querySelector(elem);
}
function $$(elem) {
	return document.querySelectorAll(elem);
}

/* Operaciones */

const actualizarOperaciones = (operaciones = obtenerOperaciones()) => {
  if (!operaciones.length) {
    $('#sin-operaciones').classList.remove('is-hidden')
    $('#operaciones').classList.add('is-hidden')
    return
  }

  $('#operaciones').classList.remove('is-hidden')
  $('#sin-operaciones').classList.add('is-hidden')

  const lista = $('#tabla-operaciones')

  lista.innerHTML = ''

  operaciones.forEach((operacion) => {
    const categoria = obtenerCategoria(operacion.Categoria, obtenerCategorias())
    const itemOperacion = document.createElement('tr')
    const fecha = new Date(operacion.Fecha)

    itemOperacion.innerHTML = `
	  <th>${operacion.Titulo}</th>
	  <td><span class="tag is-primary is-light">${categoria.Nombre}</span></td>
	  <td>${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}</td>
	  <td class="${
          operacion.Tipo === OPERACIONES.GANANCIA
            ? 'has-text-success'
            : 'has-text-danger'
        }">${operacion.Tipo === OPERACIONES.GANANCIA ? '+' : '-'}$${operacion.Monto}</td>
	  <td><div class="field is-grouped">
		  <p class="control"><button class="editar-operacion button is-info">Editar</button></p>
		  <p class="control"><button class="eliminar-operacion button is-danger">Eliminar</button></p>
		</div></td> 
    `

    const editarAccion = itemOperacion.querySelector('.editar-operacion')
    const eliminarAccion = itemOperacion.querySelector('.eliminar-operacion')

    editarAccion.onclick = () => {
      cargarDatosOperacion(operacion)
      mostrarSeccion('editar-operacion')
    }

    eliminarAccion.onclick = () => {
		const operaciones = eliminarOperacion(operacion.Id, obtenerOperaciones());
		actualizarDatos({operaciones});
    }

    lista.append(itemOperacion)
  })
}

const ordenamientos = {
	"mas-reciente": (operaciones) => ordenarPorFecha(operaciones, 'DESC'),
	"menos-reciente": (operaciones) => ordenarPorFecha(operaciones, 'ASC'),
	"mayor-monto": (operaciones) => ordenarPorMonto(operaciones, 'DESC'),
	"menor-monto": (operaciones) => ordenarPorMonto(operaciones, 'ASC'),
	"a-z": (operaciones) => ordenarPorDescripcion(operaciones, 'ASC'),
	"z-a": (operaciones) => ordenarPorDescripcion(operaciones, 'DESC'),
}

const filtrarOperaciones = () => {
  const tipo = $("#select-filtro-tipos").value
  const categoria = $("#select-filtro-categoria").value
  const fecha = new Date($("#filtro-fecha").value.replace(/-/g, "/"))
  const orden = $("#select-filtro-orden").value

  let operaciones = obtenerOperaciones()

  if (tipo !== 'todos') {
    operaciones = filtrarPorTipo(tipo, operaciones)
  }

  if (categoria !== 'todas') {
    operaciones = filtrarPorCategoria(categoria, operaciones)
  }

  operaciones = filtrarPorFecha(fecha, operaciones)
  
  operaciones = ordenamientos[orden](operaciones)

  actualizarOperaciones(operaciones)
  actualizarBalance(operaciones)
}

const cargarDatosOperacion = (operacion) => {
	const tituloOperacion = $("#editar-titulo-operacion")
	tituloOperacion.value = operacion.Titulo;
	tituloOperacion.setAttribute("operacion", operacion.Id);
	$("#editar-monto-operacion").value = operacion.Monto;
	$("#editar-tipo-operacion").value = operacion.Tipo;
	$("#editar-categoria-operacion").value = operacion.Categoria;
	$("#editar-fecha-operacion").valueAsDate = new Date(operacion.Fecha);
}