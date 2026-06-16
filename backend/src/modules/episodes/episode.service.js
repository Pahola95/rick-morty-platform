const rickMortyClient = require('../../common/utils/httpClient');
const { getCache, setCache } = require('../../config/redis');

const getEpisodes = async (page = 1, filters = {}) => {
  const { name, episode } = filters;
  const cacheKey = `episodes:${page}:${name||''}:${episode||''}`;

  const cached = await getCache(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const params = { page, ...(name && { name }), ...(episode && { episode }) };
  const data = await rickMortyClient.get('/episode', { params });

  await setCache(cacheKey, data, 3600);
  return data;
};

const getEpisodeById = async (id) => {
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
    page.results.forEach(e => {
      const season = e.episode.substring(0, 3); // S01, S02...
      stats.perSeason[season] = (stats.perSeason[season] || 0) + 1;
    });
  }

  await setCache(cacheKey, stats, 7200);
  return stats;
};

module.exports = { getEpisodes, getEpisodeById, getEpisodeStats };