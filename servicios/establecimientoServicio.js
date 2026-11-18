'use strict'

const Establecimiento = require('../modelos/establecimiento');
const { obtenerEstrategia } = require('./estrategias');

const construirFiltro = ({ tipo, keyword } = {}) => {
  const filtro = { activo: true };

  if (tipo) {
    filtro.tipo = { $regex: tipo, $options: 'i' };
  }

  if (keyword) {
    filtro.$or = [
      { nombre:      { $regex: keyword, $options: 'i' } },
      { descripcion: { $regex: keyword, $options: 'i' } },
      { tipo:        { $regex: keyword, $options: 'i' } },
      { tipoComida:  { $regex: keyword, $options: 'i' } },
      { direccion:   { $regex: keyword, $options: 'i' } },
      { etiquetas:   { $regex: keyword, $options: 'i' } }
    ];
  }

  return filtro;
};

// Si llega ?orden=calificacion|visualizaciones|resenas se aplica la estrategia (Strategy).
// Sin ?orden el comportamiento es el mismo de antes.
const obtenerTodos = async (query = {}) => {
  const ordenar = query.orden ? obtenerEstrategia(query.orden) : null;
  const establecimientos = await Establecimiento.find(construirFiltro(query));
  return ordenar ? ordenar(establecimientos) : establecimientos;
};

const obtenerPorId = (id) => Establecimiento.findOne({ _id: id, activo: true });

const crear = (datos) => new Establecimiento(datos).save();

const actualizar = (id, datos) =>
  Establecimiento.findByIdAndUpdate(id, { $set: datos }, { new: true });

// Soft delete: desactiva el establecimiento sin borrar el documento
const eliminar = (id) =>
  Establecimiento.findByIdAndUpdate(id, { $set: { activo: false } }, { new: true });

const obtenerPorEmpresario = (empresarioId) =>
  Establecimiento.find({ empresarioAsignado: empresarioId, activo: true });

const agregarImagenes = (id, rutas) =>
  Establecimiento.findByIdAndUpdate(
    id,
    { $push: { imagenes: { $each: rutas } } },
    { new: true }
  );

const eliminarImagenDeGaleria = (id, ruta) =>
  Establecimiento.findByIdAndUpdate(
    id,
    { $pull: { imagenes: ruta } },
    { new: true }
  );

const incrementarVisualizaciones = (id) =>
  Establecimiento.findByIdAndUpdate(id, { $inc: { visualizaciones: 1 } });

const obtenerRanking = async (limite = 5) => {
  const base = { activo: true };
  const campos = 'nombre tipo portada promedioCalificacion cantidadResenas visualizaciones';
  const [porCalificacion, porVisualizaciones, porResenas] = await Promise.all([
    Establecimiento.find({ ...base, cantidadResenas: { $gt: 0 } })
      .sort({ promedioCalificacion: -1 }).limit(limite).select(campos),
    Establecimiento.find(base)
      .sort({ visualizaciones: -1 }).limit(limite).select(campos),
    Establecimiento.find({ ...base, cantidadResenas: { $gt: 0 } })
      .sort({ cantidadResenas: -1 }).limit(limite).select(campos),
  ]);
  return { porCalificacion, porVisualizaciones, porResenas };
};

module.exports = {
  obtenerTodos, obtenerPorId, crear, actualizar, eliminar,
  obtenerPorEmpresario, agregarImagenes, eliminarImagenDeGaleria,
  incrementarVisualizaciones, obtenerRanking
};
