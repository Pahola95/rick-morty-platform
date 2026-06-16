const rabbitmqMock = {
  publishMessage: jest.fn().mockResolvedValue(true),
  consumeMessages: jest.fn().mockResolvedValue(true),
  connectRabbitMQ: jest.fn().mockResolvedValue(true)
};

module.exports = rabbitmqMock;