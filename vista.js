/* Datos */

const datos = {
    movimientos: [],
    categorias: [],
};

/* Local Storage */

const sincronizarDatos = () => {
    const categorias = localStorage.getItem("categorias");
    const movimientos = localStorage.getItem("movimientos");
    datos.categorias = JSON.parse(categorias);
    datos.movimientos = JSON.parse(movimientos);
}

const noEsVacio = (elemento) => {
    return elemento?.length > 0;
}

const hayDatos = () => {
    return noEsVacio(datos.movimientos) && noEsVacio(datos.categorias);
}

const balanceDisponible = (movimientos = datos.movimientos) => {
	return datos.movimientos?.length > 1;
}

const modificarData = (nuevasCategorias, nuevosMovimientos) => {
    datos.categorias = nuevasCategorias;
    datos.movimientos = nuevosMovimientos;
    localStorage.setItem("categorias", JSON.stringify(nuevasCategorias));
    localStorage.setItem("movimientos", JSON.stringify(nuevosMovimientos));
    refrescar();
}

const modificarCategorias = (nuevasCategorias) => {
    datos.categorias = nuevasCategorias;
    localStorage.setItem("categorias", JSON.stringify(nuevasCategorias));
    refrescar();
}

const modificarMovimientos = (nuevosMovimientos) => {
    datos.movimientos = nuevosMovimientos;
    localStorage.setItem("movimientos", JSON.stringify(nuevosMovimientos));
    refrescar();
}

/* Auxiliares */

const filtro = (nombre, elemento = document) => {
    return elemento.querySelector(`.filtro[data-name='${nombre}']`);
}

const accion = (nombre, elemento = document) => {
    return elemento.querySelector(`.accion[data-name='${nombre}']`);
}

const resumen = (nombre, elemento = document) => {
    return elemento.querySelector(`.resumen[data-name='${nombre}']`);
}

const formInput = (nombre, elemento = document) => {
    return elemento.querySelector(`.form-input[data-name='${nombre}']`);
}

const limpiarElemento = (elemento) => {
    elemento.textContent = "";
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

const parsearFecha = (fecha) => {
    return fecha.replace(/-/g, "/");
}

const nombresDeMes = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
]

const formatearMes = (mes) => {
    return nombresDeMes[mes];
}

/* Refrescar */

const refrescar = () => {
    refrescarCategorias();
    refrescarMovimientos();
    refrescarResumen();
    filtrarMovimientos();
    refrescarReportes();
}

/* Movimientos */

const refrescarMovimientos = (movimientos = datos.movimientos) => {
    const contenedorDeMovimientos = document.querySelector("#container-movimientos");
    limpiarElemento(contenedorDeMovimientos);

    if (noEsVacio(movimientos)) {
        const tablaDeMovimientos = construirTablaDeMovimientos(movimientos);
        contenedorDeMovimientos.append(tablaDeMovimientos);
    } else {
        const placeholder = construirPlaceholderMovimientos();
        contenedorDeMovimientos.append(placeholder);
    }
}

const construirTablaDeMovimientos = (movimientos) => {
    const tabla = construirTabla();
    const cuerpoTabla = tabla.querySelector("tbody");

    const filasDeMovimientos = movimientos.map((movimiento) => {
        const categorias = datos.categorias;
        const categoria = obtenerCategoria(movimiento.Categoria, categorias);
        const filaMovimiento = document.createElement('tr')
        const fecha = new Date(movimiento.Fecha)

        const montoAjustado = movimiento.Tipo === "ganancia" ? movimiento.Monto : movimiento.Monto * -1;
        const color = colorParaMonto(montoAjustado);
        const monto = formatearMonto(montoAjustado);

        filaMovimiento.innerHTML = `
		  <th>${movimiento.Titulo}</th>
		  <td><span class="tag is-primary is-light">${categoria.Nombre}</span></td>
		  <td>${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}</td>
		  <td class="${color}">$${monto}</td>
		  <td><div class="field is-grouped">
			  <p class="control"><button class="accion button is-info" data-name="editar">Editar</button></p>
			  <p class="control"><button class="accion button is-danger" data-name="eliminar">Eliminar</button></p>
			</div></td> 
		`;

        const editarAccion = accion("editar", filaMovimiento);
        const eliminarAccion = accion("eliminar", filaMovimiento);

        editarAccion.onclick = () => {
            cargarDatosMovimiento(movimiento)
            mostrarSeccion('editar-movimiento')
        }

        eliminarAccion.onclick = () => {
            const movimientos = eliminarMovimiento(movimiento.Id, datos.movimientos);
            modificarMovimientos(movimientos);
        }

        return filaMovimiento;
    })

    cuerpoTabla.append(...filasDeMovimientos);

    return tabla;
}

