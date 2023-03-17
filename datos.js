/* Auxiliares */

const agregarEntidad = (entidad, entidades) => {
    return entidades.concat(entidad);
}

const filtrarPor = (entidades, criterio) => {
	return entidades.filter(criterio);
}

/* Movimiento */


const crearMovimiento = (titulo, monto, tipo, categoria, fecha) => {
	return {
		Id: crypto.randomUUID(),
		Titulo: titulo,
		Monto: monto,
		Tipo: tipo,
		Categoria: categoria,
		Fecha: fecha,
		MontoAjustado: tipo === "ganancia" ? monto : monto * - 1,
	};
}

const agregarMovimiento = (movimiento, movimientos) => {
	return agregarEntidad(movimiento, movimientos);
}

const filtrar = (movimientos, {tipo, categoria, fecha}) => {
	let movimientosFiltrados = movimientos;
	if (!['todos', '', null, undefined].includes(tipo)) {
		movimientosFiltrados = filtrarPor(movimientosFiltrados, (movimiento) => movimiento.Tipo === tipo);
    }

	if (!['todas', '', null, undefined].includes(categoria)) {
		movimientosFiltrados = filtrarPor(movimientosFiltrados, (movimiento) => movimiento.Categoria === categoria);
	}

    movimientosFiltrados = filtrarPor(movimientosFiltrados, (movimiento) => new Date(movimiento.Fecha) >= fecha);
	
	return movimientosFiltrados;
}

const eliminarMovimiento = (idMovimiento, movimientos) => {
	return filtrarPor(movimientos, (movimiento) => movimiento.Id !== idMovimiento);
}

const eliminarMovimientosPorCategoria = (idCategoria, movimientos) => {
	return filtrarPor(movimientos, (movimiento) => movimiento.Categoria !== idCategoria);
}

const ordenarPor = (movimientos, criterio) => {
	return [...movimientos].sort(criterio);
}

const reemplazarMovimiento = (nuevoMovimiento, movimientos) => {
	const nuevosMovimientos = filtrarPor(movimientos, (movimiento) => movimiento.Id !== nuevoMovimiento.Id);
	return nuevosMovimientos.concat(nuevoMovimiento);
}

/* Categorias */

const agregarCategoria = (categoria, categorias) => {
	return agregarEntidad(categoria, categorias);
}

const obtenerCategoria = (idCategoria, categorias) => {
  return categorias.find((categoria) => categoria.Id === idCategoria);
}

const crearCategoria = (nombre) => {
	return {Id: crypto.randomUUID(), Nombre: nombre};
}

const eliminarCategoria = (idCategoria, categorias) => {
	return filtroPor(categorias, (categoria) => categoria.Id !== idCategoria);
}

const reemplazarCategoria = (nuevaCategoria, categorias) => {
	const nuevasCategorias = categorias.filter((categoria) => categoria.Id !== nuevaCategoria.Id);
	return nuevasCategorias.concat(nuevaCategoria);
}

/* Balance */

const obtenerResumen = (movimientos) => {
	const resumen = {
		ganancias: 0,
		gastos: 0,
		balance: 0,
	}
	movimientos.forEach((movimiento) => {
		if (movimiento.Tipo === "ganancia") {
			resumen.ganancias += movimiento.Monto
		}
		
		if (movimiento.Tipo === "gasto") {
			resumen.gastos += movimiento.Monto
		}
		
		resumen.balance = resumen.ganancias - resumen.gastos
	})
	
	return resumen;
}

const obtenerReporte = (movimientos, categorias) => {
	let resumenesPorCategoria = [];
	categorias.forEach((categoria) => {
		const movimientosPorCategoria = filtrarPor(movimientos, (movimiento) => categoria.Id === movimiento.Categoria);
		const resumen = obtenerResumen(movimientosPorCategoria);
		resumenesPorCategoria.push({categoria: categoria, resumen})
	})
	
	const categoriaTopGanancias = [...resumenesPorCategoria].sort((resumenA, resumenB) => {
		return resumenB.resumen.ganancias - resumenA.resumen.ganancias;
	})[0];
	const categoriaTopGastos = [...resumenesPorCategoria].sort((resumenA, resumenB) => {
		return resumenB.resumen.gastos - resumenA.resumen.gastos;
	})[0];
	const categoriaTopBalance = [...resumenesPorCategoria].sort((resumenA, resumenB) => {
		return resumenB.resumen.balance - resumenA.resumen.balance;
	})[0];

    const resumenesPorMes = obtenerResumenesPorMes(movimientos);
    const [mesGanancias, topGanancias] = Object.entries(resumenesPorMes).sort(([mesA, resumenA], [mesB, resumenB]) => {
		return resumenB.ganancias - resumenA.ganancias;
	})[0];
    const mesTopGanancias = { mes: mesGanancias, monto: topGanancias.ganancias};
    const [mesGastos, topGastos] = Object.entries(resumenesPorMes).sort(([mesA, resumenA], [mesB, resumenB]) => {
		return resumenB.gastos - resumenA.gastos;
	})[0];
    const mesTopGastos = { mes: mesGastos, monto: topGastos.gastos};
	
	return {
		categoriaTopGanancias,
		categoriaTopGastos,
		categoriaTopBalance,
        mesTopGanancias,
        mesTopGastos,
	}
}

const obtenerResumenesPorMes = (movimientos) => {
    const resumenesPorMes = {};
    movimientos.forEach((movimiento) => {
        const mes = new Date(movimiento.Fecha).getMonth();
        const resumenPorMes = resumenesPorMes[mes] || {ganancias: 0, gastos: 0, balance: 0};

        if (movimiento.Tipo === "ganancia") {
			resumenPorMes.ganancias += movimiento.Monto;
		}
		
		if (movimiento.Tipo === "gasto") {
			resumenPorMes.gastos += movimiento.Monto;
		}

        resumenPorMes.balance = resumenPorMes.ganancias - resumenPorMes.gastos;

        resumenesPorMes[mes] = resumenPorMes;
    });
    return resumenesPorMes;
}

const obetenerTotales = (movimientos, categorias) => {
	let resumenesPorCategoria = [];
	categorias.forEach((categoria) => {
		const movimientosPorCategoria = filtrarPor(movimientos, (movimiento) => categoria.Id === movimiento.Categoria);
		const resumen = obtenerResumen(movimientosPorCategoria);
		resumenesPorCategoria.push({categoria: categoria, resumen})
	})

    const resumenesPorMes = Object.entries(obtenerResumenesPorMes(movimientos)).map(([numeroMes, resumenMes]) => ({mes: numeroMes, resumen: resumenMes}));
    resumenesPorCategoria = resumenesPorCategoria.filter((resumenPorCategoria) => resumenPorCategoria.resumen.gastos !== 0 || resumenPorCategoria.resumen.ganancias !== 0)
	
	return {
        resumenesPorMes,
        resumenesPorCategoria,
    };
}