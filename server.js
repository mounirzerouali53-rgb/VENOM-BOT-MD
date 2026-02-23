const express = require("express")
const P = require("pino")
const path = require("path")

const {
default: makeWASocket,
useMultiFileAuthState,
DisconnectReason
} = require("@whiskeysockets/baileys")

const app = express()

app.use(express.static(path.join(__dirname)))

async function getCode(number){

const { state, saveCreds } = await useMultiFileAuthState("./session")

const sock = makeWASocket({
logger: P({ level: "silent" }),
auth: state,
printQRInTerminal: false
})

sock.ev.on("creds.update", saveCreds)

await new Promise((resolve,reject)=>{

sock.ev.on("connection.update",(update)=>{

const { connection } = update

if(connection === "connecting"){
resolve()
}

if(connection === "close"){
reject("Connection Closed")
}

})

})

let code = await sock.requestPairingCode(number)
return code

}

app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"index.html"))
})

app.get("/pair",async(req,res)=>{

let number = req.query.number

if(!number){
return res.json({
status:false,
msg:"Enter Number"
})
}

try{

let code = await getCode(number)

res.json({
status:true,
code:code
})

}catch(e){

res.json({
status:false,
msg:e.toString()
})

}

})

app.listen(3000,()=>{
console.log("VENOM PAIR SERVER RUNNING")
})
