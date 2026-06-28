const router = require('express').Router();
const authMiddleware = require('../../config/auth0');
const syncUser = require('../../common/middlewares/syncUser');
const roleGuard = require('../../common/middlewares/roleGuard');
const validate = require('../../common/middlewares/validate');
const { updateRoleRules, deleteUserRules } = require('./user.validators');
const { getAllUsers, updateRole, deleteUser, getProfile } = require('./user.controller');

router.use(authMiddleware);
router.use(syncUser);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autenticado
 */
router.get('/profile', getProfile);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios (solo ADMIN)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       403:
 *         description: Sin permisos
 */
router.get('/', roleGuard('ADMIN'), getAllUsers);

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: Actualizar rol de usuario (solo ADMIN)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *     responses:
 *       200:
 *         description: Rol actualizado
 *       403:
 *         description: Sin permisos
 *       422:
 *         description: Datos de entrada inválidos
 */
router.put('/:id/role', roleGuard('ADMIN'), updateRoleRules, validate, updateRole);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar usuario (solo ADMIN)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       403:
 *         description: Sin permisos
 *       422:
 *         description: ID inválido
 */
router.delete('/:id', roleGuard('ADMIN'), deleteUserRules, validate, deleteUser);

module.exports = router;
