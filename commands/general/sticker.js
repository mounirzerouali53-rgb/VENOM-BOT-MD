/**

 * أمر الملصق - تحويل صورة أو فيديو إلى ملصق

 */

const fs = require('fs');

const path = require('path');

const { exec } = require('child_process');

const crypto = require('crypto');

const webp = require('node-webpmux');

const ffmpegPath = require('ffmpeg-static');

const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const config = require('../../config');

const { getTempDir, deleteTempFile } = require('../../utils/tempManager');

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 ميغا

module.exports = {

  name: 'ملصق',

  aliases: ['s', 'stiker', 'stc'],

  description: 'حوّل صورة أو فيديو إلى ملصق مع ضغط تلقائي',

  usage: '.ملصق (رد على الوسائط)',

  category: 'عام',

  

  async execute(sock, msg, args, extra) {

    const chatId = extra.from;

    const messageToQuote = msg;

    let targetMessage = msg;

    

    const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;

    if (ctxInfo?.quotedMessage) {

      targetMessage = {

        key: { remoteJid: chatId, id: ctxInfo.stanzaId, participant: ctxInfo.participant },

        message: ctxInfo.quotedMessage,

      };

    }

    

    const mediaMessage =

      targetMessage.message?.imageMessage ||

      targetMessage.message?.videoMessage ||

      targetMessage.message?.documentMessage;

    

    if (!mediaMessage) {

      return extra.reply('📎 رّد على *صورة* أو *فيديو* بالأمر .ملصق أو أرسل الوسائط مع الأمر.');

    }

    

    const tempDir = getTempDir();

    const timestamp = Date.now();

    const tempInput = path.join(tempDir, `in_${timestamp}`);

    const tempOutput = path.join(tempDir, `out_${timestamp}.webp`);

    let tempFiles = [tempInput, tempOutput];

    

    try {

      const mediaBuffer = await downloadMediaMessage(

        targetMessage,

        'buffer',

        {},

        { logger: undefined, reuploadRequest: sock.updateMediaMessage },

      );

      

      if (!mediaBuffer) return extra.reply('❌ فشل تحميل الوسائط، حاول مرة أخرى.');

      if (mediaBuffer.length > MAX_FILE_SIZE) {

        return extra.reply(`❌ حجم الملف كبير: ${(mediaBuffer.length / 1024 / 1024).toFixed(2)}MB (الحد الأقصى: 50MB)`);

      }

      

      fs.writeFileSync(tempInput, mediaBuffer);

      

      const isAnimated =

        mediaMessage.mimetype?.includes('gif') ||

        mediaMessage.mimetype?.includes('video') ||

        (mediaMessage.seconds || 0) > 0;

      

      const ffmpegCmd = isAnimated

        ? `"${ffmpegPath}" -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 "${tempOutput}"`

        : `"${ffmpegPath}" -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 "${tempOutput}"`;

      

      await new Promise((resolve, reject) => exec(ffmpegCmd, (err) => (err ? reject(err) : resolve())));

      

      let webpBuffer = fs.readFileSync(tempOutput);

      

      const img = new webp.Image();

      await img.load(webpBuffer);

      

      const json = {

        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),

        'sticker-pack-name': config.packname || 'تم صنعه بواسطة',

        emojis: ['🤖'],

      };

      

      const exifAttr = Buffer.from([0x49,0x49,0x2a,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00]);

      const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');

      const exif = Buffer.concat([exifAttr, jsonBuffer]);

      exif.writeUIntLE(jsonBuffer.length, 14, 4);

      img.exif = exif;

      

      const finalBuffer = await img.save(null);

      await sock.sendMessage(extra.from, { sticker: finalBuffer }, { quoted: msg });

      

    } catch (error) {

      console.error('خطأ في أمر الملصق:', error);

      await extra.reply('❌ فشل إنشاء الملصق، تأكد من صحة الوسائط.');

    } finally {

      tempFiles.forEach(file => deleteTempFile(file));

    }

  },

};