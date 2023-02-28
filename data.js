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
  
  