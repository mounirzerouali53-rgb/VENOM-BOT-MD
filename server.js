const express = require("express")
const fs = require("fs")
const path = require("path")
const pino = require("pino")

const {
default: makeWASocket,
useMultiFileAuthState,
fetchLatestBaileysVersion,
DisconnectReason
} = require("@whiskeysockets/baileys")

const app = express()

const sessionPath = "/opt/render/project/src/session"

if (!fs.existsSync(sessionPath)){
fs.mkdirSync(sessionPath,{recursive:true})
}

let sock

async function connectSocket(){

const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

const { version } = await fetchLatestBaileysVersion()

sock = makeWASocket({
logger:pino({level:"info"}),
auth:state,
browser:["VENOM","CHROME","1.0.0"],
version
})

sock.ev.on("creds.update", saveCreds)
sock.ev.on("connection.update", (update)=>{

console.log(update)

const { connection, lastDisconnect } = update
if(connection === "close"){

const reason = lastDisconnect?.error?.output?.statusCode

if(reason !== DisconnectReason.loggedOut){
connectSocket()
}

}

if(connection === "open"){
console.log("✅ BOT READY FOR PAIRING")
}

})

}

connectSocket() // 🔥 هنا الحل

app.get("/pair", async (req,res)=>{

let number = req.query.number

if(!number) return res.send("Enter Number")

try{

let code = await sock.requestPairingCode(number)

code = code.match(/.{1,4}/g).join("-")

res.send(code)

}catch(e){

res.send("Error: Connection Closed")

}

})

app.get("/",(req,res)=>{
res.sendFile(__dirname + "/index.html")
})

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
console.log("🕷️ SERVER RUNNING")
})