const construirTabla = () => {
    const contenedorTabla = document.createElement('div');
    contenedorTabla.classList.add("table-container");

    contenedorTabla.innerHTML = `
			<table class="table is-fullwidth">
				<thead>
					<tr>
					  <th><abbr title="Desc">Descripción</abbr></th>
					  <th><abbr title="Cat">Categoría</abbr></th>
					  <th>Fecha</th>
					  <th>Monto</th>
					  <th><abbr title="Acc">Acciones</abbr></th>
					</tr>
				</thead>
				<tbody id="tabla-movimientos">
					
				</tbody>
			</table> 
		`;

    return contenedorTabla;
}

const construirPlaceholderMovimientos = () => {
    const placeholder = document.createElement('div');
    placeholder.classList.add("container");

    placeholder.innerHTML = `
			<div class="has-text-centered">
				<figure class="image width-350 is-inline-block my-5">
				  <img src="./wallet.png">
				</figure>
				
				<div class="my-5">
					<h2 class="title is-4 has-text-weight-bold">Sin resultados</h2>
				</div>
				
				<div class="is-inline-block my-5">
					<h4 class="title is-6">Cambia los filtros o agrega movimientos </h4>
				</div>
			</div>
		`;

    return placeholder;
}

const criterios = {
    "mas-reciente": (movimientoA, movimientoB) => new Date(movimientoB.Fecha) - new Date(movimientoA.Fecha),
    "menos-reciente": (movimientoA, movimientoB) => new Date(movimientoA.Fecha) - new Date(movimientoB.Fecha),
    "mayor-monto": (movimientoA, movimientoB) => movimientoB.MontoAjustado - movimientoA.MontoAjustado,
    "menor-monto": (movimientoA, movimientoB) => movimientoA.MontoAjustado - movimientoB.MontoAjustado,
    "a-z": (movimientoA, movimientoB) => movimientoA.Titulo.localeCompare(movimientoB.Titulo),
    "z-a": (movimientoA, movimientoB) => movimientoB.Titulo.localeCompare(movimientoA.Titulo),
}

const filtrarMovimientos = () => {
    const tipo = filtro("tipo").value;
    const categoria = filtro("categoria").value;
    const fecha = new Date(parsearFecha(filtro("fecha").value));
    const orden = filtro("orden").value;

    let movimientos = datos.movimientos;

    movimientos = filtrar(movimientos, { tipo, categoria, fecha });

    movimientos = ordenarPor(movimientos, criterios[orden]);

    refrescarMovimientos(movimientos);
    refrescarResumen(movimientos)
}

const cargarDatosMovimiento = (movimiento) => {
    const seccionEditarMovimiento = document.querySelector("#seccion-editar-movimiento");
    const tituloMovimiento = formInput("titulo", seccionEditarMovimiento)
    tituloMovimiento.value = movimiento.Titulo;
    tituloMovimiento.setAttribute("movimiento", movimiento.Id);
    formInput("monto", seccionEditarMovimiento).value = movimiento.Monto;
    formInput("tipo", seccionEditarMovimiento).value = movimiento.Tipo;
    formInput("categoria", seccionEditarMovimiento).value = movimiento.Categoria;
    formInput("fecha", seccionEditarMovimiento).valueAsDate = new Date(movimiento.Fecha);
}

