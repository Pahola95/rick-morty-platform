const SequelizeMock = {
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    define: jest.fn().mockReturnValue({
      findOne: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      belongsTo: jest.fn(),
      hasMany: jest.fn()
    })
  },
  connectDB: jest.fn().mockResolvedValue(true)
};

module.exports = SequelizeMock;