const { parse } = require('csv-parse/sync');
const rickMortyClient = require('../../common/utils/httpClient');
const { getCache, setCache, deleteCache, deleteCacheByPattern } = require('../../config/redis');
const LocalEpisode = require('./episode.model');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Maps a LocalEpisode document to the same shape the Rick & Morty API returns,
 * using a high-offset ID to avoid collisions with the external API (max ~51 episodes).
 */
const toApiShape = (doc) => ({
  id: doc._id.toString(),          // string so callers can detect it's local
  name: doc.name,
  air_date: doc.air_date,
  episode: doc.episode,
  characters: doc.characters,
  url: null,
  created: doc.createdAt,
  isLocal: true,
});

// ---------------------------------------------------------------------------
// Read operations
// ---------------------------------------------------------------------------

const getEpisodes = async (page = 1, filters = {}) => {
  const { name, episode } = filters;
  const cacheKey = `episodes:${page}:${name || ''}:${episode || ''}`;

  const cached = await getCache(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  // Fetch from external API — a 404 means "nothing found", not a real error.
  let apiData;
  try {
    const params = { page, ...(name && { name }), ...(episode && { episode }) };
    apiData = await rickMortyClient.get('/episode', { params });
  } catch (err) {
    // The Rick & Morty API returns 404 when filters match nothing.
    // Treat it as an empty result set so local episodes can still be returned.
    apiData = { info: { count: 0, pages: 1, next: null, prev: null }, results: [] };
  }

  // Fetch matching local episodes
  const localQuery = {};
  if (name) localQuery.name = { $regex: name, $options: 'i' };
  if (episode) localQuery.episode = { $regex: episode, $options: 'i' };

  const localDocs = await LocalEpisode.find(localQuery).sort({ episode: 1 }).lean();
  const localEpisodes = localDocs.map(toApiShape);

  // Inject local episodes into the first page (or any page when filtering,
  // since the external API already returned nothing).
  const results =
    page === 1 || page === '1' || localEpisodes.length > 0
      ? [...apiData.results, ...localEpisodes]
      : apiData.results;

  const data = { ...apiData, results };

  await setCache(cacheKey, data, 3600);
  return data;
};

const getEpisodeById = async (id) => {
  // Local episodes use MongoDB ObjectId strings (24 hex chars)
  if (typeof id === 'string' && id.length === 24) {
    const doc = await LocalEpisode.findById(id).lean();
    if (!doc) {
      const err = new Error('Episodio no encontrado');
      err.status = 404;
      throw err;
    }
    return toApiShape(doc);
  }

  const cacheKey = `episode:${id}`;
  const cached = await getCache(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const data = await rickMortyClient.get(`/episode/${id}`);
  await setCache(cacheKey, data, 3600);
  return data;
};

const getEpisodeStats = async () => {
  const cacheKey = 'episodes:stats';
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const data = await rickMortyClient.get('/episode');
  let stats = { total: data.info.count, perSeason: {} };

  for (let i = 1; i <= data.info.pages; i++) {
    const page = await rickMortyClient.get(`/episode?page=${i}`);
    page.results.forEach((e) => {
      const season = e.episode.substring(0, 3);
      stats.perSeason[season] = (stats.perSeason[season] || 0) + 1;
    });
  }

  // Include local episodes in stats
  const localDocs = await LocalEpisode.find().lean();
  stats.total += localDocs.length;
  localDocs.forEach((e) => {
    const season = e.episode.substring(0, 3).toUpperCase();
    stats.perSeason[season] = (stats.perSeason[season] || 0) + 1;
  });

  await setCache(cacheKey, stats, 7200);
  return stats;
};

// ---------------------------------------------------------------------------
// CSV upload
// ---------------------------------------------------------------------------

/**
 * Expected CSV columns (case-insensitive headers):
 *   name, air_date, episode, characters (optional, comma-separated URLs)
 *
 * Example row:
 *   "The Rickoning","January 1, 2025","S05E01","https://...c/1,https://...c/2"
 */
const uploadEpisodesFromCSV = async (fileBuffer, userId) => {
  // Borrar todos los episodios locales existentes antes de cargar los nuevos
  await LocalEpisode.deleteMany({});
  await deleteCacheByPattern('episodes:*');

  // Parse CSV
  let records;
  try {
    records = parse(fileBuffer, {
      columns: (header) => header.map((h) => h.trim().toLowerCase()),
      skip_empty_lines: true,
      trim: true,
    });
  } catch (err) {
    const parseError = new Error(`Error al parsear el CSV: ${err.message}`);
    parseError.status = 422;
    throw parseError;
  }

  if (!records.length) {
    const err = new Error('El archivo CSV está vacío o no tiene filas válidas');
    err.status = 422;
    throw err;
  }

  const required = ['name', 'air_date', 'episode'];
  const missing = required.filter((col) => !(col in records[0]));
  if (missing.length) {
    const err = new Error(
      `Columnas obligatorias faltantes en el CSV: ${missing.join(', ')}. ` +
        'Se requieren: name, air_date, episode'
    );
    err.status = 422;
    throw err;
  }

  const results = { inserted: 0, skipped: 0, errors: [] };

  for (const [index, row] of records.entries()) {
    const rowNum = index + 2; // +2: 1-indexed + header row

    const name = (row.name || '').trim();
    const air_date = (row.air_date || '').trim();
    const episode = (row.episode || '').trim().toUpperCase();
    const characters = row.characters
      ? row.characters
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    if (!name || !air_date || !episode) {
      results.errors.push({ row: rowNum, reason: 'Campos name, air_date o episode vacíos' });
      continue;
    }

    if (!/^S\d{2}E\d{2}$/i.test(episode)) {
      results.errors.push({
        row: rowNum,
        reason: `Código de episodio inválido: "${episode}". Debe ser formato S##E## (ej. S05E01)`,
      });
      continue;
    }

    try {
      await LocalEpisode.create({ name, air_date, episode, characters, uploadedBy: userId });
      results.inserted++;
    } catch (err) {
      if (err.code === 11000) {
        // Duplicate episode code — skip gracefully
        results.skipped++;
      } else {
        results.errors.push({ row: rowNum, reason: err.message });
      }
    }
  }

  // Bust all episode-related caches (list pages + stats) so fresh data is served
  await deleteCacheByPattern('episodes:*');

  return results;
};

/**
 * Returns all locally stored episodes (for admin management).
 */
const getLocalEpisodes = async () => {
  const docs = await LocalEpisode.find().sort({ episode: 1 }).lean();
  return docs.map(toApiShape);
};

/**
 * Deletes a single local episode by its MongoDB ObjectId.
 */
const deleteLocalEpisode = async (id) => {
  const doc = await LocalEpisode.findByIdAndDelete(id);
  if (!doc) {
    const err = new Error('Episodio local no encontrado');
    err.status = 404;
    throw err;
  }
  // Invalidate episode list cache so the deletion is reflected immediately
  await deleteCacheByPattern('episodes:*');
  return { deleted: true, episode: doc.episode, name: doc.name };
};

/**
 * Deletes ALL locally uploaded episodes (admin only).
 */
const deleteAllLocalEpisodes = async () => {
  const result = await LocalEpisode.deleteMany({});
  // Invalidate episode list cache so the deletion is reflected immediately
  await deleteCacheByPattern('episodes:*');
  return { 
    deleted: true, 
    count: result.deletedCount,
    message: `Se eliminaron ${result.deletedCount} episodios locales cargados desde CSV`
  };
};

module.exports = {
  getEpisodes,
  getEpisodeById,
  getEpisodeStats,
  uploadEpisodesFromCSV,
  getLocalEpisodes,
  deleteLocalEpisode,
  deleteAllLocalEpisodes,
};