/* Categorias */

const refrescarCategorias = () => {
    const categorias = datos.categorias;
    const selectDeFiltro = filtro("categoria");
    limpiarElemento(selectDeFiltro);
    const selectsDeForms = document.querySelectorAll(".categorias-select");

    const opcionesDeFiltro = [{ Id: "todas", Nombre: "Todas" }, ...categorias].map((categoria) => construirOpcion(categoria.Id, categoria.Nombre));
    selectDeFiltro.append(...opcionesDeFiltro);

    selectsDeForms.forEach((select) => {
        limpiarElemento(select);
        const opcionesDeCategorias = categorias.map((categoria) => construirOpcion(categoria.Id, categoria.Nombre));
        select.append(...opcionesDeCategorias);
    });

    /* Tabla */

    const tablaDeCategorias = document.querySelector('#tabla-categorias');
    limpiarElemento(tablaDeCategorias);
    const filasDeCategorias = categorias.map((categoria) => construirFilaCategoria(categoria));

    tablaDeCategorias.append(...filasDeCategorias);
}

const construirOpcion = (valor, texto) => {
    const opcion = document.createElement('option');
    opcion.value = valor;
    opcion.textContent = texto

    return opcion;
}

const construirFilaCategoria = (categoria) => {
    const filaCategoria = document.createElement('tr');
    filaCategoria.innerHTML += `
	  <th>${categoria.Nombre}</th>
	  <td><div class="field is-grouped">
		  <p class="control"><button class="accion button is-info" data-name="editar">Editar</button></p>
		  <p class="control"><button class="accion button is-danger" data-name="eliminar">Eliminar</button></p>
		</div></td> 
	`

    const editarAccion = accion("editar", filaCategoria);
    const eliminarAccion = accion("eliminar", filaCategoria);

    editarAccion.onclick = () => {
        cargarDatosCategoria(categoria);
        mostrarSeccion('editar-categoria');
    }

    eliminarAccion.onclick = () => {
        const movimientos = datos.movimientos;
        const categorias = datos.categorias;
        const nuevasCategorias = eliminarCategoria(categoria.Id, categorias);
        const nuevosMovimientos = eliminarMovimientosPorCategoria(categoria.Id, movimientos);
        modificarData(nuevasCategorias, nuevosMovimientos);
    }

    return filaCategoria;
}

const cargarDatosCategoria = (categoria) => {
	const nombreCategoria = document.querySelector("#editar-nombre-categoria")
	nombreCategoria.value = categoria.Nombre;
	nombreCategoria.setAttribute("categoria", categoria.Id);
}

/* Resumen */

const refrescarResumen = (movimientos = datos.movimientos) => {
    const nuevoResumen = obtenerResumen(movimientos)

    construirBalance(resumen("ganancias"), nuevoResumen.ganancias);
    construirBalance(resumen("gastos"), nuevoResumen.gastos * -1);
    construirBalance(resumen("balance"), nuevoResumen.balance);
}

const construirBalance = (elemento, valor) => {
    elemento.classList.remove("has-text-danger", "has-text-success");
    let operador = "";
    if (valor > 0) {
        elemento.classList.add("has-text-success");
        operador = "+";
    } else if (valor < 0) {
        elemento.classList.add("has-text-danger");
    }

    elemento.innerHTML = `${operador}$${valor}`;
}

/* Reportes */

const refrescarReportes = () => {
    const movimientos = datos.movimientos;
    const categorias = datos.categorias;

    const contenedorDeReporte = document.querySelector("#container-reportes");
    limpiarElemento(contenedorDeReporte);

    if (balanceDisponible()) {
        const {
            categoriaTopGanancias,
            categoriaTopGastos,
            categoriaTopBalance,
            mesTopGanancias,
            mesTopGastos,
        } = obtenerReporte(movimientos, categorias);
        const {resumenesPorMes, resumenesPorCategoria} = obetenerTotales(movimientos, categorias);

        const reportes = construirReportes(categoriaTopGanancias, categoriaTopGastos, categoriaTopBalance, mesTopGanancias, mesTopGastos, resumenesPorMes, resumenesPorCategoria);
    
        contenedorDeReporte.append(reportes);
    } else {
        const placeholder = construirPlaceholderReportes();
        contenedorDeReporte.append(placeholder);
    }
}

