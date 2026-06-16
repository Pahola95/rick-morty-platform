const redisMock = {
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(true),
  deleteCache: jest.fn().mockResolvedValue(true),
  connectRedis: jest.fn().mockResolvedValue(true)
};

module.exports = redisMock;