'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsuarioSchema = Schema({
  nombre:               { type: String, required: true },
  correo:               { type: String, required: true, unique: true },
  contrasena:           { type: String, required: true },
  rol:                  { type: String, enum: ['admin', 'empresario', 'usuario'], default: 'usuario' },
  estado:               { type: String, enum: ['pendiente', 'aprobado', 'rechazado', 'inactivo'], default: 'pendiente' },
  favoritos:            [{ type: Schema.Types.ObjectId, ref: 'Establecimiento' }],
  fechaCreacion:        Date
});

UsuarioSchema.index({ estado: 1 });
UsuarioSchema.index({ rol: 1 });

module.exports = mongoose.model('Usuario', UsuarioSchema, 'usuarios');
