/**

 * صورة البروفايل - جلب صورة أي مستخدم

 */

const axios = require('axios');

module.exports = {

  name: 'صورة',

  aliases: ['pp','getpic'],

  category: 'عام',

  description: 'جلب صورة بروفايل أي مستخدم',

  usage: '.صورة (رد أو منشن المستخدم)',

  async execute(sock, msg, args, extra) {

    try {

      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      let user = quoted ? msg.message.extendedTextMessage.contextInfo.participant

               : msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] 

               || extra.sender;

      if (!user) return extra.reply('*❌ لم أستطع التعرف على المستخدم*');

      try {

        const url = await sock.profilePictureUrl(user, 'image');

        if (!url) return extra.reply('*❌ لم يتم العثور على صورة البروفايل*');

        const buffer = Buffer.from((await axios.get(url, { responseType: 'arraybuffer' })).data);

        await sock.sendMessage(extra.from, {

          image: buffer,

          caption: `👤 صورة بروفايل @${user.split('@')[0]}`,

          mentions: [user]

        }, { quoted: msg });

      } catch {

        extra.reply('*❌ لم يتم العثور على صورة البروفايل*');

      }

    } catch {

      extra.reply('*❌ لم يتم العثور على صورة البروفايل*');

    }

  }

};