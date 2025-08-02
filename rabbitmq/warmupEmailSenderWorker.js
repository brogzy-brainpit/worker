// emailWorker.js
require("dotenv").config();
const amqp = require("amqplib");
const nodemailer = require("nodemailer");

const QUEUE_NAME = "warmupQueue";
const AMQP_URL = process.env.AMQP_URL;
let CONCURRENCY = 1;
let isRunning = false;

function isWithinWindow(sendWindow) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startHour, startMin] = sendWindow.start.split(":").map(Number);
  const [endHour, endMin] = sendWindow.end.split(":").map(Number);
  const start = startHour * 60 + startMin;
  const end = endHour * 60 + endMin;

  if (start < end) {
    // Normal window (e.g. 09:00 to 17:00)
    return currentMinutes >= start && currentMinutes <= end;
  } else {
    // Crosses midnight (e.g. 22:00 to 03:00)
    return currentMinutes >= start || currentMinutes <= end;
  }
}


async function sendEmail(job) {
  const { inbox, appPassword, to, subject, text,scheduledAt } = job;

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

      const now = new Date();
      const scheduledAt = new Date(job.scheduledAt);
      const isFuture = scheduledAt > now;

      const sendWindow = job.sendWindow || { start: "09:00", end: "17:00" };

      try {
        if (!isWithinWindow(sendWindow)) {
          // console.log("🚫 Out of send window:", JSON.stringify(sendWindow));
          return channel.ack(msg); // discard
        }

        if (isFuture) {
          // console.log("🕓 Now:", now.toISOString());
          // console.log("📅 ScheduledAt:", scheduledAt.toISOString());
          // console.log("⌛ Delta in ms:", scheduledAt.getTime() - now.getTime());
          // console.log(`⏱️mail from ${job.inbox} to ${job.to} Not due yet: sceduled at  ${JSON.stringify(job.scheduledAt)}`);
           return channel.nack(msg, false, true); // requeue
        }
//         const MAX_DELAY_MS = 1000 * 60 * 60 * 12; // 12 hours max delay
// const isTooOld = now - scheduledAt > MAX_DELAY_MS;
// if (isTooOld) {
//   console.log(`🗑️ Skipping stale job: scheduled at ${scheduledAt}, now is ${now}`);
//   return channel.ack(msg); // discard
// }

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
