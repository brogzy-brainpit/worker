// emailWorker.js
require("dotenv").config();
const amqp = require("amqplib");
const nodemailer = require("nodemailer");
const { DateTime } = require("luxon");

const QUEUE_NAME = "warmupQueue";
const AMQP_URL = process.env.AMQP_URL;
let CONCURRENCY = 1;
let isRunning = false;

function isWithinWindow(sendWindow) {
  const now = DateTime.now().setZone("Africa/Lagos");
  const currentMinutes = now.hour * 60 + now.minute;

  const [startHour, startMin] = sendWindow.start.split(":").map(Number);
  const [endHour, endMin] = sendWindow.end.split(":").map(Number);
  const start = startHour * 60 + startMin;
  const end = endHour * 60 + endMin;

  if (start < end) {
    return currentMinutes >= start && currentMinutes <= end;
  } else {
    return currentMinutes >= start || currentMinutes <= end;
  }
}

async function sendEmail(job) {
  const { inbox, appPassword, to, subject, text, scheduledAt } = job;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: inbox, pass: appPassword },
  });

  await transporter.sendMail({
    from: inbox,
    to,
    subject,
    text,
  });

  console.log(`✅ Email sent from ${inbox} ➡️ ${to}, scheduled time is at ${JSON.stringify(scheduledAt)}`);
}

async function startWorker() {
  const conn = await amqp.connect(AMQP_URL);
  const channel = await conn.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  channel.prefetch(CONCURRENCY);
  console.log("🚀 Email worker started with concurrency:", CONCURRENCY);

  channel.consume(
    QUEUE_NAME,
    async (msg) => {
      const job = JSON.parse(msg.content.toString());

      const now = DateTime.now().setZone("Africa/Lagos").toJSDate();
      const scheduledAt = DateTime.fromISO(job.scheduledAt, { zone: "Africa/Lagos" }).toJSDate();
      const isFuture = scheduledAt > now;

      const sendWindow = job.sendWindow || { start: "09:00", end: "17:00" };
      const isInWindow = isWithinWindow(sendWindow);

      try {
        if (isFuture || !isInWindow) {
          console.log(`⏱️ Not time yet: ${job.inbox} ➡️ ${job.to}, scheduled at ${scheduledAt.toISOString()}, now is ${now.toISOString()}`);
          return channel.nack(msg, false, true); // Requeue
        }

        const MAX_DELAY_MS = 1000 * 60 * 60 * 12; // 12 hours max delay
        const isTooOld = now - scheduledAt > MAX_DELAY_MS;
        if (isTooOld) {
          console.log(`🗑️ Skipping stale job: scheduled at ${scheduledAt}, now is ${now}`);
          return channel.ack(msg); // discard
        }

        await sendEmail(job);
        channel.ack(msg);
      } catch (err) {
        console.error("❌ Error sending email:", err.message);
        channel.nack(msg, false, false); // discard
      }
    },
    { noAck: false }
  );
}

module.exports = { startWorker };
