jest.mock('../src/config/redis', () => require('./mocks/redis.mock'));
jest.mock('../src/config/rabbitmq', () => require('./mocks/rabbitmq.mock'));
jest.mock('../src/config/db', () => ({
  sequelize: { authenticate: jest.fn(), sync: jest.fn() },
  connectDB: jest.fn()
}));

describe('Middlewares', () => {

  describe('errorHandler', () => {
    it('debe retornar el status y mensaje del error', () => {
      const { errorHandler } = require('../src/common/middlewares/errorHandler');

      const err = { status: 400, message: 'Bad Request' };
      const req = { originalUrl: '/api/test' };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Bad Request'
      }));
    });

    it('debe usar status 500 por defecto', () => {
      const { errorHandler } = require('../src/common/middlewares/errorHandler');

      const err = new Error('Error inesperado');
      const req = { originalUrl: '/api/test' };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      errorHandler(err, req, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('roleGuard', () => {
    it('debe permitir acceso si el rol coincide', () => {
      const roleGuard = require('../src/common/middlewares/roleGuard');

      const req = { user: { role: 'ADMIN' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      roleGuard('ADMIN')(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('debe denegar acceso si el rol no coincide', () => {
      const roleGuard = require('../src/common/middlewares/roleGuard');

      const req = { user: { role: 'USER' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      roleGuard('ADMIN')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('debe denegar acceso si no hay usuario', () => {
      const roleGuard = require('../src/common/middlewares/roleGuard');

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      roleGuard('ADMIN')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});