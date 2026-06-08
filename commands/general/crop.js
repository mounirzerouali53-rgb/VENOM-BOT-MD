/**

 * قص - قص أي صورة/ستيكر/فيديو لمربع ستكر

 */

const fs = require('fs');

const path = require('path');

const crypto = require('crypto');

const { exec } = require('child_process');

const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const webp = require('node-webpmux');

const config = require('../../config');

const { getTempDir, deleteTempFile } = require('../../utils/tempManager');

module.exports = {

  name: 'قص',

  aliases: ['مربع','cropper'],

  category: 'عام',

  description: 'قص أي صورة/ستيكر/فيديو لمربع ستكر',

  usage: '.قص (رد على صورة/ستيكر/فيديو)',

  async execute(sock, msg, args, extra) {

    const tmpDir = getTempDir();

    const tempInput = path.join(tmpDir, `temp_${Date.now()}`);

    const tempOutput = path.join(tmpDir, `crop_${Date.now()}.webp`);

    const tempFiles = [tempInput, tempOutput];

    try {

      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      const targetMessage = quotedMsg ? { key: { remoteJid: extra.from, id: msg.message.extendedTextMessage.contextInfo.stanzaId, participant: msg.message.extendedTextMessage.contextInfo.participant }, message: quotedMsg } : msg;

      const mediaType = Object.keys(targetMessage.message || {})[0];

      if (!['imageMessage','stickerMessage','videoMessage','documentMessage'].includes(mediaType)) return extra.reply('*✂️ رد على صورة/ستيكر/فيديو باش نقصه*');

      // تحميل الميديا

      const mediaBuffer = await downloadMediaMessage(targetMessage, 'buffer', {}, { logger: undefined, reuploadRequest: sock.updateMediaMessage });

      fs.writeFileSync(tempInput, mediaBuffer);

      // قص وتحويل لمربع webp

      const isVideo = mediaType === 'videoMessage';

      const dur = isVideo ? 3 : null;

      const ffmpegCmd = isVideo

        ? `ffmpeg -i "${tempInput}" -t ${dur} -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=12" -c:v libwebp -loop 0 -quality 50 "${tempOutput}"`

        : `ffmpeg -i "${tempInput}" -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512" -c:v libwebp -loop 0 -quality 75 "${tempOutput}"`;

      await new Promise((res, rej) => exec(ffmpegCmd, (err) => err ? rej(err) : res()));

      if (!fs.existsSync(tempOutput)) throw new Error('*❌ فشل إنشاء المربع*');

      // إضافة الميتاداتا

      const img = new webp.Image();

      img.load(fs.readFileSync(tempOutput));

      const json = { 'sticker-pack-id': crypto.randomBytes(32).toString('hex'), 'sticker-pack-name': config.packname || 'Made by', 'emojis':['✂️'] };

      const exifAttr = Buffer.from([0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00]);

      const exifBuffer = Buffer.concat([exifAttr, Buffer.from(JSON.stringify(json), 'utf8')]);

      exifBuffer.writeUIntLE(Buffer.from(JSON.stringify(json)).length,14,4);

      img.exif = exifBuffer;

      const finalBuffer = await img.save(null);

      await sock.sendMessage(extra.from, { sticker: finalBuffer }, { quoted: msg });

    } catch {

      extra.reply('*❌ فشل قص الصورة/فيديو! جرب مع صورة أو فيديو آخر*');

    } finally {

      tempFiles.forEach(f => deleteTempFile(f));

    }

  }

};