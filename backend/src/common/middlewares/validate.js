const { validationResult } = require('express-validator');

/**
 * Middleware that reads the result of express-validator chains placed
 * before it on a route and returns a 422 with all validation errors
 * if any exist, otherwise calls next().
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
