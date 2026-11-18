'use strict'
// Unitaria: construcción del filtro de búsqueda del catálogo.
jest.mock('../../modelos/establecimiento', () => ({ find: jest.fn().mockResolvedValue([]) }));
const Establecimiento = require('../../modelos/establecimiento');
const servicio = require('../../servicios/establecimientoServicio');

beforeEach(() => jest.clearAllMocks());

describe('Catálogo: filtros de búsqueda', () => {
  test('sin parámetros solo trae establecimientos activos', async () => {
    await servicio.obtenerTodos({});
    expect(Establecimiento.find).toHaveBeenCalledWith({ activo: true });
  });

  test('filtra por tipo sin distinguir mayúsculas', async () => {
    await servicio.obtenerTodos({ tipo: 'cafe' });
    expect(Establecimiento.find.mock.calls[0][0].tipo).toEqual({ $regex: 'cafe', $options: 'i' });
  });

  test('la palabra clave busca en 6 campos', async () => {
    await servicio.obtenerTodos({ keyword: 'pizza' });
    expect(Establecimiento.find.mock.calls[0][0].$or).toHaveLength(6);
  });
});
