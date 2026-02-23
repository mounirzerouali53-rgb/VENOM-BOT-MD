const express = require("express");
const fs = require("fs");
const path = require("path");
const pino = require("pino");

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const app = express();

const sessionPath = path.join(__dirname, "session");
if (!fs.existsSync(sessionPath)) {
  fs.mkdirSync(sessionPath, { recursive: true });
}

const OWNER_NUMBER = process.env.OWNER_NUMBER; // بدون +
if (!OWNER_NUMBER) throw new Error("Set OWNER_NUMBER env variable!");

let sock;
let isConnected = false;

async function connectSocket() {
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    logger: pino({ level: "info" }),
    auth: state,
    browser: ["VENOM-BOT-MD", "CHROME", "1.0.0"],
    version,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    console.log(update);

    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      isConnected = false;

      if (reason !== DisconnectReason.loggedOut) {
        connectSocket();
      } else {
        console.log("Logged out. Delete session folder.");
      }
    }

    if (connection === "open") {
      console.log("✅ BOT CONNECTED");
      isConnected = true;

      // 📩 إرسال creds.json فالخاص
      const credsPath = path.join(sessionPath, "creds.json");

      if (fs.existsSync(credsPath)) {
        try {
          const buffer = fs.readFileSync(credsPath);

          await sock.sendMessage(
            OWNER_NUMBER + "@s.whatsapp.net",
            {
              document: buffer,
              mimetype: "application/json",
              fileName: "creds.json",
            }
          );

          console.log("📩 creds.json sent to owner
