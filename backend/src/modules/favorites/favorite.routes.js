const router = require('express').Router();
const authMiddleware = require('../../config/auth0');
const syncUser = require('../../common/middlewares/syncUser');
const { getFavorites, addFavorite, removeFavorite } = require('./favorite.controller');

router.use(authMiddleware);
router.use(syncUser);

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Obtener favoritos del usuario
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de favoritos
 */
router.get('/', getFavorites);

/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: Agregar a favoritos
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, externalId, name]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [CHARACTER, LOCATION, EPISODE]
 *               externalId:
 *                 type: integer
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Agregado a favoritos
 *       400:
 *         description: Ya está en favoritos
 */
router.post('/', addFavorite);

/**
 * @swagger
 * /api/favorites/{id}:
 *   delete:
 *     summary: Eliminar de favoritos
 *     tags: [Favorites]
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
 *         description: Eliminado de favoritos
 *       404:
 *         description: Favorito no encontrado
 */
router.delete('/:id', removeFavorite);

module.exports = router;