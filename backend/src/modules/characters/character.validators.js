const { query, param } = require('express-validator');

const VALID_STATUSES = ['Alive', 'Dead', 'unknown'];

/**
 * Validators for GET /api/characters
 */
const listCharactersRules = [
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

  query('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`status debe ser uno de: ${VALID_STATUSES.join(', ')}`),

  query('species')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('species no puede superar 100 caracteres'),
];

/**
 * Validators for GET /api/characters/:id
 */
const getByIdRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('id debe ser un entero mayor o igual a 1')
    .toInt(),
];

/**
 * Validators for GET /api/characters/multiple/:ids
 * Accepts comma-separated positive integers: "1,2,3"
 */
const getMultipleRules = [
  param('ids')
    .matches(/^\d+(,\d+)*$/)
    .withMessage('ids debe ser una lista de enteros positivos separados por comas (ej. 1,2,3)')
    .custom(value => {
      const ids = value.split(',').map(Number);
      if (ids.some(id => id < 1)) throw new Error('Todos los ids deben ser mayores o iguales a 1');
      if (ids.length > 50) throw new Error('No se pueden solicitar más de 50 personajes a la vez');
      return true;
    }),
];

module.exports = { listCharactersRules, getByIdRules, getMultipleRules };
