const rickMortyClient = require('../../common/utils/httpClient');
const { getCache, setCache } = require('../../config/redis');

const getCharacters = async (page = 1, filters = {}) => {
  const { name, status, species } = filters;
  const cacheKey = `characters:${page}:${name||''}:${status||''}:${species||''}`;

  const cached = await getCache(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const params = { page, ...(name && { name }), ...(status && { status }), ...(species && { species }) };
  const data = await rickMortyClient.get('/character', { params });

  await setCache(cacheKey, data, 3600);
  return data;
};

const getCharacterById = async (id) => {
  const cacheKey = `character:${id}`;
  const cached = await getCache(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const data = await rickMortyClient.get(`/character/${id}`);
  await setCache(cacheKey, data, 3600);
  return data;
};

const getCharacterStats = async () => {
  const cacheKey = 'characters:stats';
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const data = await rickMortyClient.get('/character');
  const allPages = data.info.pages;
  let stats = { total: data.info.count, alive: 0, dead: 0, unknown: 0, species: {} };

  for (let i = 1; i <= Math.min(allPages, 5); i++) {
    const page = await rickMortyClient.get(`/character?page=${i}`);
    page.results.forEach(c => {
      if (c.status === 'Alive') stats.alive++;
      else if (c.status === 'Dead') stats.dead++;
      else stats.unknown++;
      stats.species[c.species] = (stats.species[c.species] || 0) + 1;
    });
  }

  await setCache(cacheKey, stats, 7200);
  return stats;
};

const getCharactersByIds = async (ids) => {
  const cacheKey = `characters:multiple:${ids}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const data = await rickMortyClient.get(`/character/${ids}`);
  await setCache(cacheKey, data, 3600);
  return data;
};

module.exports = { getCharacters, getCharacterById, getCharacterStats, getCharactersByIds };
