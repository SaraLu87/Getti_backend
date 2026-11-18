'use strict'

// Suscriptores del bus de eventos. Se registran una sola vez al arrancar (index.js).
// Para reaccionar a un evento nuevo, agregue aquí un bus.on(...); el código que
// emite el evento no necesita cambiar.

const bus = require('./busEventos');

let registrados = false;

const registrarSuscriptores = () => {
  if (registrados) return;
  registrados = true;

  // Registro de actividad: deja constancia de cada reseña publicada.
  bus.on('resena.creada', (resena) => {
    console.log(`[actividad] Nueva reseña ${resena._id} en establecimiento ` +
      `${resena.establecimientoId} (calificación ${resena.calificacion})`);
  });
};

module.exports = { registrarSuscriptores };
