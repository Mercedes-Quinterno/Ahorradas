/* Operaciones */

const OPERACIONES = {
    GASTO: 'gasto',
    GANANCIA: 'ganancia',
  }
  
  const crearOperacion = (titulo, monto, tipo, categoria, fecha) => {
      return {
          Id: crypto.randomUUID(),
          Titulo: titulo,
          Monto: monto,
          Tipo: tipo,
          Categoria: categoria,
          Fecha: fecha,
      };
  }
  
  const agregarOperacion = (operacion, operaciones) => {
      return [...operaciones, operacion];
  }
  
  const filtrarPorTipo = (tipo, operaciones) => {
      return operaciones.filter((operacion) => operacion.Tipo === tipo);
  }
  
  const filtrarPorCategoria = (idCategoria, operaciones) => {
      return operaciones.filter((operacion) => operacion.Categoria === idCategoria);
  }
  
  const filtrarPorFecha = (desde, operaciones) => {
      return operaciones.filter((operacion) => new Date(operacion.Fecha) >= desde);
  }
  
  const eliminarOperacion = (idOperacion, operaciones) => {
      return operaciones.filter((operacion) => operacion.Id !== idOperacion);
  }
  
  const eliminarOperacionesPorCategoria = (idCategoria, operaciones) => {
      return operaciones.filter((operacion) => operacion.Categoria !== idCategoria);
  }
  
  const ordenarPorFecha = (operaciones, orden) => {
      return [...operaciones].sort((operacionA, operacionB) => {
          const fechaA = new Date(operacionA.Fecha)
          const fechaB = new Date(operacionB.Fecha)
          return orden === "ASC" ? fechaA - fechaB : fechaB - fechaA;
      })
  }
  
  
  const ordenarPorMonto = (operaciones, orden) => {
      return [...operaciones].sort((operacionA, operacionB) => {
          return orden === "ASC" ? operacionA.Monto - operacionB.Monto : operacionB.Monto - operacionA.Monto;
      })
  }
  
  const ordenarPorDescripcion = (operaciones, orden) => {
      return [...operaciones].sort((operacionA, operacionB) => {
          return orden === "ASC" ? operacionA.Titulo.localeCompare(operacionB.Titulo) : operacionB.Titulo.localeCompare(operacionA.Titulo);
      })
  }
  
  const reemplazarOperacion = (nuevaOperacion, operaciones) => {
      const nuevasOperaciones = operaciones.filter((operacion) => operacion.Id !== nuevaOperacion.Id);
      return [...nuevasOperaciones, nuevaOperacion];
  }
  
  
  /* Categorias */
  
  const agregarCategoria = (categoria, categorias) => {
      return [...categorias, categoria];
  }
  
  const obtenerCategoria = (idCategoria, categorias) => {
    return categorias.find((categoria) => categoria.Id === idCategoria)
  }
  
  const crearCategoria = (nombre) => {
      return {Id: crypto.randomUUID(), Nombre: nombre}
  }
  
  const eliminarCategoria = (idCategoria, categorias) => {
      return categorias.filter((categoria) => categoria.Id !== idCategoria);
  }
  
  const reemplazarCategoria = (nuevaCategoria, categorias) => {
      const nuevasCategorias = categorias.filter((categoria) => categoria.Id !== nuevaCategoria.Id);
      return [...nuevasCategorias, nuevaCategoria];
  }
  
  /* Balance */
  
  const obtenerBalance = (operaciones) => {
      const balance = {
          ganancias: 0,
          gastos: 0,
          balance: 0,
      }
      operaciones.forEach((operacion) => {
          if (operacion.Tipo === OPERACIONES.GANANCIA) {
              balance.ganancias += operacion.Monto
          }
          
          if (operacion.Tipo === OPERACIONES.GASTO) {
              balance.gastos += operacion.Monto
          }
          
          balance.balance = balance.ganancias - balance.gastos
      })
      
      return balance
  }
  
  const obtenerResumen = (operaciones, categorias) => {
      let balancesPorCategoria = [];
      categorias.forEach((categoria) => {
          const operacionesPorCategoria = filtrarPorCategoria(categoria.Id, operaciones);
          const balance = obtenerBalance(operacionesPorCategoria);
          balancesPorCategoria.push({categoria: categoria, balance})
      })
      
      const categoriaTopGanancias = [...balancesPorCategoria].sort((balanceA, balanceB) => {
          return balanceB.balance.ganancias - balanceA.balance.ganancias;
      })[0];
      const categoriaTopGastos = [...balancesPorCategoria].sort((balanceA, balanceB) => {
          return balanceB.balance.gastos - balanceA.balance.gastos;
      })[0];
      const categoriaTopBalance = [...balancesPorCategoria].sort((balanceA, balanceB) => {
          return balanceB.balance.balance - balanceA.balance.balance;
      })[0];
      
      return {
          categoriaTopGanancias,
          categoriaTopGastos,
          categoriaTopBalance,
      }
  }
  
  const obetenerTotales = (operaciones, categorias) => {
      let balancesPorCategoria = [];
      categorias.forEach((categoria) => {
          const operacionesPorCategoria = filtrarPorCategoria(categoria.Id, operaciones);
          const balance = obtenerBalance(operacionesPorCategoria);
          balancesPorCategoria.push({categoria: categoria, balance})
      })
      
      return balancesPorCategoria.filter((balancePorCategoria) => balancePorCategoria.balance.gastos !== 0 || balancePorCategoria.balance.ganancias !== 0);
  }