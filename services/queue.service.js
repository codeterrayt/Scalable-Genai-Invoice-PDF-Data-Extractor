
const AmqpClient = require("../clients/amqp.client");
const broker = new AmqpClient();

async function queueInvoiceTask({id}) {
  const task = { id };
  broker.send("invoice_tasks", task); 
}

module.exports = { queueInvoiceTask };
