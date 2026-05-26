'use strict'

const express = require('express');
const router = express.Router();
const controller = require('../controladores/usuarioControlador');
const { verificarToken } = require('../middlewares/autenticacion');
const { verificarRol } = require('../middlewares/roles');

// Perfil propio — debe ir antes de /:id? para que "perfil" no sea capturado como un ID
router.get('/perfil', verificarToken, controller.getMiPerfil);
router.put('/perfil', verificarToken, controller.updateMiPerfil);

// Favoritos — cualquier usuario autenticado puede gestionar sus favoritos
router.get('/favoritos', verificarToken, controller.getMisFavoritos);
router.post('/favoritos/:id', verificarToken, verificarRol('usuario'), controller.toggleFavorito);

// Solo admin puede gestionar usuarios
router.get('/', verificarToken, verificarRol('admin'), controller.getUsuarios);
router.get('/:id?', verificarToken, verificarRol('admin'), controller.getUsuario);
router.post('/crear', verificarToken, verificarRol('admin'), controller.saveUsuario);
router.put('/editar/:id?', verificarToken, verificarRol('admin'), controller.updateUsuario);
router.delete('/eliminar/:id?', verificarToken, verificarRol('admin'), controller.deleteUsuario);

module.exports = router;
