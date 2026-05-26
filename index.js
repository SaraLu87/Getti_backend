'use strict'

require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');

mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Conexión a MongoDB establecida');
    app.listen(app.get('port'), () => {
      console.log(`Servidor corriendo en el puerto ${app.get('port')}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
  });
