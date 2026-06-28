const { query, param } = require('express-validator');

/**
 * Validators for GET /api/episodes
 */
const listEpisodesRules = [
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

  query('episode')
    .optional()
    .isString()
    .trim()
    .matches(/^S\d{2}(E\d{2})?$/i)
    .withMessage('episode debe tener formato S##E## o S## (ej. S01E01, S02)'),
];

/**
 * Validators for GET /api/episodes/:id
 */
const getByIdRules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('id debe ser un entero mayor o igual a 1')
    .toInt(),
];

module.exports = { listEpisodesRules, getByIdRules };
