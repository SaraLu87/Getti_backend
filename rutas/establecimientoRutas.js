'use strict'

const express = require('express');
const router = express.Router();
const controller = require('../controladores/establecimientoControlador');
const { verificarToken } = require('../middlewares/autenticacion');
const { verificarRol } = require('../middlewares/roles');
const { uploadPortada, uploadImagenes, uploadMenu } = require('../middlewares/upload');

// Consultas públicas
router.get('/', controller.getEstablecimientos);
router.get('/ranking', controller.getRanking);

// Debe ir ANTES de /:id para que Express no lo capture como ID
router.get('/mis-establecimientos', verificarToken, verificarRol('empresario'), controller.getMisEstablecimientos);

router.get('/:id', controller.getEstablecimiento);

// CRUD — solo admin
router.post('/crear', verificarToken, verificarRol('admin'), controller.saveEstablecimiento);
router.put('/editar/:id', verificarToken, verificarRol('admin'), controller.updateEstablecimiento);
router.delete('/eliminar/:id', verificarToken, verificarRol('admin'), controller.deleteEstablecimiento);

// Visualizaciones — pública (cualquiera puede generar una vista)
router.post('/:id/visualizar', controller.registrarVisualizacion);

// Gestión de imágenes — solo admin
router.post('/:id/portada',   verificarToken, verificarRol('admin'), uploadPortada,  controller.subirPortada);
router.post('/:id/imagenes',  verificarToken, verificarRol('admin'), uploadImagenes, controller.subirImagenes);
router.post('/:id/menu',      verificarToken, verificarRol('admin'), uploadMenu,     controller.subirMenu);
router.delete('/:id/imagenes/:filename', verificarToken, verificarRol('admin'), controller.eliminarImagen);

module.exports = router;
