const amqp = require('amqplib');
require('dotenv').config();

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue('notifications', { durable: true });
    console.log('✅ RabbitMQ conectado');
  } catch (error) {
    console.error('❌ Error RabbitMQ:', error.message);
  }
};

const publishMessage = async (queue, message) => {
  if (!channel) return;
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
};

const consumeMessages = async (queue, callback) => {
  if (!channel) return;
  channel.consume(queue, (msg) => {
    if (msg !== null) {
      callback(JSON.parse(msg.content.toString()));
      channel.ack(msg);
    }
  });
};

module.exports = { connectRabbitMQ, publishMessage, consumeMessages };