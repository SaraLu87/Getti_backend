'use strict'
jest.mock('../../modelos/usuario', () => ({ findOne: jest.fn() }));
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../../modelos/usuario');
const app = require('../../app');

const usuarioFicticio = (extra = {}) => ({
  _id: '64b000000000000000000001', nombre: 'Usuario Ficticio', correo: 'ficticio@prueba.test',
  rol: 'usuario', estado: 'aprobado', contrasena: bcrypt.hashSync('Clave123', 4), ...extra
});

beforeEach(() => jest.clearAllMocks());

describe('POST /api/auth/login', () => {
  test('credenciales correctas devuelven un JWT con el rol', async () => {
    Usuario.findOne.mockResolvedValue(usuarioFicticio());
    const res = await request(app).post('/api/auth/login').send({ correo: 'ficticio@prueba.test', contrasena: 'Clave123' });
    expect(res.status).toBe(200);
    expect(jwt.verify(res.body.token, process.env.JWT_SECRET).rol).toBe('usuario');
  });

  test('contraseña incorrecta devuelve 401', async () => {
    Usuario.findOne.mockResolvedValue(usuarioFicticio());
    const res = await request(app).post('/api/auth/login').send({ correo: 'ficticio@prueba.test', contrasena: 'otra' });
    expect(res.status).toBe(401);
  });

  test('cuenta pendiente no puede iniciar sesión (403)', async () => {
    Usuario.findOne.mockResolvedValue(usuarioFicticio({ estado: 'pendiente' }));
    const res = await request(app).post('/api/auth/login').send({ correo: 'ficticio@prueba.test', contrasena: 'Clave123' });
    expect(res.status).toBe(403);
  });

  test('faltan campos obligatorios devuelve 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ correo: 'a@b.test' });
    expect(res.status).toBe(400);
  });

  test('la respuesta nunca incluye la contraseña', async () => {
    Usuario.findOne.mockResolvedValue(usuarioFicticio());
    const res = await request(app).post('/api/auth/login').send({ correo: 'ficticio@prueba.test', contrasena: 'Clave123' });
    expect(JSON.stringify(res.body)).not.toMatch(/contrasena|\$2[aby]\$/);
  });
});
