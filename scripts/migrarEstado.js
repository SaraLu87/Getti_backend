'use strict'

/**
 * Script de migración: activo (Boolean) → estado (String)
 * Ejecutar UNA sola vez antes de desplegar la Fase 3.
 * Uso: node scripts/migrarEstado.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function migrar() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado a MongoDB');

  const col = mongoose.connection.db.collection('usuarios');

  // activo: true → estado: 'aprobado'
  const activos = await col.updateMany(
    { activo: true, estado: { $exists: false } },
    { $set: { estado: 'aprobado' }, $unset: { activo: '' } }
  );

  // activo: false → estado: 'inactivo'
  const inactivos = await col.updateMany(
    { activo: false, estado: { $exists: false } },
    { $set: { estado: 'inactivo' }, $unset: { activo: '' } }
  );

  // Sin activo ni estado → estado: 'pendiente'
  const sinCampo = await col.updateMany(
    { activo: { $exists: false }, estado: { $exists: false } },
    { $set: { estado: 'pendiente' } }
  );

  console.log(`Migrados a 'aprobado':  ${activos.modifiedCount}`);
  console.log(`Migrados a 'inactivo':  ${inactivos.modifiedCount}`);
  console.log(`Migrados a 'pendiente': ${sinCampo.modifiedCount}`);
  console.log('Migración completada sin pérdida de datos.');

  await mongoose.disconnect();
}

migrar().catch(err => {
  console.error('Error en migración:', err);
  process.exit(1);
});
