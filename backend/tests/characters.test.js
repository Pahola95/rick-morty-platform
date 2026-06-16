const characterService = require('../src/modules/characters/character.service');
const rickMortyClient = require('../src/common/utils/httpClient');
const { getCache, setCache } = require('../src/config/redis');

jest.mock('../src/common/utils/httpClient');
jest.mock('../src/config/redis', () => require('./mocks/redis.mock'));
jest.mock('../src/config/rabbitmq', () => require('./mocks/rabbitmq.mock'));
jest.mock('../src/config/db', () => ({
  sequelize: { authenticate: jest.fn(), sync: jest.fn() },
  connectDB: jest.fn()
}));

describe('Character Service', () => {

  beforeEach(() => jest.clearAllMocks());

  describe('getCharacters', () => {
    it('debe retornar personajes desde la API', async () => {
      const mockData = {
        info: { count: 826, pages: 42, next: '...', prev: null },
        results: [
          { id: 1, name: 'Rick Sanchez', status: 'Alive', species: 'Human' },
          { id: 2, name: 'Morty Smith', status: 'Alive', species: 'Human' }
        ]
      };

      getCache.mockResolvedValue(null);
      rickMortyClient.get = jest.fn().mockResolvedValue(mockData);

      const result = await characterService.getCharacters(1, {});

      expect(rickMortyClient.get).toHaveBeenCalledWith('/character', { params: { page: 1 } });
      expect(setCache).toHaveBeenCalled();
      expect(result.results).toHaveLength(2);
    });

    it('debe retornar datos desde caché si existen', async () => {
      const cachedData = {
        info: { count: 826, pages: 42 },
        results: [{ id: 1, name: 'Rick Sanchez' }]
      };

      getCache.mockResolvedValue(cachedData);

      const result = await characterService.getCharacters(1, {});

      expect(rickMortyClient.get).not.toHaveBeenCalled();
      expect(result.fromCache).toBe(true);
    });

    it('debe filtrar por nombre correctamente', async () => {
      const mockData = {
        info: { count: 1, pages: 1 },
        results: [{ id: 1, name: 'Rick Sanchez' }]
      };

      getCache.mockResolvedValue(null);
      rickMortyClient.get = jest.fn().mockResolvedValue(mockData);

      await characterService.getCharacters(1, { name: 'Rick' });

      expect(rickMortyClient.get).toHaveBeenCalledWith('/character', {
        params: { page: 1, name: 'Rick' }
      });
    });
  });

  describe('getCharacterById', () => {
    it('debe retornar un personaje por ID', async () => {
      const mockCharacter = { id: 1, name: 'Rick Sanchez', status: 'Alive' };

      getCache.mockResolvedValue(null);
      rickMortyClient.get = jest.fn().mockResolvedValue(mockCharacter);

      const result = await characterService.getCharacterById(1);

      expect(rickMortyClient.get).toHaveBeenCalledWith('/character/1');
      expect(result.name).toBe('Rick Sanchez');
    });

    it('debe retornar desde caché si existe', async () => {
      const cachedCharacter = { id: 1, name: 'Rick Sanchez', fromCache: true };
      getCache.mockResolvedValue(cachedCharacter);

      const result = await characterService.getCharacterById(1);

      expect(rickMortyClient.get).not.toHaveBeenCalled();
      expect(result.fromCache).toBe(true);
    });
  });
});