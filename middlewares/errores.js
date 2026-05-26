'use strict'

const manejarError = (err, req, res, next) => {
  // Mongoose: ObjectId inválido
  if (err.name === 'CastError') {
    return res.status(400).json({ mensaje: 'ID inválido' });
  }

  // Mongoose: falla de validación de schema
  if (err.name === 'ValidationError') {
    const errores = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ mensaje: 'Error de validación', errores });
  }

  // MongoDB: clave duplicada (unique)
  if (err.code === 11000) {
    return res.status(400).json({ mensaje: 'El correo ya está registrado' });
  }

  res.status(err.status || 500).json({ mensaje: err.message || 'Error interno del servidor' });
};

module.exports = { manejarError };
