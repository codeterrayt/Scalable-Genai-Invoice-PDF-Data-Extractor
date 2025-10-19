const amqp = require("amqplib");
const BaseMessageBroker = require("./base/BaseMessageBroker");

class AmqpClient extends BaseMessageBroker {
  constructor() {
    super();
    this.connection = null;
    this.channel = null;
  }

  async connect() {
    if (!this.connection) {
      console.log("Connecting to AMQP...");
      console.log(process.env.AMQP_URL);
      this.connection = await amqp.connect(process.env.AMQP_URL);
    }
  }

  async getChannel(queueName) {
    await this.connect();
    if (!this.channel) {
      this.channel = await this.connection.createChannel();
    }
    await this.channel.assertQueue(queueName, { durable: true });
    return this.channel;
  }

  async send(queueName, message, options = {}) {
    const channel = await this.getChannel(queueName);
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), { persistent: true, ...options });
    console.log("✅ Message queued:", message);
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    this.channel = null;
    this.connection = null;
  }
}

module.exports = AmqpClient;
