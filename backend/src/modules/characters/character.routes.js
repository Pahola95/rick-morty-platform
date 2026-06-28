const router = require('express').Router();
const authMiddleware = require('../../config/auth0');
const syncUser = require('../../common/middlewares/syncUser');
const validate = require('../../common/middlewares/validate');
const { listCharactersRules, getByIdRules, getMultipleRules } = require('./character.validators');
const { getCharacters, getCharacterById, getCharacterStats, getCharactersByIds } = require('./character.controller');

router.use(authMiddleware);
router.use(syncUser);

/**
 * @swagger
 * /api/characters:
 *   get:
 *     summary: Obtener lista de personajes
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrar por nombre
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Alive, Dead, unknown]
 *         description: Filtrar por estado
 *       - in: query
 *         name: species
 *         schema:
 *           type: string
 *         description: Filtrar por especie
 *     responses:
 *       200:
 *         description: Lista de personajes paginada
 *       401:
 *         description: No autenticado
 *       422:
 *         description: Parámetros de entrada inválidos
 */
router.get('/', listCharactersRules, validate, getCharacters);

/**
 * @swagger
 * /api/characters/stats:
 *   get:
 *     summary: Obtener estadísticas de personajes
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas generales de personajes
 */
router.get('/stats', getCharacterStats);

/**
 * @swagger
 * /api/characters/multiple/{ids}:
 *   get:
 *     summary: Obtener múltiples personajes por IDs
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ids
 *         required: true
 *         schema:
 *           type: string
 *         description: IDs separados por coma (ej. 1,2,3) — máximo 50
 *     responses:
 *       200:
 *         description: Lista de personajes
 *       422:
 *         description: Parámetros de entrada inválidos
 */
router.get('/multiple/:ids', getMultipleRules, validate, getCharactersByIds);

/**
 * @swagger
 * /api/characters/{id}:
 *   get:
 *     summary: Obtener personaje por ID
 *     tags: [Characters]
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
 *         description: Detalle del personaje
 *       404:
 *         description: Personaje no encontrado
 *       422:
 *         description: Parámetros de entrada inválidos
 */
router.get('/:id', getByIdRules, validate, getCharacterById);

module.exports = router;
