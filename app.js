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

/* Categorias */

const actualizarCategorias = () => {
    actualizarSelectoresCategorias()
    actualizarListaCategorias()
  }
  
  const actualizarSelectoresCategorias = () => {
      const selects = $$('.categorias-select')
  
      selects.forEach((select) => {
          const esFiltro = select.classList.contains('filtro-categoria');
          select.innerHTML = esFiltro ? '<option value="todas">Todas</option>' : ''
          const categorias = obtenerCategorias();
          categorias.forEach((categoria) => {
              select.innerHTML += `<option value="${categoria.Id}">${categoria.Nombre}</option>`
          })
      })
  }
  
  const actualizarListaCategorias = () => {
      const tabla = $('#tabla-categorias');
      tabla.innerHTML = '';
  
      const categorias = obtenerCategorias();
      categorias.forEach((categoria) => {
          const itemCategoria = document.createElement('tr')
          itemCategoria.innerHTML += `
            <th>${categoria.Nombre}</th>
            <td><div class="field is-grouped">
                <p class="control"><button class="editar-categoria button is-info">Editar</button></p>
                <p class="control"><button class="eliminar-categoria button is-danger">Eliminar</button></p>
              </div></td> 
          `
          
          const editarAccion = itemCategoria.querySelector('.editar-categoria')
          const eliminarAccion = itemCategoria.querySelector('.eliminar-categoria')
  
          editarAccion.onclick = () => {
            cargarDatosCategoria(categoria)
            mostrarSeccion('editar-categoria')
          }
  
          eliminarAccion.onclick = () => {
              const categorias = eliminarCategoria(categoria.Id, obtenerCategorias());
              const operaciones = eliminarOperacionesPorCategoria(categoria.Id, obtenerOperaciones());
              actualizarDatos({categorias, operaciones});
          }
          
          tabla.append(itemCategoria);
      })
  }
  
  const cargarDatosCategoria = (categoria) => {
      const nombreCategoria = $("#editar-nombre-categoria")
      nombreCategoria.value = categoria.Nombre;
      nombreCategoria.setAttribute("categoria", categoria.Id);
  }
  
  /* Balance */
  
  const actualizarBalance = (operaciones = obtenerOperaciones()) => {
    const { ganancias, gastos, balance } = obtenerBalance(operaciones)
    $("#ganancias").innerHTML = `+$${Math.abs(ganancias)}`
    $("#gastos").innerHTML = `-$${Math.abs(gastos)}`
  
    $("#balance").classList.remove("has-text-danger", "has-text-success")
    let operador = ""
  
    if (balance > 0) {
      $('#balance').classList.add("has-text-success")
      operador = '+'
    } else if (balance < 0) {
      $("#balance").classList.add("has-text-danger")
      operador = "-"
    }
  
    $("#balance").innerHTML = `${operador}$${Math.abs(balance)}`
  }
  
  /* Reportes */
  
  const actualizarReportes = () => {
      const operaciones = obtenerOperaciones();
      const categorias = obtenerCategorias();
      const suficientesOperaciones = operaciones.length > 1;
      if (suficientesOperaciones) {
          $("#con-reportes").classList.remove("is-hidden");
          $("#sin-reportes").classList.add("is-hidden");
      } else {
          $("#sin-reportes").classList.remove("is-hidden");
          $("#con-reportes").classList.add("is-hidden");
      }
      
      const {
          categoriaTopGanancias,
          categoriaTopGastos,
          categoriaTopBalance,
      } = obtenerResumen(operaciones, categorias);
      
      $("#categoria-top-ganancias-nombre").innerHTML = categoriaTopGanancias.categoria.Nombre;
      $("#categoria-top-ganancias-monto").innerHTML = formatearMonto(categoriaTopGanancias.balance.ganancias);
      $("#categoria-top-ganancias-monto").classList.add(colorParaMonto(categoriaTopGanancias.balance.ganancias));
  
      $("#categoria-top-gastos-nombre").innerHTML = categoriaTopGastos.categoria.Nombre;
      $("#categoria-top-gastos-monto").innerHTML = formatearMonto(categoriaTopGastos.balance.gastos * -1);
      $("#categoria-top-gastos-monto").classList.add(colorParaMonto(categoriaTopGastos.balance.gastos * -1));
      
      $("#categoria-top-balance-nombre").innerHTML = categoriaTopBalance.categoria.Nombre;
      $("#categoria-top-balance-monto").innerHTML = formatearMonto(categoriaTopBalance.balance.balance);
      $("#categoria-top-balance-monto").classList.add(colorParaMonto(categoriaTopBalance.balance.balance));
      
      const totalesPorCategorias = obetenerTotales(operaciones, categorias);
      
      const tabla = $("#tabla-totales-por-categorias");
      totalesPorCategorias.forEach((totalesPorCategoria) => {
          const itemTotal = document.createElement('tr')
  
          const textoGanancias = formatearMonto(totalesPorCategoria.balance.ganancias);
          const textoGastos = formatearMonto(totalesPorCategoria.balance.gastos * -1);
          const textoBalance = formatearMonto(totalesPorCategoria.balance.balance);
          const colorGanancias = colorParaMonto(totalesPorCategoria.balance.ganancias);
          const colorGastos = colorParaMonto(totalesPorCategoria.balance.gastos * -1);
          const colorBalance = colorParaMonto(totalesPorCategoria.balance.balance);
          
          itemTotal.innerHTML += `
            <th>${totalesPorCategoria.categoria.Nombre}</th>
            <td class="${colorGanancias}">${textoGanancias}</td>
            <td class="${colorGastos}">${textoGastos}</td>
            <td class="${colorBalance}">${textoBalance}</td>
          `
          
          tabla.append(itemTotal);
      });
  }
  
  const formatearMonto = (monto) => {
      if (monto > 0) {
          return `+${monto}`;
      } else {
          return monto;
      }
  }
  
  const colorParaMonto = (monto) => {
      if (monto > 0) {
          return "has-text-success";
      } else if (monto === 0) {
          return "has-text-black";
      } else {
          return "has-text-danger";
      }
  }
  
  