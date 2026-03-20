/**

 * فك_الحظر - فك الحظر عن مستخدم

 */

module.exports = {

  name: 'فك_الحظر',

  aliases: ['unblock'],

  category: 'المالك',

  description: 'فك الحظر عن مستخدم (مالك فقط)',

  usage: '.فك_الحظر @المستخدم أو بالرد',

  ownerOnly: true,

  async execute(sock, msg, args, extra) {

    try {

      const ctx = msg.message?.extendedTextMessage?.contextInfo;

      const mentioned = ctx?.mentionedJid || [];

      const target = mentioned[0] || (ctx?.participant && ctx.stanzaId && ctx.quotedMessage);

      if (!target) return extra.reply('*❌ المرجو ذكر المستخدم أو الرد عليه لفك الحظر!*');

      await sock.updateBlockStatus(target, 'unblock');

      await sock.sendMessage(extra.from, {

        text: `*✅ تم فك الحظر عن:* @${target.split('@')[0]}`,

        mentions: [target]

      }, { quoted: msg });

    } catch (err) {

      console.error('Unblock error:', err);

      extra.reply('*❌ فشل في فك الحظر!*');

    }

  }

};