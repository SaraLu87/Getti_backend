'use strict'

// Patrón Facade: punto único de entrada para "publicar una reseña".
// El controlador solo llama a publicar(); la fachada coordina:
//   1. guardar la reseña (resenaServicio.crear, que además recalcula el promedio)
//   2. avisar al resto del sistema mediante el evento 'resena.creada'

const resenaServicio = require('./resenaServicio');
const bus = require('../eventos/busEventos');

const publicar = async (datos) => {
  const resena = await resenaServicio.crear(datos);
  bus.emit('resena.creada', resena);
  return resena;
};

module.exports = { publicar };
