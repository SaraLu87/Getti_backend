'use strict'

const express = require('express');
const router = express.Router();
const controller = require('../controladores/authControlador');

router.post('/registro', controller.registro);
router.post('/registro-empresario', controller.registroEmpresario);
router.post('/login', controller.login);

module.exports = router;
