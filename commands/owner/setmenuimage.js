/**

 * أمر صورة_القائمة - تغيير صورة القائمة

 */

const fs = require('fs');

const path = require('path');

const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {

  name: 'صورة_القائمة',

  aliases: ['setmenuimg', 'menuimg'],

  category: 'المالك',

  description: 'تغيير صورة القائمة (رد على صورة أو ملصق)',

  usage: '.صورة_القائمة',

  ownerOnly: true,

  async execute(sock, msg, args, extra) {

    try {

      const chatId = extra.from;

      const ctx = msg.message?.extendedTextMessage?.contextInfo;

      if (!ctx?.quotedMessage) return extra.reply('*📷 رد على صورة أو ملصق لتعيينها كصورة القائمة*');

      const quoted = ctx.quotedMessage;

      const media = quoted.imageMessage || quoted.stickerMessage;

      if (!media) return extra.reply('*❌ الرسالة يجب أن تحتوي على صورة أو ملصق!*');

      const targetMsg = { key: { remoteJid: chatId, id: ctx.stanzaId, participant: ctx.participant }, message: quoted };

      let buffer = await downloadMediaMessage(targetMsg, 'buffer', {}, { logger: undefined, reuploadRequest: sock.updateMediaMessage });

      if (!buffer) return extra.reply('*❌ فشل تحميل الصورة، حاول مرة أخرى!*');

      const sharp = require('sharp');

      if (quoted.stickerMessage || !media.mimetype?.includes('jpeg') && !media.mimetype?.includes('jpg')) {

        buffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();

      }

      const filePath = path.join(__dirname, '../../utils/bot_image.jpg');

      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      fs.writeFileSync(filePath, buffer);

      await extra.reply('*✅ تم تحديث صورة القائمة بنجاح!*');

    } catch (err) {

      console.error('SetMenuImage error:', err);

      extra.reply('*❌ فشل في تعيين صورة القائمة!*');

    }

  }

};