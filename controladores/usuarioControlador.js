'use strict'

const servicio = require('../servicios/usuarioServicio');

const controller = {

  // --- Gestión admin ---

  getUsuarios: async (req, res, next) => {
    try {
      const usuarios = await servicio.obtenerTodos();
      res.status(200).json({ usuarios });
    } catch (err) {
      next(err);
    }
  },

  getUsuario: async (req, res, next) => {
    try {
      const usuario = await servicio.obtenerPorId(req.params.id);
      if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      res.status(200).json({ usuario });
    } catch (err) {
      next(err);
    }
  },

  saveUsuario: async (req, res, next) => {
    try {
      const { nombre, correo, contrasena, rol, estado, verificado } = req.body;

      if (!nombre || !correo || !contrasena) {
        return res.status(400).json({ mensaje: 'Nombre, correo y contraseña son obligatorios' });
      }

      const usuario = await servicio.crear({
        nombre, correo, contrasena,
        rol: rol || 'usuario',
        estado: estado || 'aprobado',
        verificado: verificado || false,
        fechaCreacion: new Date()
      });

      const { contrasena: _, ...datos } = usuario.toObject();
      res.status(201).json({ mensaje: 'Usuario creado', usuario: datos });
    } catch (err) {
      next(err);
    }
  },

  updateUsuario: async (req, res, next) => {
    try {
      const usuario = await servicio.actualizar(req.params.id, req.body);
      if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      res.status(200).json({ mensaje: 'Usuario actualizado', usuario });
    } catch (err) {
      next(err);
    }
  },

  deleteUsuario: async (req, res, next) => {
    try {
      const usuario = await servicio.eliminar(req.params.id);
      if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      res.status(200).json({ mensaje: 'Usuario eliminado', usuario });
    } catch (err) {
      next(err);
    }
  },

  // --- Perfil propio (cualquier rol autenticado) ---

  getMiPerfil: async (req, res, next) => {
    try {
      const usuario = await servicio.obtenerPorId(req.usuario.id);
      if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      res.status(200).json({ usuario });
    } catch (err) {
      next(err);
    }
  },

  toggleFavorito: async (req, res, next) => {
    try {
      const usuario = await servicio.toggleFavorito(req.usuario.id, req.params.id);
      if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      const esFavorito = usuario.favoritos.some(f => f.toString() === req.params.id);
      res.status(200).json({ esFavorito, favoritos: usuario.favoritos });
    } catch (err) {
      next(err);
    }
  },

  getMisFavoritos: async (req, res, next) => {
    try {
      const data = await servicio.getFavoritos(req.usuario.id);
      res.status(200).json({ favoritos: data?.favoritos || [] });
    } catch (err) {
      next(err);
    }
  },

  updateMiPerfil: async (req, res, next) => {
    try {
      const { rol, estado, contrasena, activo, ...camposPermitidos } = req.body;
      const usuario = await servicio.actualizar(req.usuario.id, camposPermitidos);
      if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      res.status(200).json({ mensaje: 'Perfil actualizado', usuario });
    } catch (err) {
      next(err);
    }
  }

};

module.exports = controller;
