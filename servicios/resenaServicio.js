'use strict'

const Resena = require('../modelos/resena');
const Establecimiento = require('../modelos/establecimiento');

// Recalcula promedioCalificacion y cantidadResenas tras cada cambio
const actualizarEstadisticas = async (establecimientoId) => {
  const stats = await Resena.aggregate([
    { $match: { establecimientoId, activo: true } },
    { $group: { _id: null, promedio: { $avg: '$calificacion' }, cantidad: { $sum: 1 } } }
  ]);

  const promedio = stats[0] ? Math.round(stats[0].promedio * 10) / 10 : 0;
  const cantidad = stats[0]?.cantidad ?? 0;

  await Establecimiento.findByIdAndUpdate(establecimientoId, {
    $set: { promedioCalificacion: promedio, cantidadResenas: cantidad }
  });
};

const obtenerTodas = async ({ nombre, establecimientoId } = {}) => {
  let filtro = { activo: true };

  if (establecimientoId) {
    filtro.establecimientoId = establecimientoId;
  } else if (nombre) {
    const establecimientos = await Establecimiento.find({
      nombre: { $regex: new RegExp(nombre.trim(), 'i') },
      activo: true
    });
    filtro.establecimientoId = { $in: establecimientos.map(e => e._id) };
  }

  return Resena.find(filtro)
    .populate('establecimientoId', 'nombre tipo direccion')
    .populate('usuarioId', 'nombre');
};

const obtenerPorId = (id) => Resena.findOne({ _id: id, activo: true });

const obtenerEstablecimientoPorId = (id) => Establecimiento.findById(id);

const crear = async (datos) => {
  const resena = await new Resena(datos).save();
  await actualizarEstadisticas(resena.establecimientoId);
  return resena;
};

const actualizar = (id, datos) =>
  Resena.findByIdAndUpdate(id, { $set: datos }, { new: true });

// Soft delete: desactiva la reseña y recalcula estadísticas del establecimiento
const eliminar = async (id) => {
  const resena = await Resena.findByIdAndUpdate(id, { $set: { activo: false } }, { new: true });
  if (resena) await actualizarEstadisticas(resena.establecimientoId);
  return resena;
};

module.exports = {
  obtenerTodas, obtenerPorId, obtenerEstablecimientoPorId,
  crear, actualizar, eliminar
};
