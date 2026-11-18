'use strict'

// El secreto JWT es OBLIGATORIO y solo se lee del entorno (.env).
// Sin él, la aplicación no arranca: es preferible a funcionar con una clave conocida.

if (!process.env.JWT_SECRET) {
  throw new Error('Falta la variable de entorno JWT_SECRET (ver .env.example)');
}

module.exports = {
  secret: process.env.JWT_SECRET,
  expiresIn: '24h'
};
