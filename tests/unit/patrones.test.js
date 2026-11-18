'use strict'
// Especificación de comportamiento de los patrones del informe.
// ANTES del cambio: fallan porque los módulos no existen. DESPUÉS: deben pasar.
const lista = () => [
  { nombre: 'A', promedioCalificacion: 3.0, visualizaciones: 50, cantidadResenas: 2 },
  { nombre: 'B', promedioCalificacion: 4.8, visualizaciones: 10, cantidadResenas: 9 },
  { nombre: 'C', promedioCalificacion: 4.1, visualizaciones: 90, cantidadResenas: 5 }
];

describe('Strategy: ordenamiento intercambiable', () => {
  test('ordena por calificación (mayor primero)', () => {
    const { obtenerEstrategia } = require('../../servicios/estrategias');
    expect(obtenerEstrategia('calificacion')(lista()).map(x => x.nombre)).toEqual(['B', 'C', 'A']);
  });
  test('ordena por visualizaciones (mayor primero)', () => {
    const { obtenerEstrategia } = require('../../servicios/estrategias');
    expect(obtenerEstrategia('visualizaciones')(lista()).map(x => x.nombre)).toEqual(['C', 'A', 'B']);
  });
  test('no modifica la lista original', () => {
    const { obtenerEstrategia } = require('../../servicios/estrategias');
    const original = lista();
    obtenerEstrategia('calificacion')(original);
    expect(original.map(x => x.nombre)).toEqual(['A', 'B', 'C']);
  });
  test('una estrategia desconocida lanza error claro', () => {
    const { obtenerEstrategia } = require('../../servicios/estrategias');
    expect(() => obtenerEstrategia('inventada')).toThrow();
  });
});

describe('Observer + Facade: publicar una reseña emite un evento', () => {
  test('ResenaFacade.publicar guarda la reseña y emite "resena.creada" una vez', async () => {
    jest.resetModules();
    jest.doMock('../../servicios/resenaServicio', () => ({
      crear: jest.fn().mockResolvedValue({ _id: 'r1', establecimientoId: 'e1', calificacion: 5 })
    }));
    const bus = require('../../eventos/busEventos');
    const facade = require('../../servicios/resenaFacade');
    const escuchador = jest.fn();
    bus.on('resena.creada', escuchador);
    await facade.publicar({ establecimientoId: 'e1', usuarioId: 'u1', calificacion: 5, comentario: 'ok' });
    expect(escuchador).toHaveBeenCalledTimes(1);
    expect(escuchador.mock.calls[0][0]).toMatchObject({ _id: 'r1' });
  });

  test('si un suscriptor falla, la publicación de la reseña no se rompe', async () => {
    jest.resetModules();
    jest.doMock('../../servicios/resenaServicio', () => ({ crear: jest.fn().mockResolvedValue({ _id: 'r2' }) }));
    const bus = require('../../eventos/busEventos');
    const facade = require('../../servicios/resenaFacade');
    bus.on('resena.creada', () => { throw new Error('fallo del suscriptor'); });
    await expect(facade.publicar({ establecimientoId: 'e1' })).resolves.toMatchObject({ _id: 'r2' });
  });
});

describe('Singleton: conexión a la base de datos', () => {
  test('config/db expone conectar() y estaConectado()', () => {
    const db = require('../../config/db');
    expect(typeof db.conectar).toBe('function');
    expect(typeof db.estaConectado).toBe('function');
  });
});
