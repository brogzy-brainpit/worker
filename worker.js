// consumerWorker.js
require('dotenv').config(); // If you need to load .env
const { rabbitconsumer } = require("./rabbitmq/consumer");
const { startLoggerWorker } = require('./rabbitmq/logWorker,js');

const amqp = {
  queue: "mailin",
  amqp: process.env.AMQP_URL, // e.g., from CloudAMQP
};


// Just call the consumer ONCE
rabbitconsumer(amqp, null, null);
startLoggerWorker()
console.log('worker up and running, listening to emails !!!')
