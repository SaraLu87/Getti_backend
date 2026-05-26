'use strict'

const Usuario = require('../modelos/usuario');

const obtenerTodos = () => Usuario.find().select('-contrasena');

const obtenerPorId = (id) => Usuario.findById(id).select('-contrasena');

const obtenerPorCorreo = (correo) => Usuario.findOne({ correo });

const crear = (datos) => new Usuario(datos).save();

const actualizar = (id, datos) =>
  Usuario.findByIdAndUpdate(id, { $set: datos }, { new: true }).select('-contrasena');

// Soft delete: el usuario queda inactivo, no se borra de la BD
const eliminar = (id) =>
  Usuario.findByIdAndUpdate(id, { $set: { estado: 'inactivo' } }, { new: true }).select('-contrasena');

const toggleFavorito = async (usuarioId, establecimientoId) => {
  const usuario = await Usuario.findById(usuarioId).select('favoritos');
  if (!usuario) return null;
  const esFavorito = usuario.favoritos.some(f => f.toString() === establecimientoId);
  const op = esFavorito ? { $pull: { favoritos: establecimientoId } } : { $addToSet: { favoritos: establecimientoId } };
  return Usuario.findByIdAndUpdate(usuarioId, op, { new: true }).select('favoritos');
};

const getFavoritos = (usuarioId) =>
  Usuario.findById(usuarioId)
    .select('favoritos')
    .populate('favoritos', 'nombre tipo direccion portada promedioCalificacion cantidadResenas');

module.exports = { obtenerTodos, obtenerPorId, obtenerPorCorreo, crear, actualizar, eliminar, toggleFavorito, getFavoritos };
