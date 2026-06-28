const { body, param } = require('express-validator');

const VALID_TYPES = ['CHARACTER', 'LOCATION', 'EPISODE'];

/**
 * Validators for POST /api/favorites
 */
const addFavoriteRules = [
  body('type')
    .notEmpty()
    .withMessage('type es requerido')
    .isIn(VALID_TYPES)
    .withMessage(`type debe ser uno de: ${VALID_TYPES.join(', ')}`),

  body('externalId')
    .notEmpty()
    .withMessage('externalId es requerido')
    .custom((value) => {
      // Accepts a positive integer (external API) or a 24-char hex MongoDB ObjectId (local episode)
      const isPositiveInt = Number.isInteger(Number(value)) && Number(value) >= 1;
      const isObjectId = /^[a-f\d]{24}$/i.test(String(value));
      if (!isPositiveInt && !isObjectId) {
        throw new Error('externalId debe ser un entero mayor o igual a 1, o un ObjectId válido');
      }
      return true;
    }),

  body('name')
    .notEmpty()
    .withMessage('name es requerido')
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('name debe tener entre 1 y 200 caracteres'),

  body('image')
    .optional({ nullable: true, checkFalsy: true })
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('image debe ser una URL válida (http o https)'),
];

/**
 * Validators for DELETE /api/favorites/:id
 * The id is a MongoDB ObjectId (24-char hex string)
 */
const removeFavoriteRules = [
  param('id')
    .isMongoId()
    .withMessage('id debe ser un ObjectId de MongoDB válido'),
];

module.exports = { addFavoriteRules, removeFavoriteRules };
