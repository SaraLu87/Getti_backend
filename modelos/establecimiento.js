'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EstablecimientoSchema = Schema({
  nombre:      { type: String, required: true },
  descripcion: String,
  tipo:        { type: String, required: true },
  tipoComida:  String,
  direccion:   { type: String, required: true },
  horarioAtencion: String,
  ubicacion: {
    type:        { type: String, default: 'Point' },
    coordinates: [Number]
  },
  etiquetas:           { type: [String], default: [] },
  portada:             String,
  imagenes:            { type: [String], default: [] },
  imagenMenu:          String,
  promedioCalificacion:{ type: Number, default: 0 },
  cantidadResenas:     { type: Number, default: 0 },
  creadoPor:           { type: Schema.Types.ObjectId, ref: 'Usuario' },
  empresarioAsignado:  { type: Schema.Types.ObjectId, ref: 'Usuario' },
  visualizaciones:     { type: Number, default: 0 },
  activo:              { type: Boolean, default: true },
  fechaCreacion:       Date
});

// Índice geoespacial (sparse: excluye documentos sin ubicación)
EstablecimientoSchema.index({ ubicacion: '2dsphere' }, { sparse: true });
EstablecimientoSchema.index({ tipo: 1 });
EstablecimientoSchema.index({ activo: 1 });
EstablecimientoSchema.index({ empresarioAsignado: 1 });

module.exports = mongoose.model('Establecimiento', EstablecimientoSchema, 'establecimientos');
