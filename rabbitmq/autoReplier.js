// rabbitmq/autoReplier.js
require("dotenv").config();
const imaps = require("imap-simple");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const User = require("../model/userAuth");

let isRunning = false;

async function withTimeout(promise, ms, label) {
  let timeout;
  const timer = new Promise((_, rej) =>
    timeout = setTimeout(() => rej(new Error(`${label} timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timer]).finally(() => clearTimeout(timeout));
}
function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}


async function startAutoReplier() {
  if (isRunning) {
    console.log("⛔ Scheduler already running");
    return;
  }
  isRunning = true;
  console.log("🚀 Starting auto‑replier...");

  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  const users = await User.find({ "warmupInboxes.status": "active" });
  console.log(`👥 Found ${users.length} user(s)`);

  for (const user of users) {
    for (const inboxCfg of user.warmupInboxes) {
      if (inboxCfg.status !== "active") continue;
         // ✅ Add delay here
    await sleep(10000 + Math.random() * 15000); // 10–25 sec delay

      const { inbox, appPassword, firstName} = inboxCfg;
      const replyRate = inboxCfg.replyRate || 0.3;

      console.log(`\n📥 Checking inbox: ${inbox}`);
      let connection;

      try {
        connection = await withTimeout(
          imaps.connect({
            imap: {
              user: inbox,
              password: appPassword,
              host: "imap.gmail.com",
              port: 993,
              tls: true,
              tlsOptions: { rejectUnauthorized: false },
              authTimeout: 30000,
            },
          }),
          10000,
          "IMAP connect"
        );
        // console.log("   ▶️ IMAP connected");
      } catch (err) {
        console.error(`   ❌ IMAP connect failed for ${inbox}:`, err.message);
        continue;
      }

      try {
        await withTimeout(connection.openBox("INBOX"), 5000, "openBox");
        // console.log("   📂 INBOX opened");
      } catch (err) {
        console.error(`   ❌ openBox failed for ${inbox}:`, err.message);
        connection.end();
        continue;
      }

      let messages = [];
      try {
        // const sinceDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // last 2 hours
        const sinceHours = 2 + Math.random(); // random between 1.5 to 2.5 hours
const sinceDate = new Date(Date.now() - sinceHours * 60 * 60 * 1000);

        const sinceStr = sinceDate.toISOString();
        console.log(`   🔍 Searching for UNSEEN since ${sinceStr}...`);
        messages = await withTimeout(
          connection.search(["UNSEEN", ["SINCE", sinceStr]], {
            bodies: ["HEADER.FIELDS (FROM SUBJECT MESSAGE-ID)"],
            markSeen: false,
          }),
          10000,
          "search headers"
        );
        // console.log(`   🔍 ${messages.length} unseen message(s) found`);
      } catch (err) {
        console.error(`   ❌ Search failed for ${inbox}:`, err.message);
      }

      for (const msg of messages) {
     
        const headerPart = msg.parts.find(p => p.which.includes("HEADER.FIELDS"));
const fromHeader = headerPart?.body.from?.[0] || "";
const subject = headerPart?.body.subject?.[0] || "";
const originalMessageId = headerPart?.body["message-id"]?.[0];

        // console.log(`   ✉️  Header: From=${fromHeader} | Subject="${subject}"`);

        let rawBody = "";
        try {
          // console.log("      📥 Fetching TEXT body...");
          const fullMsg = await withTimeout(
            connection.search([["UID", msg.attributes.uid]], {
              bodies: ["TEXT"],
              struct: true,
            }),
            10000,
            "fetch body"
          );
          rawBody = fullMsg?.[0]?.parts?.[0]?.body?.toString() || "";
          // console.log("      📄 Body snippet:", rawBody.slice(0, 60).replace(/\n/g, " ") + "…");
        } catch (err) {
          console.error(`      ❌ Fetch body failed:`, err.message);
          // await connection.addFlags(msg.attributes.uid, "\\Seen");
          continue;
        }
        const isWarmup = subject.startsWith("[Warmup]") && rawBody.toLowerCase().includes(firstName.toLowerCase());


        const roll = Math.random();
        let shouldOpen = true;

if (!isWarmup) {
  // Only open 60–70% of external (non-warmup) emails
  const openExternalThreshold = 0.4 + Math.random() * 0.1; // 0.6–0.7
  shouldOpen = roll < openExternalThreshold;
}

if (!shouldOpen) {
  // inboxEntry.totalInboxUnseen = (inboxEntry.totalInboxUnseen || 0) + 1; not gonna be helpful here, since its not from us, because we only logg emails from our system and we log how many emails wwe sent in total and everyday
  console.log("      👀 Skipped: did not open (realistic behavior)");
  continue;
}


        const match = fromHeader.match(/^(.*)?<([^>]+)>$/);
        const senderName = match ? match[1].trim().replace(/(^"|"$)/g, '') : '';
        const senderEmail = match ? match[2] : fromHeader;

        if (senderEmail === inbox) {
          // console.log("      🔁 Skipped: self‑sent");
          // await connection.addFlags(msg.attributes.uid, "\\Seen");
          continue;
        }

        if (!isWarmup) {
  console.log("      🗨️ Skipped: not a warmup email");
  continue;
}
        const senderUser = await User.findOne({ "warmupInboxes.inbox": senderEmail });
        if (!senderUser) {
          console.warn(`      ⚠️ user not found for inbox ${senderEmail}`);
          // await connection.addFlags(msg.attributes.uid, "\\Seen");
          continue;
        }
        const inboxEntry = senderUser.warmupInboxes.find(
          (i) => i.inbox.toLowerCase() === senderEmail.toLowerCase()
        );

        if (!inboxEntry) {
          console.warn(`      ⚠️ Inbox entry not found`);
          // await connection.addFlags(msg.attributes.uid, "\\Seen");
          continue;
        }
        inboxEntry.totalInboxHit = (inboxEntry.totalInboxHit || 0) + 1;

       // 💡 Step 1: Should we open this email at all?

const skipRate = 0.10 + Math.random() * 0.10;
if (roll < skipRate) {
inboxEntry.totalInboxUnseen = (inboxEntry.totalInboxUnseen || 0) + 1;
  console.log("      👀 Skipped: human-like behavior (didn't even open)");
  continue;
}


// ✅ Step 2: Mark as seen, maybe flag or important
const flags = ["\\Seen"];

if (roll >= 0.4 && roll < 0.6) {
  flags.push("\\Flagged");
  
  console.log("      ⭐ Marked as starred");
} else if (roll >= 0.6 && roll < 0.75) {
  flags.push("\\Important");
  console.log("      ❗ Marked as important");
} else if (roll >= 0.9) {
  flags.push("\\Flagged", "\\Important");
  console.log("      ⭐❗ Marked as starred & important");
}

// await connection.addFlags(msg.attributes.uid, flags);

// 🔢 Track how many were starred / important
inboxEntry.totalInboxSeen = (inboxEntry.totalInboxSeen || 0) + 1;
inboxEntry.totalFlagged = (inboxEntry.totalFlagged || 0) + (flags.includes("\\Flagged") ? 1 : 0);
inboxEntry.totalImportant = (inboxEntry.totalImportant || 0) + (flags.includes("\\Important") ? 1 : 0);
// ✅ Save everything here — once per message
await senderUser.save();
if (!isWarmup) {
  console.log("      🗨️ Skipped: not a warmup email");
  continue;
}

// 💡 Step 3: Should we reply?
if (Math.random() > replyRate) {
  console.log("      🗨️ Skipped: replyRate throttle (opened but no reply)");
  continue;
}

// ✅ Proceed to reply...



        // ✍️ Random reply text
        function getRandomWarmupContent(firstName) {
  const CONTENTS =[
          `hello ${firstName}, Thanks for your warmup email!`,
          `Got it ${firstName}, appreciated.`,
          `Received ${firstName}, no action needed.`,
          `Looks good, thanks and i didnt include your name, so this should not be opened!!!`,
          `👋 A quick warmup hello back! thanks ${firstName}, from ${senderName}`,
        ];

  return CONTENTS[Math.floor(Math.random() * CONTENTS.length)];
}

        console.log(`      📬 Replying to ${senderEmail}...`);

        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: inbox, 
            pass: appPassword },
          });
          // after sending mail, add:
          await sleep(5000 + Math.random() * 10000); // wait 5s to 15s
           const text = getRandomWarmupContent(firstName || '');
          await transporter.sendMail({
            from: `"${firstName}" <${inbox}>`,
            to: senderEmail,
            subject: `RE: ${subject}`,
            text,
            inReplyTo: originalMessageId,
            references: originalMessageId,
          });

          inboxEntry.totalReply = (inboxEntry.totalReply || 0) + 1;
          // ✅ Save everything here — once per message
await senderUser.save();
          console.log("      ✅ Reply sent & inbox stats updated");
        } catch (err) {
          console.error("      ❌ Reply failed:", err.message);
        }
        // console.log("      👁 Marked as seen");
        await connection.addFlags(msg.attributes.uid, flags);
console.log(`      👁 Marked as seen${flags.includes("\\Flagged") ? " ⭐" : ""}${flags.includes("\\Important") ? " ❗" : ""}`);
// ✅ Save everything here — once per message
await senderUser.save();
      }
      
      try {
        connection.end();
      } catch (err) {
        console.warn(`⚠️ Could not close connection for ${inbox}:`, err.message);
      }
      console.log(`   ✔ Finished ${inbox}`);
    }
  }

  console.log("\n🏁 Auto‑reply cycle complete.");
  isRunning = false;
}

if (require.main === module) {
  startAutoReplier().catch(err => {
    console.error("🔥 Fatal error:", err);
  });
}

module.exports = { startAutoReplier };