const construirReportes = (categoriaTopGanancias, categoriaTopGastos, categoriaTopBalance, mesTopGanancias, mesTopGastos, resumenesPorMes, resumenesPorCategoria) => {
    const contenedorDeReportes = document.createElement('div');

    const valoresTop = construirValoresTop(categoriaTopGanancias, categoriaTopGastos, categoriaTopBalance, mesTopGanancias, mesTopGastos);
    const tituloDeTotalesPorCategoria = document.createElement('h4');
    tituloDeTotalesPorCategoria.textContent = "Totales por categoría";
    const tablaDeTotalesPorCategoria = construirTablaDeTotalesPorCategorias(resumenesPorCategoria);
    const tituloDeTotalesPorMes = document.createElement('h4');
    tituloDeTotalesPorMes.textContent = "Totales por Mes";
    const tablaDeTotalesPorMes = construirTablaDeTotalesPorMes(resumenesPorMes);

    contenedorDeReportes.append(valoresTop, tituloDeTotalesPorCategoria, tablaDeTotalesPorCategoria, tituloDeTotalesPorMes, tablaDeTotalesPorMes);

    return contenedorDeReportes;
}

const construirValoresTop = (categoriaTopGanancias, categoriaTopGastos, categoriaTopBalance, mesTopGanancias, mesTopGastos) => {
    const contenedorDeTops = document.createElement('div');
    
    const topGanancias = construirValorTop("Categoría con mayor ganancia", categoriaTopGanancias.categoria.Nombre, categoriaTopGanancias.resumen.ganancias);
    const topGastos = construirValorTop("Categoría con mayor gasto", categoriaTopGastos.categoria.Nombre, categoriaTopGastos.resumen.gastos * -1);
    const topBalance = construirValorTop("Categoría con mayor balance", categoriaTopBalance.categoria.Nombre, categoriaTopBalance.resumen.balance);
    const topMesGanancias = construirValorTop("Mes con mayor ganancia", formatearMes(mesTopGanancias.mes), mesTopGanancias.monto);
    const topMesGastos = construirValorTop("Mes con mayor gasto", formatearMes(mesTopGastos.mes), mesTopGastos.monto * -1);

    contenedorDeTops.append(topGanancias, topGastos, topBalance, topMesGanancias, topMesGastos);

    return contenedorDeTops;
}

const construirValorTop = (titulo, nombre, monto) => {
    const contenedorDeTop = document.createElement('div');
    contenedorDeTop.classList.add("columns");
    contenedorDeTop.innerHTML = `
        <div class="column is-6">
            ${titulo}
        </div>
        <div class="column is-3">
            <span class="tag is-primary is-light">${nombre}</span>
        </div>
        <div class="column is-3">
            <span class="${colorParaMonto(monto)}">${formatearMonto(monto)}</span>
        </div>
    `;

    return contenedorDeTop;
}

