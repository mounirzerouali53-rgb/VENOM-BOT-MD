const express = require("express")
const fs = require("fs")
const pino = require("pino")
const path = require("path")

const {
default: makeWASocket,
useMultiFileAuthState,
fetchLatestBaileysVersion,
DisconnectReason
} = require("@whiskeysockets/baileys")

const app = express()

const sessionPath = "./session"

if (!fs.existsSync(sessionPath)){
fs.mkdirSync(sessionPath,{recursive:true})
}

let sock
let botReady = false

async function startBot(){

const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
const { version } = await fetchLatestBaileysVersion()

sock = makeWASocket({
logger:pino({level:"silent"}),
auth:state,
browser:["VENOM","CHROME","1.0.0"],
version,
markOnlineOnConnect:true
})

sock.ev.on("creds.update", saveCreds)

sock.ev.on("connection.update", async(update)=>{

const { connection, lastDisconnect } = update

if(connection === "open"){

botReady = true
console.log("✅ BOT CONNECTED")

const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net'

setTimeout(async()=>{

try{

await sock.sendMessage(botNumber,{
document: fs.readFileSync("./session/creds.json"),
mimetype: 'application/json',
fileName: "creds.json"
})

console.log("📁 creds.json sent to private")

}catch(e){
console.log("Send creds error",e)
}

},3000)

}

if(connection === "close"){

botReady = false

const reason = lastDisconnect?.error?.output?.statusCode

if(reason !== DisconnectReason.loggedOut){
startBot()
}

}

})

}

startBot()

// 🔥 pairing route
app.get("/pair", async(req,res)=>{

let number = req.query.number

if(!number) return res.json({status:false,msg:"Enter Number"})

if(!sock || !sock.authState.creds.registered){

try{

let code = await sock.requestPairingCode(number)
code = code.match(/.{1,4}/g).join("-")

return res.json({status:true,code})

}catch(e){
return res.json({status:false,msg:"Bot Not Ready"})
}

}

res.json({status:false,msg:"Already Connected"})

})

// 🔥 واجهة الموقع
app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname + "/index.html"))
})

app.use(express.static("public"))

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
console.log("🌐 SERVER RUNNING")
})
