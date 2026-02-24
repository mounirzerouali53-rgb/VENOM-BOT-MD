const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

let sessions = {};
try {
  if (fs.existsSync(SESSIONS_FILE)) {
    sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE));
  }
} catch (e) {
  sessions = {};
}

function saveSessions() {
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

// نفس منطقك
function generatePairCode(pairId){
  return "DAMON123-" + pairId.slice(0,3);
}

// ================== API الأصلي ==================

app.get('/pair', (req, res) => {

  const pairId = nanoid(8);
  const code = generatePairCode(pairId);
  const sessionName = '𝐃𝐀𝐌𝐎𝐍';
  const createdAt = new Date().toISOString();

  const entry = {
    pairId,
    code,
    sessionName,
    createdAt,
    status: 'pending',
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
  };

  sessions[pairId] = entry;
  saveSessions();

  res.json(entry);
});

app.get('/pair/:pairId', (req, res) => {

  const entry = sessions[req.params.pairId];
  if (!entry) return res.status(404).json({ error: 'not found' });

  if (new Date(entry.expiresAt) < new Date() && entry.status === 'pending') {
    entry.status = 'expired';
    saveSessions();
  }

  res.json(entry);
});

app.post('/pair/confirm', (req, res) => {

  const { pairId, code } = req.body || {};
  if (!pairId || !code)
    return res.status(400).json({ error: 'required' });

  const entry = sessions[pairId];
  if (!entry) return res.status(404).json({ error: 'not found' });

  if (entry.code !== code)
    return res.status(400).json({ error: 'invalid' });

  entry.status = 'ready';
  entry.confirmedAt = new Date().toISOString();
  saveSessions();

  res.json({ success: true, entry });
});

// ================== Bridge للواجهة ==================

app.get('/ui/pair', (req, res) => {

  const number = req.query.number;
  if(!number) return res.json({status:false});

  const pairId = nanoid(8);
  const code = generatePairCode(pairId);
  const createdAt = new Date().toISOString();

  const entry = {
    pairId,
    number,
    code,
    sessionName:'𝐃𝐀𝐌𝐎𝐍',
    createdAt,
    status:'pending',
    expiresAt:new Date(Date.now()+5*60*1000).toISOString()
  };

  sessions[pairId] = entry;
  saveSessions();

  res.json({
    status:true,
    pairId:pairId,
    code:code
  });
});

app.get('/ui/status/:pairId',(req,res)=>{

  const entry = sessions[req.params.pairId];
  if(!entry) return res.json({status:false});

  res.json({status:entry.status});
});

// ==================

app.get('/', (req,res)=>res.send("VENOM Pairing Running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log("Server running on "+PORT));
