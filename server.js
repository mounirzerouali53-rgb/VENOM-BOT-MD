const express = require("express")
const fs = require("fs")
const path = require("path")
const pino = require("pino")
const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason,
makeCacheableSignalKeyStore,
delay
} = require("@whiskeysockets/baileys")

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static("public"))

let sock

app.get("/pair", async (req,res)=>{

let number = req.query.number

if(!number) return res.json({status:false,msg:"رقم خاطئ"})

number = number.replace(/[^0-9]/g,'')

const { state, saveCreds } = await useMultiFileAuthState("./temp-session")

sock = makeWASocket({
logger:pino({level:"silent"}),
printQRInTerminal:false,
auth:{
creds:state.creds,
keys:makeCacheableSignalKeyStore(state.keys,pino({level:"fatal"}))
}
})

sock.ev.on("creds.update",saveCreds)

sock.ev.on("connection.update",async(update)=>{

const {connection,lastDisconnect}=update

// ✅ pairing code منين يكون ready
if(connection==="connecting"){
if(!state.creds.registered){

setTimeout(async()=>{

let code = await sock.requestPairingCode(number)
code = code?.match(/.{1,4}/g)?.join("-") || code

res.json({status:true,code:code})

},3000)

}
}

// ✅ منين تربط فالواتساب
if(connection==="open"){

let botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net"

await delay(5000)

// 📤 صيفط creds.json فالخاص
let creds = fs.readFileSync("./temp-session/creds.json")

await sock.sendMessage(botNumber,{
document:creds,
mimetype:"application/json",
fileName:"creds.json",
caption:"✔️ Session Connected"
})

// 🗑️ مسح session
await delay(3000)
fs.rmSync("./temp-session",{recursive:true,force:true})

process.exit(0)
}

if(connection==="close"){
const reason=lastDisconnect?.error?.output?.statusCode
if(reason===DisconnectReason.loggedOut){
fs.rmSync("./temp-session",{recursive:true,force:true})
process.exit()
}
}

})

})

app.listen(PORT,()=>{
console.log(`
==================================
SERVER RUNNING
==================================
🌐 LINK:
https://${process.env.RENDER_EXTERNAL_HOSTNAME}
==================================
`)
})
