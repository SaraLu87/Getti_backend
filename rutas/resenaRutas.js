'use strict'

const express = require('express');
const router = express.Router();
const controller = require('../controladores/resenaControlador');
const { verificarToken } = require('../middlewares/autenticacion');
const { verificarRol } = require('../middlewares/roles');

// Consulta: cualquier usuario autenticado
router.get('/', verificarToken, controller.getResenas);
router.get('/:id?', verificarToken, controller.getResena);

// Solo el rol 'usuario' puede crear reseñas
router.post('/crear', verificarToken, verificarRol('usuario'), controller.saveResena);

// Admin puede editar cualquier reseña; usuario solo las suyas (validación en controlador)
router.put('/editar/:id?', verificarToken, verificarRol('admin', 'usuario'), controller.updateResena);

// Empresario puede responder reseñas de sus establecimientos
router.put('/responder/:id', verificarToken, verificarRol('empresario'), controller.responderResena);

// Solo admin puede eliminar reseñas
router.delete('/eliminar/:id?', verificarToken, verificarRol('admin'), controller.deleteResena);

module.exports = router;
