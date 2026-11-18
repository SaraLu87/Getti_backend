'use strict'

require('dotenv').config();

const db = require('./config/db');
const app = require('./app');
const { registrarSuscriptores } = require('./eventos/suscriptores');

registrarSuscriptores();

db.conectar()
  .then(() => {
    console.log('Conexión a MongoDB establecida');
    app.listen(app.get('port'), () => {
      console.log(`Servidor corriendo en el puerto ${app.get('port')}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err.message);
    process.exit(1);
  });
