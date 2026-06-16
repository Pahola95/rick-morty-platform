const rickMortyClient = require('../../common/utils/httpClient');
const { getCache, setCache } = require('../../config/redis');

const getLocations = async (page = 1, filters = {}) => {
  const { name, type, dimension } = filters;
  const cacheKey = `locations:${page}:${name||''}:${type||''}:${dimension||''}`;

  const cached = await getCache(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const params = { page, ...(name && { name }), ...(type && { type }), ...(dimension && { dimension }) };
  const data = await rickMortyClient.get('/location', { params });

  await setCache(cacheKey, data, 3600);
  return data;
};

const getLocationById = async (id) => {
  const cacheKey = `location:${id}`;
  const cached = await getCache(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const data = await rickMortyClient.get(`/location/${id}`);
  await setCache(cacheKey, data, 3600);
  return data;
};

const getLocationStats = async () => {
  const cacheKey = 'locations:stats';
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const data = await rickMortyClient.get('/location');
  let stats = { total: data.info.count, types: {}, dimensions: {} };

  for (let i = 1; i <= Math.min(data.info.pages, 5); i++) {
    const page = await rickMortyClient.get(`/location?page=${i}`);
    page.results.forEach(l => {
      stats.types[l.type] = (stats.types[l.type] || 0) + 1;
      stats.dimensions[l.dimension] = (stats.dimensions[l.dimension] || 0) + 1;
    });
  }

  await setCache(cacheKey, stats, 7200);
  return stats;
};

module.exports = { getLocations, getLocationById, getLocationStats };