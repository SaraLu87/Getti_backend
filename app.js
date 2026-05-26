'use strict'

const path = require('path');
const express = require('express');
const app = express();

app.set('port', process.env.PORT || 3000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir imágenes subidas localmente
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRutas = require('./rutas/authRutas');
const usuarioRutas = require('./rutas/usuarioRutas');
const establecimientoRutas = require('./rutas/establecimientoRutas');
const resenaRutas = require('./rutas/resenaRutas');

app.use('/api/auth', authRutas);
app.use('/api/usuarios', usuarioRutas);
app.use('/api/establecimientos', establecimientoRutas);
app.use('/api/resenas', resenaRutas);

const { manejarError } = require('./middlewares/errores');
app.use(manejarError);

module.exports = app;
