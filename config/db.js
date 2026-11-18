'use strict'

// Patrón Singleton: una única conexión a MongoDB para toda la aplicación.
// Si conectar() se llama varias veces, se reutiliza la misma promesa
// en lugar de abrir conexiones nuevas.

const mongoose = require('mongoose');

let conexion = null;

const conectar = (uri = process.env.MONGO_URI) => {
  if (!uri) {
    return Promise.reject(new Error('Falta la variable de entorno MONGO_URI (ver .env.example)'));
  }
  if (!conexion) {
    conexion = mongoose.connect(uri).catch((err) => {
      conexion = null; // permite reintentar
      throw err;
    });
  }
  return conexion;
};

const estaConectado = () => mongoose.connection.readyState === 1;

const desconectar = async () => {
  await mongoose.disconnect();
  conexion = null;
};

module.exports = { conectar, estaConectado, desconectar };
