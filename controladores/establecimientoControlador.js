'use strict'

const path = require('path');
const fs = require('fs');
const servicio = require('../servicios/establecimientoServicio');

const controller = {

  getEstablecimientos: async (req, res, next) => {
    try {
      const establecimientos = await servicio.obtenerTodos(req.query);
      res.status(200).json({ establecimientos });
    } catch (err) {
      next(err);
    }
  },

  getEstablecimiento: async (req, res, next) => {
    try {
      const establecimiento = await servicio.obtenerPorId(req.params.id);
      if (!establecimiento) return res.status(404).json({ mensaje: 'Establecimiento no encontrado' });
      res.status(200).json({ establecimiento });
    } catch (err) {
      next(err);
    }
  },

  saveEstablecimiento: async (req, res, next) => {
    try {
      const { nombre, descripcion, tipo, tipoComida, direccion, horarioAtencion, ubicacion, etiquetas } = req.body;

      if (!nombre || !tipo || !direccion) {
        return res.status(400).json({ mensaje: 'Nombre, tipo y dirección son obligatorios' });
      }

      const establecimiento = await servicio.crear({
        nombre, descripcion, tipo, tipoComida, direccion, horarioAtencion, ubicacion, etiquetas,
        promedioCalificacion: 0,
        cantidadResenas: 0,
        creadoPor: req.usuario.id,
        activo: true,
        fechaCreacion: new Date()
      });

      res.status(201).json({ mensaje: 'Establecimiento creado', establecimiento });
    } catch (err) {
      next(err);
    }
  },

  updateEstablecimiento: async (req, res, next) => {
    try {
      const CAMPOS_PERMITIDOS = [
        'nombre', 'descripcion', 'tipo', 'tipoComida',
        'direccion', 'horarioAtencion', 'ubicacion',
        'etiquetas', 'empresarioAsignado'
      ];
      const datos = {};
      CAMPOS_PERMITIDOS.forEach(campo => {
        if (req.body[campo] !== undefined) datos[campo] = req.body[campo];
      });

      const establecimiento = await servicio.actualizar(req.params.id, datos);
      if (!establecimiento) return res.status(404).json({ mensaje: 'Establecimiento no encontrado' });
      res.status(200).json({ mensaje: 'Establecimiento actualizado', establecimiento });
    } catch (err) {
      next(err);
    }
  },

  getMisEstablecimientos: async (req, res, next) => {
    try {
      const establecimientos = await servicio.obtenerPorEmpresario(req.usuario.id);
      res.status(200).json({ establecimientos });
    } catch (err) {
      next(err);
    }
  },

  deleteEstablecimiento: async (req, res, next) => {
    try {
      const establecimiento = await servicio.eliminar(req.params.id);
      if (!establecimiento) return res.status(404).json({ mensaje: 'Establecimiento no encontrado' });
      res.status(200).json({ mensaje: 'Establecimiento eliminado', establecimiento });
    } catch (err) {
      next(err);
    }
  },

  // ── Gestión de imágenes ──────────────────────────────────────────────────

  subirPortada: async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ mensaje: 'No se recibió ningún archivo' });
      const ruta = `/uploads/${req.file.filename}`;
      const est = await servicio.actualizar(req.params.id, { portada: ruta });
      if (!est) return res.status(404).json({ mensaje: 'Establecimiento no encontrado' });
      res.status(200).json({ mensaje: 'Portada actualizada', portada: ruta, establecimiento: est });
    } catch (err) {
      next(err);
    }
  },

  subirImagenes: async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ mensaje: 'No se recibieron archivos' });
      }

      const est = await servicio.obtenerPorId(req.params.id);
      if (!est) return res.status(404).json({ mensaje: 'Establecimiento no encontrado' });

      const disponibles = 5 - (est.imagenes?.length || 0);
      if (disponibles <= 0) {
        return res.status(400).json({ mensaje: 'Ya tienes el máximo de 5 imágenes en la galería' });
      }

      const archivos = req.files.slice(0, disponibles);
      const rutas = archivos.map(f => `/uploads/${f.filename}`);
      const actualizado = await servicio.agregarImagenes(req.params.id, rutas);

      res.status(200).json({ mensaje: 'Imágenes agregadas', establecimiento: actualizado });
    } catch (err) {
      next(err);
    }
  },

  subirMenu: async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ mensaje: 'No se recibió ningún archivo' });
      const ruta = `/uploads/${req.file.filename}`;
      const est = await servicio.actualizar(req.params.id, { imagenMenu: ruta });
      if (!est) return res.status(404).json({ mensaje: 'Establecimiento no encontrado' });
      res.status(200).json({ mensaje: 'Imagen de menú actualizada', imagenMenu: ruta, establecimiento: est });
    } catch (err) {
      next(err);
    }
  },

  registrarVisualizacion: async (req, res, next) => {
    try {
      await servicio.incrementarVisualizaciones(req.params.id);
      res.status(200).json({ ok: true });
    } catch (err) {
      next(err);
    }
  },

  getRanking: async (req, res, next) => {
    try {
      const ranking = await servicio.obtenerRanking(5);
      res.status(200).json(ranking);
    } catch (err) {
      next(err);
    }
  },

  eliminarImagen: async (req, res, next) => {
    try {
      const { id, filename } = req.params;
      const ruta = `/uploads/${filename}`;

      const actualizado = await servicio.eliminarImagenDeGaleria(id, ruta);
      if (!actualizado) return res.status(404).json({ mensaje: 'Establecimiento no encontrado' });

      // Borrar archivo del disco (silencioso si no existe)
      const filepath = path.join(__dirname, '../uploads', filename);
      fs.unlink(filepath, () => {});

      res.status(200).json({ mensaje: 'Imagen eliminada', establecimiento: actualizado });
    } catch (err) {
      next(err);
    }
  }

};

module.exports = controller;
