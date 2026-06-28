const { query, param } = require('express-validator');

/**
 * Validators for GET /api/locations
 */
const listLocationsRules = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page debe ser un entero mayor o igual a 1')
    .toInt(),

  query('name')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('name no puede superar 100 caracteres'),

  query('type')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('type no puede superar 100 caracteres'),

  query('dimension')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('dimension no puede superar 100 caracteres'),
];

/**
 * Validators for GET /api/locations/:id
 */
const getByIdRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('id debe ser un entero mayor o igual a 1')
    .toInt(),
];

module.exports = { listLocationsRules, getByIdRules };