const construirTablaDeTotalesPorCategorias = (totalesPorCategorias) => {
    const contenedorDeTabla = document.createElement('div');
    contenedorDeTabla.classList.add('table-container');
    const tabla = document.createElement('table');
    tabla.classList.add("table", "is-fullwidth");
    tabla.innerHTML = `
        <table class="table is-fullwidth">
            <thead>
            <tr>
                <th><abbr title="Cat">Categoría</abbr></th>
                <th><abbr title="Gan">Ganancias</abbr></th>
                <th><abbr title="Gas">Gastos</abbr></th>
                <th><abbr title="Bal">Balance</abbr></th>
            </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    `;

    const cuerpoDeTabla = tabla.querySelector("tbody");
    totalesPorCategorias.forEach((totalesPorCategoria) => {
        const itemTotal = document.createElement('tr')

        const textoGanancias = formatearMonto(totalesPorCategoria.resumen.ganancias);
        const textoGastos = formatearMonto(totalesPorCategoria.resumen.gastos * -1);
        const textoBalance = formatearMonto(totalesPorCategoria.resumen.balance);
        const colorGanancias = colorParaMonto(totalesPorCategoria.resumen.ganancias);
        const colorGastos = colorParaMonto(totalesPorCategoria.resumen.gastos * -1);
        const colorBalance = colorParaMonto(totalesPorCategoria.resumen.balance);

        itemTotal.innerHTML += `
            <th>${totalesPorCategoria.categoria.Nombre}</th>
            <td class="${colorGanancias}">${textoGanancias}</td>
            <td class="${colorGastos}">${textoGastos}</td>
            <td class="${colorBalance}">${textoBalance}</td>
        `

        cuerpoDeTabla.append(itemTotal);
    });

    contenedorDeTabla.append(tabla);
    
    return contenedorDeTabla;
}

const construirTablaDeTotalesPorMes = (totalesPorMeses) => {
    const contenedorDeTabla = document.createElement('div');
    contenedorDeTabla.classList.add('table-container');
    const tabla = document.createElement('table');
    tabla.classList.add("table", "is-fullwidth");
    tabla.innerHTML = `
        <table class="table is-fullwidth">
            <thead>
            <tr>
                <th><abbr title="Cat">Mes</abbr></th>
                <th><abbr title="Gan">Ganancias</abbr></th>
                <th><abbr title="Gas">Gastos</abbr></th>
                <th><abbr title="Bal">Balance</abbr></th>
            </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    `;

    const cuerpoDeTabla = tabla.querySelector("tbody");
    totalesPorMeses.forEach((totalesPorMes) => {
        const itemTotal = document.createElement('tr')

        const textoGanancias = formatearMonto(totalesPorMes.resumen.ganancias);
        const textoGastos = formatearMonto(totalesPorMes.resumen.gastos * -1);
        const textoBalance = formatearMonto(totalesPorMes.resumen.balance);
        const colorGanancias = colorParaMonto(totalesPorMes.resumen.ganancias);
        const colorGastos = colorParaMonto(totalesPorMes.resumen.gastos * -1);
        const colorBalance = colorParaMonto(totalesPorMes.resumen.balance);

        itemTotal.innerHTML += `
            <th>${formatearMes(totalesPorMes.mes)}</th>
            <td class="${colorGanancias}">${textoGanancias}</td>
            <td class="${colorGastos}">${textoGastos}</td>
            <td class="${colorBalance}">${textoBalance}</td>
        `

        cuerpoDeTabla.append(itemTotal);
    });

    contenedorDeTabla.append(tabla);
    
    return contenedorDeTabla;
}

const construirPlaceholderReportes = () => {
    const placeholder = document.createElement('div');
    placeholder.classList.add("container");

    placeholder.innerHTML = `
            <div class="has-text-centered">
                <figure class="image width-350 is-inline-block my-5">
                <img src="./chart.svg">
                </figure>

                <div class="my-5">
                <h2 class="title is-4 has-text-weight-bold">Operaciones insuficientes</h2>
                </div>

                <div class="is-inline-block my-5">
                <h4 class="title is-6">Prueba agregando más operaciones</h4>
                </div>
            </div>
		`;

    return placeholder;
}


/**/

const mostrarSeccion = (seccion) => {
    document.querySelectorAll("section").forEach((section) => section.classList.add("is-hidden"));

    document.querySelector(`#seccion-${seccion}`).classList.remove("is-hidden");
}

