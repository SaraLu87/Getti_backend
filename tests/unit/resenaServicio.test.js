'use strict'
// Unitaria: el recálculo automático del promedio de estrellas (requisito del informe, módulo de Reseñas).
jest.mock('../../modelos/resena', () => {
  const Resena = jest.fn(function (datos) { Object.assign(this, datos); this.save = jest.fn().mockResolvedValue(this); });
  Resena.aggregate = jest.fn();
  Resena.findByIdAndUpdate = jest.fn();
  return Resena;
});
jest.mock('../../modelos/establecimiento', () => ({ findByIdAndUpdate: jest.fn().mockResolvedValue({}) }));

const Resena = require('../../modelos/resena');
const Establecimiento = require('../../modelos/establecimiento');
const servicio = require('../../servicios/resenaServicio');

beforeEach(() => jest.clearAllMocks());

describe('Reseñas: recálculo del promedio', () => {
  test('redondea el promedio a un decimal y actualiza la cantidad', async () => {
    Resena.aggregate.mockResolvedValue([{ promedio: 4.3333, cantidad: 3 }]);
    await servicio.crear({ establecimientoId: 'e1', usuarioId: 'u1', calificacion: 4 });
    expect(Establecimiento.findByIdAndUpdate).toHaveBeenCalledWith('e1',
      { $set: { promedioCalificacion: 4.3, cantidadResenas: 3 } });
  });

  test('si no quedan reseñas activas, el promedio vuelve a 0', async () => {
    Resena.aggregate.mockResolvedValue([]);
    Resena.findByIdAndUpdate.mockResolvedValue({ establecimientoId: 'e1' });
    await servicio.eliminar('r1');
    expect(Establecimiento.findByIdAndUpdate).toHaveBeenCalledWith('e1',
      { $set: { promedioCalificacion: 0, cantidadResenas: 0 } });
  });

  test('eliminar una reseña que no existe no toca el establecimiento', async () => {
    Resena.findByIdAndUpdate.mockResolvedValue(null);
    await servicio.eliminar('inexistente');
    expect(Establecimiento.findByIdAndUpdate).not.toHaveBeenCalled();
  });
});
