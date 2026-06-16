const userRepository = require('../src/modules/users/user.repository');

// Mock del repositorio
jest.mock('../src/modules/users/user.repository');
jest.mock('../src/config/redis', () => require('./mocks/redis.mock'));
jest.mock('../src/config/rabbitmq', () => require('./mocks/rabbitmq.mock'));
jest.mock('../src/config/db', () => require('./mocks/db.mock'));

describe('Auth Service', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('syncUser middleware', () => {
    it('debe crear un usuario nuevo si no existe', async () => {
      const syncUser = require('../src/common/middlewares/syncUser');

      userRepository.findByAuth0Id.mockResolvedValue(null);
      userRepository.createUser.mockResolvedValue({
        id: 'uuid-123',
        auth0Id: 'auth0|test123',
        email: 'test@test.com',
        name: 'Test User',
        role: 'USER'
      });

      const req = {
        auth: {
          payload: {
            sub: 'auth0|test123',
            email: 'test@test.com',
            name: 'Test User'
          }
        }
      };
      const res = {};
      const next = jest.fn();

      await syncUser(req, res, next);

      expect(userRepository.findByAuth0Id).toHaveBeenCalledWith('auth0|test123');
      expect(userRepository.createUser).toHaveBeenCalledWith({
        auth0Id: 'auth0|test123',
        email: 'test@test.com',
        name: 'Test User'
      });
      expect(req.user).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    it('debe retornar el usuario existente si ya está registrado', async () => {
      const syncUser = require('../src/common/middlewares/syncUser');

      const existingUser = {
        id: 'uuid-123',
        auth0Id: 'auth0|test123',
        email: 'test@test.com',
        name: 'Test User',
        role: 'USER'
      };

      userRepository.findByAuth0Id.mockResolvedValue(existingUser);

      const req = {
        auth: { payload: { sub: 'auth0|test123', email: 'test@test.com', name: 'Test User' } }
      };
      const res = {};
      const next = jest.fn();

      await syncUser(req, res, next);

      expect(userRepository.createUser).not.toHaveBeenCalled();
      expect(req.user).toEqual(existingUser);
      expect(next).toHaveBeenCalled();
    });

    it('debe llamar next con error si falla el repositorio', async () => {
      const syncUser = require('../src/common/middlewares/syncUser');

      userRepository.findByAuth0Id.mockRejectedValue(new Error('DB Error'));

      const req = {
        auth: { payload: { sub: 'auth0|test123' } }
      };
      const res = {};
      const next = jest.fn();

      await syncUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});