const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

const SESSIONS_FILE = path.join(__dirname, 'sessions.json');

let sessions = {};
try {
  if (fs.existsSync(SESSIONS_FILE)) {
    sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE));
  }
} catch (e) {
  console.error('Failed to read sessions.json', e);
  sessions = {};
}

function saveSessions() {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
  } catch (e) {
    console.error('Failed to write sessions.json', e);
  }
}

// Fixed pairing code
function generatePairCode() {
  return "DAMON123";
}

app.get('/pair', (req, res) => {
  const pairId = nanoid(8);
  const code = generatePairCode();
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
  const { pairId } = req.params;
  const entry = sessions[pairId];

  if (!entry) return res.status(404).json({ error: 'pairId not found' });

  if (new Date(entry.expiresAt) < new Date() && entry.status === 'pending') {
    entry.status = 'expired';
    saveSessions();
  }

  res.json(entry);
});

app.post('/pair/confirm', (req, res) => {
  const { pairId, code } = req.body || {};

  if (!pairId || !code)
    return res.status(400).json({ error: 'pairId and code required' });

  const entry = sessions[pairId];
  if (!entry) return res.status(404).json({ error: 'pairId not found' });

  if (entry.code !== code)
    return res.status(400).json({ error: 'invalid code' });

  entry.status = 'ready';
  entry.confirmedAt = new Date().toISOString();
  saveSessions();

  res.json({ success: true, entry });
});

// Serve index.html on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
