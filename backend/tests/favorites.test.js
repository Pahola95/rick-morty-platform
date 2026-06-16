const favoriteService = require('../src/modules/favorites/favorite.service');
const Favorite = require('../src/modules/favorites/favorite.model');
const { publishMessage } = require('../src/config/rabbitmq');

jest.mock('../src/modules/favorites/favorite.model');
jest.mock('../src/config/redis', () => require('./mocks/redis.mock'));
jest.mock('../src/config/rabbitmq', () => require('./mocks/rabbitmq.mock'));
jest.mock('../src/config/db', () => require('./mocks/db.mock'));
jest.mock('../src/modules/users/user.model', () => ({
  belongsTo: jest.fn()
}));

describe('Favorite Service', () => {

  beforeEach(() => jest.clearAllMocks());

  describe('getFavorites', () => {
    it('debe retornar los favoritos del usuario', async () => {
      const mockFavorites = [
        { id: 'fav-1', type: 'CHARACTER', externalId: 1, name: 'Rick Sanchez', userId: 'user-1' },
        { id: 'fav-2', type: 'EPISODE', externalId: 5, name: 'Pilot', userId: 'user-1' }
      ];
      Favorite.findAll.mockResolvedValue(mockFavorites);

      const result = await favoriteService.getFavorites('user-1');

      expect(Favorite.findAll).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
      expect(result).toHaveLength(2);
    });
  });

  describe('addFavorite', () => {
    it('debe agregar un favorito correctamente', async () => {
      const mockFavorite = {
        id: 'fav-1', type: 'CHARACTER',
        externalId: 1, name: 'Rick Sanchez', userId: 'user-1'
      };

      Favorite.findOne.mockResolvedValue(null);
      Favorite.create.mockResolvedValue(mockFavorite);

      const result = await favoriteService.addFavorite('user-1', {
        type: 'CHARACTER', externalId: 1, name: 'Rick Sanchez'
      });

      expect(Favorite.create).toHaveBeenCalled();
      expect(publishMessage).toHaveBeenCalledWith('notifications', expect.any(Object));
      expect(result.name).toBe('Rick Sanchez');
    });

    it('debe lanzar error si el favorito ya existe', async () => {
      Favorite.findOne.mockResolvedValue({ id: 'fav-1' });

      await expect(favoriteService.addFavorite('user-1', {
        type: 'CHARACTER', externalId: 1, name: 'Rick'
      })).rejects.toMatchObject({ status: 400, message: 'Ya está en favoritos' });
    });
  });

  describe('removeFavorite', () => {
    it('debe eliminar un favorito correctamente', async () => {
      const mockFavorite = {
        id: 'fav-1',
        destroy: jest.fn().mockResolvedValue(true)
      };
      Favorite.findOne.mockResolvedValue(mockFavorite);

      const result = await favoriteService.removeFavorite('user-1', 'fav-1');

      expect(mockFavorite.destroy).toHaveBeenCalled();
      expect(result.message).toBe('Eliminado de favoritos');
    });

    it('debe lanzar error si el favorito no existe', async () => {
      Favorite.findOne.mockResolvedValue(null);

      await expect(favoriteService.removeFavorite('user-1', 'fav-999'))
        .rejects.toMatchObject({ status: 404, message: 'Favorito no encontrado' });
    });
  });
});