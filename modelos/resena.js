'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResenaSchema = Schema({
  establecimientoId: { type: Schema.Types.ObjectId, ref: 'Establecimiento', required: true },
  usuarioId:         { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  comentario:        String,
  calificacion:      { type: Number, required: true, min: 1, max: 5 },
  respuestaEmpresario: {
    texto: String,
    fecha: Date
  },
  activo:       { type: Boolean, default: true },
  fechaCreacion: Date
});

ResenaSchema.index({ establecimientoId: 1 });
ResenaSchema.index({ usuarioId: 1 });
ResenaSchema.index({ activo: 1 });

module.exports = mongoose.model('Resena', ResenaSchema, 'resenas');
