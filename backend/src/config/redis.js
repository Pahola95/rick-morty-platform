const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

client.on('error', (err) => console.error('❌ Redis error:', err));
client.on('connect', () => console.log('✅ Redis conectado'));

const connectRedis = async () => await client.connect();

const getCache = async (key) => {
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
};

const setCache = async (key, value, ttl = 3600) => {
  await client.setEx(key, ttl, JSON.stringify(value));
};

const deleteCache = async (key) => await client.del(key);

module.exports = { connectRedis, getCache, setCache, deleteCache };