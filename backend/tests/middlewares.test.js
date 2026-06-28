jest.mock('../src/config/redis', () => require('./mocks/redis.mock'));
jest.mock('../src/config/rabbitmq', () => require('./mocks/rabbitmq.mock'));
jest.mock('../src/config/db', () => ({
  sequelize: { authenticate: jest.fn(), sync: jest.fn() },
  connectDB: jest.fn()
}));

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  res.set    = jest.fn().mockReturnValue(res);
  return res;
};

// ─────────────────────────────────────────────────────────────────────────────
// errorHandler
// ─────────────────────────────────────────────────────────────────────────────
describe('errorHandler middleware', () => {
  const { errorHandler } = require('../src/common/middlewares/errorHandler');

  it('debe retornar el status y mensaje del error', () => {
    const err = { status: 400, message: 'Bad Request' };
    const req = { originalUrl: '/api/test' };
    const res = mockRes();

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Bad Request',
    }));
  });

  it('debe usar status 500 cuando el error no tiene status', () => {
    const err = new Error('Error inesperado');
    const req = { originalUrl: '/api/test' };
    const res = mockRes();

    errorHandler(err, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// roleGuard
// ─────────────────────────────────────────────────────────────────────────────
describe('roleGuard middleware', () => {
  const roleGuard = require('../src/common/middlewares/roleGuard');

  it('debe llamar next() si el rol coincide', () => {
    const req  = { user: { role: 'ADMIN' } };
    const res  = mockRes();
    const next = jest.fn();

    roleGuard('ADMIN')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('debe responder 403 si el rol no coincide', () => {
    const req  = { user: { role: 'USER' } };
    const res  = mockRes();
    const next = jest.fn();

    roleGuard('ADMIN')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('debe responder 401 si no hay usuario en el request', () => {
    const req  = {};
    const res  = mockRes();
    const next = jest.fn();

    roleGuard('ADMIN')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('debe aceptar múltiples roles', () => {
    const req  = { user: { role: 'EDITOR' } };
    const res  = mockRes();
    const next = jest.fn();

    roleGuard('ADMIN', 'EDITOR')(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validate middleware
// ─────────────────────────────────────────────────────────────────────────────
describe('validate middleware', () => {
  const { body, validationResult } = require('express-validator');
  const validate = require('../src/common/middlewares/validate');

  /**
   * Helper: runs an array of express-validator chains against a mock request,
   * then calls validate so we can assert on its behaviour.
   */
  const runValidate = async (chains, reqOverride = {}) => {
    const req  = { body: {}, query: {}, params: {}, ...reqOverride };
    const res  = mockRes();
    const next = jest.fn();

    // Run every chain against the req (they mutate internal context)
    for (const chain of chains) await chain.run(req);

    validate(req, res, next);
    return { req, res, next };
  };

  it('debe llamar next() cuando los datos son válidos', async () => {
    const { body: bodyV } = require('express-validator');
    const chains = [bodyV('name').notEmpty()];
    const { next } = await runValidate(chains, { body: { name: 'Rick' } });

    expect(next).toHaveBeenCalled();
  });

  it('debe responder 422 cuando hay errores de validación', async () => {
    const { body: bodyV } = require('express-validator');
    const chains = [bodyV('name').notEmpty().withMessage('name es requerido')];
    const { res, next } = await runValidate(chains, { body: {} });

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: 'Datos de entrada inválidos',
      errors:  expect.arrayContaining([
        expect.objectContaining({ field: 'name', message: 'name es requerido' }),
      ]),
    }));
  });

  it('debe incluir todos los errores en el array de respuesta', async () => {
    const { body: bodyV } = require('express-validator');
    const chains = [
      bodyV('type').notEmpty().withMessage('type es requerido'),
      bodyV('externalId').isInt({ min: 1 }).withMessage('externalId debe ser entero'),
    ];
    const { res } = await runValidate(chains, { body: {} });

    const payload = res.json.mock.calls[0][0];
    expect(payload.errors.length).toBeGreaterThanOrEqual(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// sanitize middleware
// ─────────────────────────────────────────────────────────────────────────────
describe('sanitize middleware', () => {
  const sanitize = require('../src/common/middlewares/sanitize');

  it('debe llamar next() siempre', () => {
    const req  = { body: {}, query: {}, params: {} };
    const next = jest.fn();

    sanitize(req, {}, next);

    expect(next).toHaveBeenCalled();
  });

  it('debe hacer trim a los strings en body', () => {
    const req = { body: { name: '  Rick  ', status: ' Alive ' }, query: {}, params: {} };
    sanitize(req, {}, jest.fn());

    expect(req.body.name).toBe('Rick');
    expect(req.body.status).toBe('Alive');
  });

  it('debe hacer trim a los strings en query', () => {
    const req = { body: {}, query: { name: '  Morty ' }, params: {} };
    sanitize(req, {}, jest.fn());

    expect(req.query.name).toBe('Morty');
  });

  it('debe hacer trim a los strings en params', () => {
    const req = { body: {}, query: {}, params: { id: ' 42 ' } };
    sanitize(req, {}, jest.fn());

    expect(req.params.id).toBe('42');
  });

  it('debe eliminar claves que empiezan con $ (NoSQL injection)', () => {
    const req = {
      body:   { '$where': 'malicious', name: 'Rick' },
      query:  { '$gt': '0' },
      params: {},
    };
    sanitize(req, {}, jest.fn());

    expect(req.body['$where']).toBeUndefined();
    expect(req.body.name).toBe('Rick');
    expect(req.query['$gt']).toBeUndefined();
  });

  it('debe sanitizar objetos anidados en body', () => {
    const req = {
      body:   { nested: { '$inject': 'x', value: '  hello  ' } },
      query:  {},
      params: {},
    };
    sanitize(req, {}, jest.fn());

    expect(req.body.nested['$inject']).toBeUndefined();
    expect(req.body.nested.value).toBe('hello');
  });

  it('no debe modificar valores que no son strings ni objetos', () => {
    const req = { body: { count: 42, active: true, data: null }, query: {}, params: {} };
    sanitize(req, {}, jest.fn());

    expect(req.body.count).toBe(42);
    expect(req.body.active).toBe(true);
    expect(req.body.data).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// rateLimiter middleware
// ─────────────────────────────────────────────────────────────────────────────
describe('rateLimiter middleware', () => {
  const { createRateLimiter } = require('../src/common/middlewares/rateLimiter');

  it('debe permitir requests dentro del límite', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });
    const req     = { ip: '1.2.3.4', socket: {} };
    const next    = jest.fn();

    for (let i = 0; i < 5; i++) {
      limiter(req, mockRes(), next);
    }

    expect(next).toHaveBeenCalledTimes(5);
  });

  it('debe bloquear con 429 cuando se supera el límite', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 3 });
    const req     = { ip: '2.3.4.5', socket: {} };
    const next    = jest.fn();

    // 3 requests permitidos
    for (let i = 0; i < 3; i++) {
      limiter(req, mockRes(), next);
    }

    // El 4.° debe bloquearse
    const res4 = mockRes();
    limiter(req, res4, next);

    expect(res4.status).toHaveBeenCalledWith(429);
    expect(res4.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
    }));
    // next no debe haber sido llamado en el 4.° intento
    expect(next).toHaveBeenCalledTimes(3);
  });

  it('debe incluir Retry-After en la respuesta 429', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });
    const req     = { ip: '3.4.5.6', socket: {} };
    const next    = jest.fn();

    limiter(req, mockRes(), next); // permitido
    const res2 = mockRes();
    limiter(req, res2, next);     // bloqueado

    expect(res2.set).toHaveBeenCalledWith('Retry-After', expect.any(String));
  });

  it('IPs distintas tienen contadores independientes', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });
    const next    = jest.fn();

    limiter({ ip: 'AAA', socket: {} }, mockRes(), next);
    limiter({ ip: 'BBB', socket: {} }, mockRes(), next);

    expect(next).toHaveBeenCalledTimes(2);
  });
});
