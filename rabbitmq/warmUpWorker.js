require("dotenv").config();
const amqp = require("amqplib");
const mongoose = require("mongoose");
const User = require("../model/userAuth");
const { DateTime } = require("luxon");

const AMQP_URL = process.env.AMQP_URL;
const QUEUE_NAME = "warmupQueue";
const MAX_SAFE = 23;

let isRunning = false;

const SUBJECTS = [
  `first Email #`,
  `Hey there 👋`,
  `Quick Check-In`,
  `Test Email - Please Ignore`,
  `Just Warming Things Up`
];

function getRandomWarmupContent(firstName) {
  const CONTENTS = [
    `This is just a warmup message to keep things active! X-WARMUP-ID: ${firstName}`,
    `Hey ${firstName}! This is a warmup email. X-WARMUP-ID: No action needed.`,
    `You can ignore this warmup email, ${firstName}. X-WARMUP-ID: It's for deliverability.`,
    `Keeping the inbox alive with X-WARMUP-ID: this warmup!`,
    `Warming up your inbox... X-WARMUP-ID: all systems go!`
  ];

  return CONTENTS[Math.floor(Math.random() * CONTENTS.length)];
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function connectAmqp() {
  const conn = await amqp.connect(AMQP_URL);
  const channel = await conn.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  console.log("✅ RabbitMQ connected & queue asserted");
  return channel;
}

// function parseSendWindow(ref, timeStr, fallback) {
//   if (!timeStr) return fallback;
//   const [h, m] = timeStr.split(":").map(Number);
//   const d = new Date(ref);
//   d.setHours(h, m, 0, 0);
//   return d;
// }
function parseSendWindow(ref, timeStr, fallback) {
  if (!timeStr) return fallback;

  const [h, m] = timeStr.split(":").map(Number);
  return DateTime.fromJSDate(ref)
    .setZone("Africa/Lagos")
    .set({ hour: h, minute: m, second: 0, millisecond: 0 })
    .toJSDate();
}

function getRandomMs(minMin, maxMin) {
  const min = minMin * 60 * 1000;
  const max = maxMin * 60 * 1000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function calculateScheduledTimes(start, end, count) {
  const startLuxon = DateTime.fromJSDate(start);
  const endLuxon = DateTime.fromJSDate(end);
  const totalMs = endLuxon.diff(startLuxon).as("milliseconds");
  const ninetym = totalMs * 0.90;

  const cutoff = startLuxon.plus({ milliseconds: ninetym });
  const minTotal = (count - 1) * 10 * 60 * 1000; // minimum spacing total
  const randomOK = minTotal <= ninetym;

  const slots = [];
  let cursor = startLuxon;

  for (let i = 0; i < count; i++) {
    if (i === count - 1) {
      cursor = cutoff;
    } else if (randomOK) {
      const delay = getRandomMs(10, 30);
      cursor = cursor.plus({ milliseconds: delay });
      if (cursor > cutoff) cursor = cutoff;
    } else {
      const spacing = ninetym / count;
      cursor = startLuxon.plus({ milliseconds: spacing * i });
    }
    slots.push(cursor);
  }

  return slots;
}


function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function scheduler() {
  if (isRunning) {
    console.log("⛔ Scheduler already running");
    return;
  }
  isRunning = true;

  const channel = await connectAmqp();
  console.log("🕓 Scheduler started");

  async function runCycle() {
    try {
      const now = DateTime.now().setZone("Africa/Lagos");
      const todayKey = now.toISODate(); // returns "YYYY-MM-DD"


      const users = await User.find({ "warmupInboxes.status": "active" });

      for (const u of users) {
        let dirty = false;

        for (const inbox of u.warmupInboxes) {
          if (inbox.status !== "active") continue;
          await sleep(6000 + Math.random() * 12000);

          if (inbox.isListener) {
            console.log(`⏩ Skipping ${inbox.inbox} because it is a listener-only inbox`);
            continue;
          }

        if (inbox.nextSendDate && now < DateTime.fromJSDate(inbox.nextSendDate).setZone("Africa/Lagos")) {
  console.log("no inbox pass nextSendDdate");
  continue;
}



          const lastDay = inbox.lastSentDate?.toISOString().slice(0, 10) ?? null;
          if (lastDay !== todayKey) {
            console.log('fresh day started, scheduling all cold warm up emails started');
            inbox.sentToday = 0;
            inbox.dailyLimit += inbox.dailyIncrease;
            inbox.dailyLimit = Math.min(inbox.dailyLimit, MAX_SAFE);
            inbox.lastSentDate = now;
            if (inbox.replyRate < 0.70) {
              inbox.replyRate += 0.02;
              inbox.replyRate = Math.min(inbox.replyRate, 0.70);
              inbox.replyRate = Math.floor(inbox.replyRate * 100) / 100;
            }
            dirty = true;
          }

          const toSend = inbox.dailyLimit - inbox.sentToday;
          if (toSend <= 0) {
           const tomorrow = now.plus({ days: 1 }).startOf('day');
           inbox.nextSendDate = tomorrow.toJSDate(); // Already start of day
            dirty = true;
            continue;
          }

          console.log(`⏩ Scheduling ${toSend} for ${inbox.inbox}`);

          const tomorrow = now.plus({ days: 1 }).startOf('day');
          inbox.nextSendDate = tomorrow.toJSDate();
          inbox.sentToday += toSend;
          inbox.totalEmailSent += toSend;
          dirty = true;

         const ws = parseSendWindow(now, inbox.sendWindow?.start, now.set({ hour: 9, minute: 0, second: 0, millisecond: 0 }).toJSDate());
         const we = parseSendWindow(now, inbox.sendWindow?.end, now.set({ hour: 17, minute: 0, second: 0, millisecond: 0 }).toJSDate());


          const times = calculateScheduledTimes(ws, we, toSend);

          const same = u.warmupInboxes
            .filter(i => i.status === "active" && i.inbox !== inbox.inbox)
            .map(i => ({ to: i.inbox, firstName: i.firstName || 'Mailing_Agent' }));

          const pool = users.flatMap(usr =>
            usr.warmupInboxes
              .filter(i => i.status === "active")
              .map(i => ({ to: i.inbox, firstName: i.firstName || 'Mailing_Agent' }))
          );

          for (let i = 0; i < toSend; i++) {
            let destObj = same.length
              ? same[Math.floor(Math.random() * same.length)]
              : pool[Math.floor(Math.random() * pool.length)];

            if (!destObj) continue;

            const { to, firstName } = destObj;
            const text = getRandomWarmupContent(firstName || 'Mailing_Agent');

            const job = {
              userId: u._id.toString(),
              warmupInboxId: inbox._id.toString(),
              inbox: inbox.inbox,
              appPassword: inbox.appPassword,
              firstName:inbox.firstName,
              sequenceNumber: i + 1,
              to,
              subject: `[Warmup] ${getRandom(SUBJECTS)}${i + 1}`,
              text,
              scheduledAt: times[i].toISO(),
              sendWindow: { start: inbox.sendWindow?.start, end: inbox.sendWindow?.end },
            };

            channel.sendToQueue(QUEUE_NAME,
              Buffer.from(JSON.stringify(job)),
              { persistent: true }
            );
          }
        }

        if (dirty) await u.save();
      }
    } catch (err) {
      console.error("❌ Scheduler error:", err);
    } finally {
      setTimeout(runCycle, 40 * 60 * 1000);
      isRunning = false;
    }
  }

  runCycle();
}

module.exports = { scheduler };
