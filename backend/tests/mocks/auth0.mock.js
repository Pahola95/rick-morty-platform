// Mock del middleware de Auth0
const auth0Mock = (req, res, next) => {
  req.auth = {
    payload: {
      sub: 'auth0|test123',
      email: 'test@test.com',
      name: 'Test User'
    }
  };
  next();
};

module.exports = auth0Mock;