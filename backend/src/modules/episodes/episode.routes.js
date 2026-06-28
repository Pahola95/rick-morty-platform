const router = require('express').Router();
const authMiddleware = require('../../config/auth0');
const syncUser = require('../../common/middlewares/syncUser');
const roleGuard = require('../../common/middlewares/roleGuard');
const validate = require('../../common/middlewares/validate');
const csvUpload = require('../../common/middlewares/csvUpload');
const { listEpisodesRules, getByIdRules } = require('./episode.validators');
const {
  getEpisodes,
  getEpisodeById,
  getEpisodeStats,
  uploadEpisodesCSV,
  getLocalEpisodes,
  deleteLocalEpisode,
  deleteAllLocalEpisodes,
} = require('./episode.controller');

router.use(authMiddleware);
router.use(syncUser);

/**
 * @swagger
 * /api/episodes:
 *   get:
 *     summary: Obtener lista de episodios (API externa + locales cargados por CSV)
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
 *         description: Estadísticas de episodios incluyendo locales
 */
router.get('/stats', getEpisodeStats);

/**
 * @swagger
 * /api/episodes/local:
 *   get:
 *     summary: Listar episodios cargados localmente (solo admin)
 *     tags: [Episodes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de episodios locales
 *       403:
 *         description: Acceso denegado
 */
router.get('/local', roleGuard('ADMIN'), getLocalEpisodes);

/**
 * @swagger
 * /api/episodes/local/all:
 *   delete:
 *     summary: Eliminar TODOS los episodios locales cargados desde CSV (solo admin)
 *     tags: [Episodes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todos los episodios locales eliminados correctamente
 *       403:
 *         description: Acceso denegado
 */
router.delete('/local/all', roleGuard('ADMIN'), deleteAllLocalEpisodes);

/**
 * @swagger
 * /api/episodes/local/{id}:
 *   delete:
 *     summary: Eliminar un episodio local por ID (solo admin)
 *     tags: [Episodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId del episodio local
 *     responses:
 *       200:
 *         description: Episodio eliminado correctamente
 *       404:
 *         description: Episodio no encontrado
 *       403:
 *         description: Acceso denegado
 */
router.delete('/local/:id', roleGuard('ADMIN'), deleteLocalEpisode);

/**
 * @swagger
 * /api/episodes/upload-csv:
 *   post:
 *     summary: Cargar episodios desde un archivo CSV (solo admin)
 *     tags: [Episodes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: |
 *                   Archivo CSV con columnas: name, air_date, episode (S##E##), characters (opcional)
 *     responses:
 *       201:
 *         description: Carga completada con resumen de resultados
 *       403:
 *         description: Acceso denegado
 *       422:
 *         description: Archivo inválido o columnas faltantes
 */
router.post(
  '/upload-csv',
  roleGuard('ADMIN'),
  csvUpload.single('file'),
  uploadEpisodesCSV
);

/**
 * @swagger
 * /api/episodes/{id}:
 *   get:
 *     summary: Obtener episodio por ID (externo o local)
 *     tags: [Episodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID numérico (API externa) o ObjectId (local)
 *     responses:
 *       200:
 *         description: Detalle del episodio
 *       404:
 *         description: Episodio no encontrado
 *       422:
 *         description: Parámetros de entrada inválidos
 */
router.get('/:id', getByIdRules, validate, getEpisodeById);

module.exports = router;
