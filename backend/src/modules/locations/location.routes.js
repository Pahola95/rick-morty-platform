const router = require('express').Router();
const authMiddleware = require('../../config/auth0');
const syncUser = require('../../common/middlewares/syncUser');
const validate = require('../../common/middlewares/validate');
const { listLocationsRules, getByIdRules } = require('./location.validators');
const { getLocations, getLocationById, getLocationStats } = require('./location.controller');

router.use(authMiddleware);
router.use(syncUser);

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Obtener lista de locaciones
 *     tags: [Locations]
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
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: dimension
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de locaciones paginada
 *       422:
 *         description: Parámetros de entrada inválidos
 */
router.get('/', listLocationsRules, validate, getLocations);

/**
 * @swagger
 * /api/locations/stats:
 *   get:
 *     summary: Obtener estadísticas de locaciones
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de locaciones
 */
router.get('/stats', getLocationStats);

/**
 * @swagger
 * /api/locations/{id}:
 *   get:
 *     summary: Obtener locación por ID
 *     tags: [Locations]
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
 *         description: Detalle de la locación
 *       422:
 *         description: Parámetros de entrada inválidos
 */
router.get('/:id', getByIdRules, validate, getLocationById);

module.exports = router;
