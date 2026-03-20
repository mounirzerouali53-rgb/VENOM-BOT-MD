/**

 * أمر .اسرق - أخذ ملصق وتغيير اسم الباك

 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const webp = require('node-webpmux');

const crypto = require('crypto');

const config = require('../../config');

module.exports = {

  name: 'اسرق',

  aliases: ['steal', 'take'],

  description: 'سرقة الملصق وتغيير اسم الباك',

  usage: '.اسرق [اسم الباك] (رد على ملصق)',

  category: 'general',

  

  async execute(sock, msg, args, extra) {

    let targetMessage = msg;

    const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;

    

    // التحقق من الرد على رسالة

    if (ctxInfo?.quotedMessage) {

      targetMessage = {

        key: { 

          remoteJid: extra.from, 

          id: ctxInfo.stanzaId, 

          participant: ctxInfo.participant 

        },

        message: ctxInfo.quotedMessage,

      };

    }

    

    const stickerMsg = targetMessage.message?.stickerMessage;

    

    if (!stickerMsg) {

      return extra.reply('🎭 رّد على *ملصق* بالأمر .اسرق لسرقته.');

    }

    

    try {

      // تحميل الملصق

      const mediaBuffer = await downloadMediaMessage(

        targetMessage,

        'buffer',

        {},

        { logger: undefined, reuploadRequest: sock.updateMediaMessage },

      );

      

      if (!mediaBuffer) return extra.reply('❌ فشل تحميل الملصق. حاول مرة أخرى.');

      

      const userName = msg.pushName || extra.sender.split('@')[0];

      const packname = args.length ? args.join(' ') : userName;

      

      const img = new webp.Image();

      await img.load(mediaBuffer);

      

      const json = {

        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),

        'sticker-pack-name': packname,

        emojis: ['🤖'],

      };

      

      const exifAttr = Buffer.from([

        0x49,0x49,0x2a,0x00,0x08,0x00,0x00,0x00,

        0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,

        0x00,0x00,0x16,0x00,0x00,0x00

      ]);

      

      const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');

      const exif = Buffer.concat([exifAttr, jsonBuffer]);

      exif.writeUIntLE(jsonBuffer.length, 14, 4);

      

      img.exif = exif;

      const finalBuffer = await img.save(null);

      

      await sock.sendMessage(extra.from, { sticker: finalBuffer }, { quoted: msg });

      

    } catch (error) {

      console.error('أمر .اسرق خطأ:', error);

      await extra.reply('❌ فشل سرقة الملصق. حاول مرة أخرى.');

    }

  },

};