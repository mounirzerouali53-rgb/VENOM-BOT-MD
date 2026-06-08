/**

 * تحويل الملصق لصورة - Sticker to PNG

 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const { webp2png } = require('../../utils/webp2mp4');

module.exports = {

  name: 'ملصقصورة',

  aliases: ['toimg', 'stickertoimg', 'sticker2img', 'svideo'],

  category: 'عام',

  description: 'حوّل الملصق لصورة PNG',

  usage: '.ملصقصورة (رد على ملصق)',

  

  async execute(sock, msg, args, extra) {

    try {

      const replyText = '📎 رد على ملصق لتحويله لصورة!';

      

      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;

      if (!ctxInfo?.quotedMessage) return extra.reply(replyText);

      

      const targetMessage = {

        key: {

          remoteJid: extra.from,

          id: ctxInfo.stanzaId,

          participant: ctxInfo.participant,

        },

        message: ctxInfo.quotedMessage,

      };

      

      const stickerMessage = targetMessage.message?.stickerMessage;

      if (!stickerMessage) return extra.reply(replyText);

      

      const stickerBuffer = await downloadMediaMessage(targetMessage, 'buffer', {}, { logger: undefined, reuploadRequest: sock.updateMediaMessage });

      if (!stickerBuffer) return extra.reply('❌ فشل تنزيل الملصق. حاول مجدداً.');

      

      const isAnimated = stickerMessage.isAnimated || stickerMessage.mimetype?.includes('animated');

      

      if (isAnimated) {

        const { webp2mp4 } = require('../../utils/webp2mp4');

        const mp4Buffer = await webp2mp4(stickerBuffer);

        if (!mp4Buffer || mp4Buffer.length === 0) throw new Error('الفيديو فارغ أو غير موجود');

        

        const maxSize = 16 * 1024 * 1024;

        if (mp4Buffer.length > maxSize) throw new Error(`حجم الفيديو كبير جداً: ${(mp4Buffer.length/1024/1024).toFixed(2)}MB`);

        

        await sock.sendMessage(extra.from, { video: mp4Buffer, mimetype: 'video/mp4', gifPlayback: true }, { quoted: msg });

      } else {

        const imageBuffer = await webp2png(stickerBuffer);

        await sock.sendMessage(extra.from, { image: imageBuffer, caption: '✅ تم التحويل لصورة *PNG*' }, { quoted: msg });

      }

      

    } catch (error) {

      console.error('خطأ في أمر ملصقصورة:', error);

      await extra.reply(`❌ فشل تحويل الملصق لصورة.\n\nخطأ: ${error.message}`);

    }

  }

};