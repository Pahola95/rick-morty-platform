const router = require('express').Router();
const authMiddleware = require('../../config/auth0');
const syncUser = require('../../common/middlewares/syncUser');
const validate = require('../../common/middlewares/validate');
const { listEpisodesRules, getByIdRules } = require('./episode.validators');
const { getEpisodes, getEpisodeById, getEpisodeStats } = require('./episode.controller');

router.use(authMiddleware);
router.use(syncUser);

/**
 * @swagger
 * /api/episodes:
 *   get:
 *     summary: Obtener lista de episodios
 *     tags: [Episodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: episode
 *         schema:
 *           type: string
 *         description: Código del episodio (ej. S01E01)
 *     responses:
 *       200:
 *         description: Lista de episodios paginada
 *       422:
 *         description: Parámetros de entrada inválidos
 */
router.get('/', listEpisodesRules, validate, getEpisodes);

/**
 * @swagger
 * /api/episodes/stats:
 *   get:
 *     summary: Obtener estadísticas de episodios
 *     tags: [Episodes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de episodios
 */
router.get('/stats', getEpisodeStats);

/**
 * @swagger
 * /api/episodes/{id}:
 *   get:
 *     summary: Obtener episodio por ID
 *     tags: [Episodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle del episodio
 *       422:
 *         description: Parámetros de entrada inválidos
 */
router.get('/:id', getByIdRules, validate, getEpisodeById);

module.exports = router;
