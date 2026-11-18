'use strict'
jest.mock('../../modelos/resena', () => {
  const Resena = jest.fn(function (datos) { Object.assign(this, datos); this.save = jest.fn().mockResolvedValue(this); });
  Resena.aggregate = jest.fn().mockResolvedValue([{ promedio: 4.5, cantidad: 2 }]);
  Resena.findOne = jest.fn();
  Resena.findByIdAndUpdate = jest.fn();
  return Resena;
});
jest.mock('../../modelos/establecimiento', () => ({ findByIdAndUpdate: jest.fn().mockResolvedValue({}), findById: jest.fn() }));

const request = require('supertest');
const Resena = require('../../modelos/resena');
const Establecimiento = require('../../modelos/establecimiento');
const app = require('../../app');
const { crearToken } = require('../helpers');

const auth = (rol, id) => ({ Authorization: `Bearer ${crearToken(rol, id)}` });
const cuerpoValido = { establecimientoId: '64b0000000000000000000aa', comentario: 'Muy buen café', calificacion: 5 };

beforeEach(() => jest.clearAllMocks());

describe('Reseñas: flujo de negocio', () => {
  test('un usuario crea una reseña y se recalcula el promedio del local', async () => {
    const res = await request(app).post('/api/resenas/crear').set(auth('usuario')).send(cuerpoValido);
    expect(res.status).toBe(201);
    expect(Establecimiento.findByIdAndUpdate).toHaveBeenCalledWith(
      expect.anything(), { $set: { promedioCalificacion: 4.5, cantidadResenas: 2 } });
  });

  test('sin comentario o calificación devuelve 400', async () => {
    const res = await request(app).post('/api/resenas/crear').set(auth('usuario')).send({ establecimientoId: 'x' });
    expect(res.status).toBe(400);
  });

  test('un usuario no puede editar la reseña de otra persona (403)', async () => {
    Resena.findOne.mockResolvedValue({ _id: 'r1', usuarioId: { toString: () => 'otro-usuario' } });
    const res = await request(app).put('/api/resenas/editar/r1').set(auth('usuario')).send({ comentario: 'x' });
    expect(res.status).toBe(403);
  });
});

describe('Seguridad: autenticación y roles (RBAC)', () => {
  test('sin token → 401', async () => {
    expect((await request(app).get('/api/resenas')).status).toBe(401);
  });

  test('token falso → 401', async () => {
    const res = await request(app).get('/api/resenas').set({ Authorization: 'Bearer token.falso.xyz' });
    expect(res.status).toBe(401);
  });

  test('token firmado con otra clave → 401', async () => {
    const jwt = require('jsonwebtoken');
    const falso = jwt.sign({ id: '1', rol: 'admin' }, 'clave_del_atacante');
    const res = await request(app).get('/api/resenas').set({ Authorization: `Bearer ${falso}` });
    expect(res.status).toBe(401);
  });

  test('un empresario no puede crear reseñas (403)', async () => {
    expect((await request(app).post('/api/resenas/crear').set(auth('empresario')).send(cuerpoValido)).status).toBe(403);
  });

  test('un usuario no puede eliminar reseñas (403)', async () => {
    expect((await request(app).delete('/api/resenas/eliminar/r1').set(auth('usuario'))).status).toBe(403);
  });

  test('un usuario no puede crear establecimientos (403)', async () => {
    const res = await request(app).post('/api/establecimientos/crear').set(auth('usuario')).send({ nombre: 'x', tipo: 'y', direccion: 'z' });
    expect(res.status).toBe(403);
  });

  test('un usuario no puede listar usuarios (403)', async () => {
    expect((await request(app).get('/api/usuarios').set(auth('usuario'))).status).toBe(403);
  });
});
