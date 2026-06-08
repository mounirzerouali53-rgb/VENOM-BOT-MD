/**

 * أمر تغيير_صورة_بوت - تغيير صورة البوت

 */

const fs = require('fs');

const path = require('path');

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const { getTempDir, deleteTempFile } = require('../../utils/tempManager');

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

module.exports = {

  name: 'صورة_بوت',

  aliases: ['setppbot', 'setpp'],

  category: 'المالك',

  description: 'تغيير صورة البوت (رد على صورة أو ملصق)',

  usage: '.صورة_بوت',

  ownerOnly: true,

  async execute(sock, msg, args, extra) {

    try {

      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (!quoted) return extra.reply('*⚠️ رد على صورة أو ملصق مع .صورة_بوت*');

      const media = quoted.imageMessage || quoted.stickerMessage;

      if (!media) return extra.reply('*❌ الرسالة يجب أن تحتوي على صورة أو ملصق!*');

      const tmpDir = getTempDir();

      const filePath = path.join(tmpDir, `pp_${Date.now()}.jpg`);

      try {

        const stream = await downloadContentFromMessage(media, 'image');

        let buffer = Buffer.from([]);

        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        if (buffer.length > MAX_SIZE)

          return extra.reply(`*❌ الحجم كبير جداً: ${(buffer.length / 1024 / 1024).toFixed(2)}MB (الحد: 10MB)*`);

        fs.writeFileSync(filePath, buffer);

        await sock.updateProfilePicture(sock.user.id.split(':')[0] + '@s.whatsapp.net', { url: filePath });

        await extra.reply('*✅ تم تحديث صورة البوت بنجاح!*');

      } catch (e) {

        console.error('setbotpp error:', e);

        extra.reply('*❌ فشل في تحديث صورة البوت!*');

      } finally {

        deleteTempFile(filePath);

      }

    } catch (err) {

      console.error('setbotpp error:', err);

      extra.reply('*❌ فشل في تحديث صورة البوت!*');

    }

  }

};