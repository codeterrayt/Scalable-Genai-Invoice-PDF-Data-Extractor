const AmqpClient = require("../clients/amqp.client");
const File = require("../models/file.model");
const { connectMongo } = require("../clients/mongoose.client");
const { processFile } = require("../processors/file.processor");
const { FILE_STATUS } = require("../consts/const");

const QUEUE_NAME = "invoice_tasks";
const DLQ_NAME = `${QUEUE_NAME}_dlq`;
const MAX_RETRIES = 1;
const CONCURRENCY = 100;
const BASE_DELAY_MS = 60000;

const broker = new AmqpClient();


async function fetchFile(fileId) {
  try {
    return await File.findById(fileId);
  } catch (err) {
    throw new Error(`DB error fetching file ${fileId}: ${err.message}`);
  }
}

async function updateFile(file, updates) {
  if (!file) return;
  Object.assign(file, updates);
  await file.save();
}

async function moveToDLQ(msg, reason, channel) {
  console.error(`🚨 Moving message to DLQ (${DLQ_NAME}) →`, reason);

  const task = safeParse(msg.content.toString());
  await broker.send(DLQ_NAME, task, {
    headers: {
      "x-failure-reason": reason,
      ...msg.properties.headers,
    },
  });

  channel.ack(msg);
}

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return { raw: json };
  }
}


async function retryMessage(msg, retries, channel) {
  const task = safeParse(msg.content.toString());
  const delay = BASE_DELAY_MS * Math.pow(2, retries);

  console.log(`Scheduling retry #${retries + 1} in ${delay / 1000}s...`);

  channel.ack(msg); 

  setTimeout(async () => {
    await broker.send(QUEUE_NAME, task, {
      headers: { "x-retries": retries + 1 },
    });
    console.log(`Retry #${retries + 1} requeued for file: ${task.id}`);
  }, delay);
}



async function handleFileTask(file, msg, retries, channel) {
  try {
    console.log(`Processing file: ${file.fileName}`);
    await updateFile(file, { status: FILE_STATUS.PROCESSING });

    const result = await processFile(file);
    await updateFile(file, {
      status: FILE_STATUS.PROCESSED,
      data: result,
      isFlagged: result.errors.length > 0 ? true : false,
    });

    console.log(`File processed successfully: ${file.fileName}`);
    channel.ack(msg);
  } catch (err) {
    console.error(`Worker: Error processing ${file.fileName}:`, err.message);

    if (retries < MAX_RETRIES) {
      await retryMessage(msg, retries, channel);
      await updateFile(file, { retries: retries + 1 });
    } else {
      await updateFile(file, {
        status: FILE_STATUS.ERROR,
        error: err.message,
      });
      await moveToDLQ(msg, `Max retries reached for ${file.fileName}`, channel);
    }
  }
}

async function handleMessage(msg, channel) {
  if (!msg) return;

  let task = safeParse(msg.content.toString());
  if (!task.id) {
    return moveToDLQ(msg, `Invalid task format`, channel);
  }

  const headers = msg.properties.headers || {};
  const retries = headers["x-retries"] || 0;

  const file = await fetchFile(task.id);
  if (!file) {
    return moveToDLQ(msg, `File not found for task ID: ${task.id}`, channel);
  }

  await handleFileTask(file, msg, retries, channel);
}

/* --------------------------- WORKER SETUP --------------------------- */

async function startWorker() {
  await connectMongo();
  const channel = await broker.getChannel(QUEUE_NAME);
  await channel.assertQueue(DLQ_NAME, { durable: true });

  console.log("Worker started...");
  console.log(`Queue: ${QUEUE_NAME}`);
  console.log(`DLQ: ${DLQ_NAME}`);
  console.log(`Concurrency: ${CONCURRENCY}, Retries: ${MAX_RETRIES}`);
  console.log(`Base Retry Delay: ${BASE_DELAY_MS}ms`);

  await channel.prefetch(CONCURRENCY);

  channel.consume(
    QUEUE_NAME,
    (msg) =>
      handleMessage(msg, channel).catch((err) => {
        console.error("Unhandled message error:", err.message);
        moveToDLQ(msg, `Unhandled exception: ${err.message}`, channel);
      }),
    { noAck: false }
  );

  process.on("SIGINT", async () => {
    console.log("Shutting down worker gracefully...");
    await broker.close();
    process.exit(0);
  });
}

startWorker().catch((err) => {
  console.error("Worker startup failed:", err.message);
  process.exit(1);
});
