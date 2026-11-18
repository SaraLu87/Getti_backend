'use strict'

const bcrypt = require('bcryptjs');
const Usuario = require('../modelos/usuario');

const obtenerTodos = () => Usuario.find().select('-contrasena');

const obtenerPorId = (id) => Usuario.findById(id).select('-contrasena');

const obtenerPorCorreo = (correo) => Usuario.findOne({ correo });

const crear = (datos) => new Usuario(datos).save();

// Registro: cifra la contraseña y crea el usuario con el rol y estado indicados.
const registrar = async ({ nombre, correo, contrasena, rol, estado }) => {
  const hash = await bcrypt.hash(contrasena, 10);
  return new Usuario({ nombre, correo, contrasena: hash, rol, estado, fechaCreacion: new Date() }).save();
};

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

module.exports = { obtenerTodos, obtenerPorId, obtenerPorCorreo, crear, registrar, actualizar, eliminar, toggleFavorito, getFavoritos };
