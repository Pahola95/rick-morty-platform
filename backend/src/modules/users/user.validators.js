const { body, param } = require('express-validator');

const VALID_ROLES = ['ADMIN', 'USER'];

/**
 * Validators for PUT /api/users/:id/role
 */
const updateRoleRules = [
  param('id')
    .isMongoId()
    .withMessage('id debe ser un ObjectId de MongoDB válido'),

  body('role')
    .notEmpty()
    .withMessage('role es requerido')
    .isIn(VALID_ROLES)
    .withMessage(`role debe ser uno de: ${VALID_ROLES.join(', ')}`),
];

/**
 * Validators for DELETE /api/users/:id
 */
const deleteUserRules = [
  param('id')
    .isMongoId()
    .withMessage('id debe ser un ObjectId de MongoDB válido'),
];

module.exports = { updateRoleRules, deleteUserRules };
