/**

 * أمر حظر - حظر مستخدم

 */

module.exports = {

  name: 'حظر',

  aliases: ['bl', 'ح'],

  category: 'المالك',

  description: 'حظر مستخدم',

  usage: '.حظر @المستخدم أو الرد عليه',

  ownerOnly: true,

  

  async execute(sock, msg, args, extra) {

    try {

      let target;

      

      const ctx = msg.message?.extendedTextMessage?.contextInfo;

      const mentioned = ctx?.mentionedJid || [];

      

      if (mentioned && mentioned.length > 0) {

        target = mentioned[0];

      } else if (ctx?.participant && ctx.stanzaId && ctx.quotedMessage) {

        target = ctx.participant;

      } else {

        return extra.reply('*❌ المرجو تحديد المستخدم أو الرد عليه للحظر!*');

      }

      

      await sock.updateBlockStatus(target, 'block');

      

      await sock.sendMessage(extra.from, {

        text: `*✅ @${target.split('@')[0]} تم حظره!*`,

        mentions: [target]

      }, { quoted: msg });

      

    } catch (error) {

      await extra.reply(`*❌ خطأ: ${error.message}*`);

    }

  }

};