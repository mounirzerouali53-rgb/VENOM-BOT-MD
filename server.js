const express = require("express")
const P = require("pino")
const path = require("path")

const {
default: makeWASocket,
useMultiFileAuthState
} = require("@whiskeysockets/baileys")

const app = express()

app.use(express.static(path.join(__dirname)))

async function getCode(number){

const { state } = await useMultiFileAuthState("./session")

const sock = makeWASocket({
logger:P({level:"silent"}),
auth:state
})

await sock.waitForConnectionUpdate(
u=>u.connection==="open"
)

let code=await sock.requestPairingCode(number)
return code
}

app.get("/pair",async(req,res)=>{

let number=req.query.number
if(!number)return res.json({error:"enter number"})

let code=await getCode(number)
res.json({code})

})

app.listen(3000)
