/**
 * Update Command - Fetch latest code via ZIP (Owner Only)
 * Preserves runtime/state dirs: node_modules, session, tmp, temp, database, config.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const config = require('../../config');

const MAX_REDIRECTS = 5;

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
      if (err) return reject(new Error((stderr || stdout || err.message || '').toString()));
      resolve((stdout || '').toString());
    });
  });
}

async function extractZip(zipPath, outDir) {
  if (process.platform === 'win32') {
    const cmd = `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir.replace(/\\\\/g, '/')}' -Force"`;
    await run(cmd);
    return;
  }
  // Try unzip, then 7z, then busybox unzip
  try {
    await run('command -v unzip');
    await run(`unzip -o '${zipPath}' -d '${outDir}'`);
    return;
  } catch {}
  try {
    await run('command -v 7z');
    await run(`7z x -y '${zipPath}' -o'${outDir}'`);
    return;
  } catch {}
  try {
    await run('busybox unzip -h');
    await run(`busybox unzip -o '${zipPath}' -d '${outDir}'`);
    return;
  } catch {}
  throw new Error('❗ لا توجد أداة فك ضغط (unzip/7z/busybox). الرجاء تثبيت إحداها.');
}

function downloadFile(url, dest, visited = new Set()) {
  return new Promise((resolve, reject) => {
    try {
      if (visited.has(url) || visited.size > MAX_REDIRECTS) {
        return reject(new Error('⚠️ عدد مرات إعادة التوجيه كبير جداً'));
      }
      visited.add(url);

      const client = url.startsWith('https://') ? https : http;
      const req = client.get(url, {
        headers: {
          'User-Agent': 'KnightBot-Updater/1.0',
          'Accept': '*/*'
        }
      }, res => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
          const location = res.headers.location;
          if (!location) return reject(new Error(`HTTP ${res.statusCode} بدون رابط توجيه`));
          const nextUrl = new URL(location, url).toString();
          res.resume();
          return downloadFile(nextUrl, dest, visited).then(resolve).catch(reject);
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`❌ فشل التحميل: HTTP ${res.statusCode}`));
        }

        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', err => {
          try { file.close(() => {}); } catch {}
          fs.unlink(dest, () => reject(err));
        });
      });
      req.on('error', err => {
        fs.unlink(dest, () => reject(err));
      });
    } catch (e) {
      reject(e);
    }
  });
}

function copyRecursive(src, dest, ignore = [], relative = '', outList = []) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    if (ignore.includes(entry)) continue;
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.lstatSync(s);
    if (stat.isDirectory()) {
      copyRecursive(s, d, ignore, path.join(relative, entry), outList);
    } else {
      fs.copyFileSync(s, d);
      if (outList) outList.push(path.join(relative, entry).replace(/\\\\/g, '/'));
    }
  }
}

async function updateViaZip(zipUrl) {
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const zipPath = path.join(tmpDir, 'update.zip');
  const extractTo = path.join(tmpDir, 'update_extract');

  await downloadFile(zipUrl, zipPath);

  if (fs.existsSync(extractTo)) fs.rmSync(extractTo, { recursive: true, force: true });
  await extractZip(zipPath, extractTo);

  const entries = fs.readdirSync(extractTo);
  const rootCandidate = entries.length === 1 ? path.join(extractTo, entries[0]) : extractTo;
  const srcRoot = fs.existsSync(rootCandidate) && fs.lstatSync(rootCandidate).isDirectory() ? rootCandidate : extractTo;

  const ignore = [
    'node_modules',
    '.git',
    'session',
    'tmp',
    'temp',
    'database',
    'config.js'
  ];
  const copied = [];
  copyRecursive(srcRoot, process.cwd(), ignore, '', copied);

  try { fs.rmSync(extractTo, { recursive: true, force: true }); } catch {}
  try { fs.rmSync(zipPath, { force: true }); } catch {}

  return { copiedFiles: copied };
}

module.exports = {
  name: 'تحديث',
  aliases: ['upgrade'],
  category: 'owner',
  description: 'تحديث البوت من رابط ZIP (للمالك فقط)',
  usage: '.update [رابط_الملف_الاختياري]',
  ownerOnly: true,

  async execute(sock, msg, args, extra) {
    const chatId = msg.key.remoteJid;
    const zipUrl = (args[0] || config.updateZipUrl || process.env.UPDATE_ZIP_URL || '').trim();

    if (!zipUrl) {
      return extra.reply('❌ لا يوجد رابط تحديث مضبوط. قم بتعيين updateZipUrl في config.js أو أرسل الرابط: `.update <رابط_الملف_الضاغط>`');
    }

    try {
      await extra.reply('🔄 𝄞☯︎ جارٍ تحديث البوت، يرجى الانتظار… 𝄞☯︎');

      const { copiedFiles } = await updateViaZip(zipUrl);

      const summary = copiedFiles.length
        ? `✅ اكتمل التحديث. عدد الملفات المُحدَّثة: ${copiedFiles.length}`
        : '✅ اكتمل التحديث. لا توجد ملفات تحتاج تحديث.';

      await sock.sendMessage(chatId, { text: `✨━━━━━━━━━━━━━━━✨\n${summary}\n🔄 جارٍ إعادة التشغيل…\n✨━━━━━━━━━━━━━━━✨` }, { quoted: msg });

      // Attempt restart via pm2 if available, else exit to allow panel auto-restart
      try {
        await run('pm2 restart all');
        return;
      } catch {}

      setTimeout(() => process.exit(0), 500);
    } catch (error) {
      console.error('فشل التحديث:', error);
      await sock.sendMessage(chatId, { text: `❌━━━━━━━━━━━━━━━❌\n⚠️ فشل التحديث:\n${String(error.message || error)}\n❌━━━━━━━━━━━━━━━❌` }, { quoted: msg });
    }
  }
};