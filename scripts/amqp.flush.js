const amqp = require("amqplib");

const QUEUE_NAME = "invoice_tasks";
const AMQP_URL = process.env.AMQP_URL;

async function flushQueue() {
  let connection;
  try {
    connection = await amqp.connect(AMQP_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Purge the queue
    const result = await channel.purgeQueue(QUEUE_NAME);

    console.log(`Queue "${QUEUE_NAME}" flushed successfully!`);
    console.log(`Messages purged: ${result.messageCount}`);

    await channel.close();
    await connection.close();
  } catch (err) {
    console.error("Error flushing queue:", err);
    if (connection) await connection.close();
    process.exit(1);
  }
}

flushQueue();
