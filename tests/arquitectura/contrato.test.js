'use strict'
// Pruebas de contrato: verifican que la ESTRUCTURA descrita en el informe se respete.
// Leen el código fuente; no necesitan base de datos.
const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '../..');
const leer = (rel) => fs.readFileSync(path.join(raiz, rel), 'utf8');
const existe = (rel) => fs.existsSync(path.join(raiz, rel));
const archivos = (dir) => fs.readdirSync(path.join(raiz, dir)).filter(f => f.endsWith('.js')).map(f => `${dir}/${f}`);
const importa = (rel) => (leer(rel).match(/require\(['"][^'"]+['"]\)/g) || []).map(s => s.slice(9, -2));

describe('Regla de capas: Controlador → Servicio → Modelo', () => {
  test.each(archivos('controladores'))('%s no importa modelos directamente', (f) => {
    expect(importa(f).filter(r => r.includes('/modelos/'))).toEqual([]);
  });
  test.each(archivos('servicios'))('%s no importa controladores ni rutas', (f) => {
    expect(importa(f).filter(r => /controladores|rutas/.test(r))).toEqual([]);
  });
  test.each(archivos('modelos'))('%s no importa servicios ni controladores', (f) => {
    expect(importa(f).filter(r => /servicios|controladores/.test(r))).toEqual([]);
  });
});

describe('Patrones declarados en el informe: existencia', () => {
  test('Strategy: carpeta servicios/estrategias con índice', () => expect(existe('servicios/estrategias/index.js')).toBe(true));
  test('Observer: bus de eventos interno', () => expect(existe('eventos/busEventos.js')).toBe(true));
  test('Facade: servicios/resenaFacade.js', () => expect(existe('servicios/resenaFacade.js')).toBe(true));
  test('Singleton: config/db.js administra la conexión', () => expect(existe('config/db.js')).toBe(true));
  test('index.js usa el Singleton y no conecta a Mongo por su cuenta', () => {
    const src = leer('index.js');
    expect(src).toMatch(/config\/db/);
    expect(src).not.toMatch(/mongoose\.connect/);
  });
});

describe('Higiene del repositorio y configuración segura', () => {
  test('existe un .gitignore real (no .gitignore.txt)', () => expect(existe('.gitignore')).toBe(true));
  test('.gitignore excluye .env y node_modules', () => {
    const g = existe('.gitignore') ? leer('.gitignore') : '';
    expect(g).toMatch(/^\.env$/m);
    expect(g).toMatch(/node_modules/);
  });
  test('JWT no tiene un secreto por defecto en el código', () => {
    expect(leer('config/jwt.js')).not.toMatch(/\|\|\s*['"]/);
  });
});