window.onload = () => {
    sincronizarDatos();

    document.querySelectorAll('input[type="date"]').forEach((inputDeFecha) => {
        inputDeFecha.valueAsDate = new Date();
    });

    if (hayDatos()) {
        refrescar();
    } else {
        const nombresDeCategorias = ["Comida", "Servicios", "Salidas", "Educación", "Transporte", "Trabajo"];
        const nuevasCategorias = nombresDeCategorias.map((nombreDeCategoria) => crearCategoria(nombreDeCategoria));
        modificarData(nuevasCategorias, []);
    }

    document.querySelectorAll(".navegacion").forEach((navegacion) => {
        navegacion.addEventListener("click", (event) => {
            const seccion = event.currentTarget.dataset.seccion;
            mostrarSeccion(seccion);
        })
    });

    document.querySelector("#cancelar-agregar-movimiento").addEventListener("click", (event) => {
        mostrarSeccion("balance");
    });

    document.querySelector("#agregar-movimiento").addEventListener("click", (event) => {
        event.preventDefault();
        const movimientos = datos.movimientos;

        const seccionAgregarMovimiento = document.querySelector("#seccion-agregar-movimiento");

        const titulo = formInput("titulo", seccionAgregarMovimiento).value;
        const monto = Number(formInput("monto", seccionAgregarMovimiento).value);
        const tipo = formInput("tipo", seccionAgregarMovimiento).value;
        const categoria = formInput("categoria", seccionAgregarMovimiento).value;
        const fecha = new Date(parsearFecha(formInput("fecha", seccionAgregarMovimiento).value));

        const nuevoMovimiento = crearMovimiento(titulo, monto, tipo, categoria, fecha)
        const nuevosMovimientos = agregarMovimiento(nuevoMovimiento, movimientos);

        modificarMovimientos(nuevosMovimientos);

        mostrarSeccion("balance");
    });

    document.querySelector("#editar-movimiento").addEventListener("click", (event) => {
        event.preventDefault();
        const movimientos = datos.movimientos;

        const seccionEditarMovimiento = document.querySelector("#seccion-editar-movimiento");

        const idMovimiento = formInput("titulo", seccionEditarMovimiento).getAttribute("movimiento");
        const titulo = formInput("titulo", seccionEditarMovimiento).value;
        const monto = Number(formInput("monto", seccionEditarMovimiento).value);
        const tipo = formInput("tipo", seccionEditarMovimiento).value;
        const categoria = formInput("categoria", seccionEditarMovimiento).value;
        const fecha = new Date(parsearFecha(formInput("fecha", seccionEditarMovimiento).value));

        const movimientoActualizado = {
            Id: idMovimiento,
            Titulo: titulo,
            Monto: monto,
            Tipo: tipo,
            Categoria: categoria,
            Fecha: fecha,
        }

        const nuevosMovimientos = reemplazarMovimiento(movimientoActualizado, movimientos);
        modificarMovimientos(nuevosMovimientos);
        mostrarSeccion("balance");
    })

    document.querySelector("#cancelar-editar-movimiento").addEventListener("click", () =>
        mostrarSeccion("balance")
    )

    document.querySelector("#crear-categoria").addEventListener("click", () => {
		const categorias = datos.categorias;
		const nombreCategoria = document.querySelector("#crear-nombre-categoria").value;
		const categoria = crearCategoria(nombreCategoria);
		const nuevasCategorias = agregarCategoria(categoria, categorias);
		modificarCategorias(nuevasCategorias);
	})
	
	document.querySelector("#editar-categoria").addEventListener("click", () => {
		const categorias = datos.categorias;
		const nombreCategoria = document.querySelector("#editar-nombre-categoria").value;
		const idCategoria = document.querySelector("#editar-nombre-categoria").getAttribute("categoria");
		const nuevasCategorias = reemplazarCategoria({Id: idCategoria, Nombre: nombreCategoria}, categorias);
		modificarCategorias(nuevasCategorias);
		mostrarSeccion("categorias");
	})

    filtro("tipo").addEventListener("change", filtrarMovimientos)
    filtro("categoria").addEventListener("change", filtrarMovimientos)
    filtro("fecha").addEventListener("change", filtrarMovimientos)
    filtro("orden").addEventListener("change", filtrarMovimientos)
}

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