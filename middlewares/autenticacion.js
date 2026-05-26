'use strict'

const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ mensaje: 'Acceso denegado: token no proporcionado' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }
    req.usuario = decoded;
    next();
  });
};

module.exports = { verificarToken };
