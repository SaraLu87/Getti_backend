'use strict'

const servicio = require('../servicios/resenaServicio');

const controller = {

  getResenas: async (req, res, next) => {
    try {
      const resenas = await servicio.obtenerTodas(req.query);
      res.status(200).json({ resenas });
    } catch (err) {
      next(err);
    }
  },

  getResena: async (req, res, next) => {
    try {
      const resena = await servicio.obtenerPorId(req.params.id);
      if (!resena) return res.status(404).json({ mensaje: 'Reseña no encontrada' });
      res.status(200).json({ resena });
    } catch (err) {
      next(err);
    }
  },

  saveResena: async (req, res, next) => {
    try {
      const { establecimientoId, comentario, calificacion } = req.body;

      if (!establecimientoId || !comentario || calificacion === undefined) {
        return res.status(400).json({ mensaje: 'Establecimiento, comentario y calificación son obligatorios' });
      }

      const resena = await servicio.crear({
        establecimientoId,
        usuarioId: req.usuario.id,
        comentario,
        calificacion,
        activo: true,
        fechaCreacion: new Date()
      });

      res.status(201).json({ mensaje: 'Reseña creada', resena });
    } catch (err) {
      next(err);
    }
  },

  updateResena: async (req, res, next) => {
    try {
      const resena = await servicio.obtenerPorId(req.params.id);
      if (!resena) return res.status(404).json({ mensaje: 'Reseña no encontrada' });

      if (req.usuario.rol === 'usuario' && resena.usuarioId.toString() !== req.usuario.id) {
        return res.status(403).json({ mensaje: 'Solo puedes editar tus propias reseñas' });
      }

      // El usuario solo puede modificar su comentario y calificación
      let datos = req.body;
      if (req.usuario.rol === 'usuario') {
        const { comentario, calificacion } = req.body;
        datos = {};
        if (comentario !== undefined) datos.comentario = comentario;
        if (calificacion !== undefined) datos.calificacion = calificacion;
      }

      const actualizada = await servicio.actualizar(req.params.id, datos);
      res.status(200).json({ mensaje: 'Reseña actualizada', resena: actualizada });
    } catch (err) {
      next(err);
    }
  },

  responderResena: async (req, res, next) => {
    try {
      const { texto } = req.body;
      if (!texto) return res.status(400).json({ mensaje: 'El texto de la respuesta es obligatorio' });

      const resena = await servicio.obtenerPorId(req.params.id);
      if (!resena) return res.status(404).json({ mensaje: 'Reseña no encontrada' });

      const establecimiento = await servicio.obtenerEstablecimientoPorId(resena.establecimientoId);
      if (!establecimiento) return res.status(404).json({ mensaje: 'Establecimiento no encontrado' });

      if (!establecimiento.empresarioAsignado || establecimiento.empresarioAsignado.toString() !== req.usuario.id) {
        return res.status(403).json({ mensaje: 'No tienes permiso para responder reseñas de este establecimiento' });
      }

      const actualizada = await servicio.actualizar(req.params.id, {
        respuestaEmpresario: { texto, fecha: new Date() }
      });

      res.status(200).json({ mensaje: 'Respuesta registrada', resena: actualizada });
    } catch (err) {
      next(err);
    }
  },

  deleteResena: async (req, res, next) => {
    try {
      const resena = await servicio.eliminar(req.params.id);
      if (!resena) return res.status(404).json({ mensaje: 'Reseña no encontrada' });
      res.status(200).json({ mensaje: 'Reseña eliminada', resena });
    } catch (err) {
      next(err);
    }
  }

};

module.exports = controller;
