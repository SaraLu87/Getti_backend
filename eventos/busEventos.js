'use strict'

// Patrón Observer: bus de eventos interno basado en EventEmitter de Node.
// Diferencia con EventEmitter normal: si un suscriptor lanza un error,
// se registra y se sigue con los demás. Así un fallo secundario
// (por ejemplo, un registro de actividad) nunca rompe la operación principal.

const { EventEmitter } = require('events');

class BusEventos extends EventEmitter {
  emit(evento, ...args) {
    const suscriptores = this.listeners(evento);
    suscriptores.forEach((suscriptor) => {
      try {
        suscriptor(...args);
      } catch (err) {
        if (process.env.NODE_ENV !== 'test') {
          console.error(`[busEventos] Falló un suscriptor de "${evento}":`, err.message);
        }
      }
    });
    return suscriptores.length > 0;
  }
}

// Una sola instancia para toda la aplicación (Node cachea el módulo).
module.exports = new BusEventos();
