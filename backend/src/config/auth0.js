const { auth } = require('express-oauth2-jwt-bearer');
require('dotenv').config();

const authMiddleware = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});

// Wrapper para ver el error exacto
const authMiddlewareWithLog = (req, res, next) => {
  console.log('RAW_AUTH_HEADER:', req.headers['authorization']);
  authMiddleware(req, res, (err) => {
    if (err) {
      console.error('AUTH ERROR DETALLE:', err.message, err.code);
      return res.status(401).json({
        success: false,
        message: err.message,
        code: err.code
      });
    }
    next();
  });
};

module.exports = authMiddlewareWithLog;