// consumerWorker.js
require('dotenv').config(); // If you need to load .env
const { rabbitconsumer } = require("./rabbitmq/consumer");

const amqp = {
  queue: "mailin",
  amqp: process.env.AMQP_URL, // e.g., from CloudAMQP
};

const config = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "dangabarin2020@gmail.com",
    pass: "yabccxpsciuoynqs",
  },
};

// Just call the consumer ONCE
rabbitconsumer(amqp, null, config, null);
console.log('called now')
