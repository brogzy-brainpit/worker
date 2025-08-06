// consumerWorker.js
require('dotenv').config(); // If you need to load .env
const { startAutoReplier } = require('./rabbitmq/autoReplier.js');
const { rabbitconsumer } = require("./rabbitmq/consumer");
const { startLoggerWorker } = require('./rabbitmq/logWorker.js');
const { startWorker } = require('./rabbitmq/warmupEmailSenderWorker');
const {scheduler } = require('./rabbitmq/warmUpWorker');
const {connectDb}=require("./db/connectDb.js");
require("dotenv").config();

const amqp = {
  queue: "mailin",
  amqp: process.env.AMQP_URL, // e.g., from CloudAMQP
};


async function runEveryInterval() {
  console.log("🕓 Warmup auto-reply worker started...");

  async function run() {
    await startAutoReplier();

    const min = 50 * 60 * 1000;  // 50 minutes
    const max = 90 * 60 * 1000;  // 90 minutes

    const delay = Math.floor(Math.random() * (max - min + 1)) + min;

    // console.log(`⏳ Next run scheduled in ${(delay / 60000).toFixed(1)} minutes`);
    
    setTimeout(run, delay);
  }

  run(); // start the first run
}

const startServer=async()=>{
try {
    await connectDb(process.env.MONGODB_URI).then(()=>{
        console.log("connected successfully...");
    })
   
// Just call the consumer ONCE
// rabbitconsumer(amqp, null, null);
// startLoggerWorker()

// scheduler().catch(console.error);
// startWorker().catch(console.error);
// runEveryInterval();
} catch (error) {  
    console.log(`connection to mongo failed ${error}`)  
}  
} 
startServer(); 