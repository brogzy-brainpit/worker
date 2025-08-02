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
        const sinceDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
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

        if (!subject.startsWith("[Warmup]")) {
          // console.log("      ⏩ Skipped: subject not [Warmup]");
          continue;
        }

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
          await connection.addFlags(msg.attributes.uid, "\\Seen");
          continue;
        }

        if (!rawBody.includes(firstName)) {
          // console.log(`  ⏩ first name is ${firstName}`);
          console.log("      ⏩ Skipped: missing WARMUP-ID in body");
          continue;
        }

        const match = fromHeader.match(/<([^>]+)>/);
        const senderEmail = match ? match[1] : fromHeader;

        if (senderEmail === inbox) {
          console.log("      🔁 Skipped: self‑sent");
          await connection.addFlags(msg.attributes.uid, "\\Seen");
          continue;
        }

        const senderUser = await User.findOne({ "warmupInboxes.inbox": senderEmail });
        if (!senderUser) {
          console.warn(`      ⚠️ user not found for inbox ${senderEmail}`);
          await connection.addFlags(msg.attributes.uid, "\\Seen");
          continue;
        }
        const inboxEntry = senderUser.warmupInboxes.find(
          (i) => i.inbox.toLowerCase() === senderEmail.toLowerCase()
        );

        if (!inboxEntry) {
          console.warn(`      ⚠️ Inbox entry not found`);
          await connection.addFlags(msg.attributes.uid, "\\Seen");
          continue;
        }
        inboxEntry.totalInboxHit = (inboxEntry.totalInboxHit || 0) + 1;

       // 💡 Step 1: Should we open this email at all?
       const skipRate = 0.10 + Math.random() * 0.1; // between 10%–20%
if (Math.random() < skipRate) {
  console.log("      👀 Skipped: human-like behavior (didn't even open)");
  continue; // don't mark as seen or reply
}

// ✅ Open it (mark as seen)
await connection.addFlags(msg.attributes.uid, "\\Seen");
inboxEntry.totalInboxSeen = (inboxEntry.totalInboxSeen || 0) + 1;
// 💡 Step 2: Should we reply?
if (Math.random() > replyRate) {
  console.log("      🗨️ Skipped: replyRate throttle (opened but no reply)");
  continue;
}

// ✅ Proceed to reply below


        // ✍️ Random reply text
        const replies = [
          "Thanks for your warmup email!",
          "Got it, appreciated.",
          "Received — no action needed.",
          "Looks good, thanks.",
          "👋 A quick warmup hello back!",
        ];
        const replyText = replies[Math.floor(Math.random() * replies.length)];

        console.log(`      📬 Replying to ${senderEmail}...`);

        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: inbox, 
            pass: appPassword },
          });
          // after sending mail, add:
          await sleep(500 + Math.random() * 2000); // wait 0.5s to 2.5s
          await transporter.sendMail({
            from: `"Warmup Bot" <${inbox}>`,
            to: senderEmail,
            subject: `RE: ${subject}`,
            text: replyText,
            inReplyTo: originalMessageId,
            references: originalMessageId,
          });

          inboxEntry.totalReply = (inboxEntry.totalReply || 0) + 1;
          

          await senderUser.save();
          console.log("      ✅ Reply sent & inbox stats updated");
        } catch (err) {
          console.error("      ❌ Reply failed:", err.message);
        }
        console.log("      👁 Marked as seen");
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
