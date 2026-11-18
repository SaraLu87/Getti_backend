'use strict'
const jwt = require('jsonwebtoken');

// Genera un token firmado igual que lo haría el login real.
const crearToken = (rol, id = '64b000000000000000000001') =>
  jwt.sign({ id, nombre: `Prueba ${rol}`, correo: `${rol}@prueba.test`, rol },
    process.env.JWT_SECRET, { expiresIn: '1h' });

module.exports = { crearToken };
