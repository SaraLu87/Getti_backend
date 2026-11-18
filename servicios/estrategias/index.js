'use strict'

// Patrón Strategy: cada estrategia recibe una lista y devuelve una COPIA ordenada.
// Para agregar un criterio nuevo basta con registrar una función aquí;
// no hay que tocar controladores ni servicios.

const descendentePor = (campo) => (lista) =>
  [...lista].sort((a, b) => (b[campo] || 0) - (a[campo] || 0));

const estrategias = {
  calificacion:    descendentePor('promedioCalificacion'),
  visualizaciones: descendentePor('visualizaciones'),
  resenas:         descendentePor('cantidadResenas')
};

const obtenerEstrategia = (nombre) => {
  const estrategia = estrategias[nombre];
  if (!estrategia) {
    const err = new Error(`Estrategia de ordenamiento desconocida: "${nombre}". ` +
      `Opciones: ${Object.keys(estrategias).join(', ')}`);
    err.status = 400; // el middleware de errores responde 400 y no 500
    throw err;
  }
  return estrategia;
};

const nombresDisponibles = () => Object.keys(estrategias);

module.exports = { obtenerEstrategia, nombresDisponibles };
