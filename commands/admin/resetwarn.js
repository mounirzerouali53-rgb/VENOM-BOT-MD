/**

 * أمر إعادة_تنبيه - إعادة ضبط التحذيرات لمستخدم

 */

const database = require('../../database');

module.exports = {

  name: 'إعادة_تنبيه',

  aliases: ['إعادة_تحذير', 'مسح_تنبيه', 'رفع_تنبيه', 'حذف_تنبيه'],

  category: 'إدارة',

  description: 'إعادة ضبط كل التحذيرات لمستخدم',

  usage: '.إعادة_تنبيه @المستخدم',

  groupOnly: true,

  adminOnly: true,

  botAdminNeeded: true,

  

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

        return extra.reply('*❌ المرجو تحديد المستخدم أو الرد عليه لإعادة ضبط التحذيرات!*\n\n*مثال: .إعادة_تنبيه @المستخدم*');

      }

      

      // جلب التحذيرات الحالية قبل المسح

      const currentWarnings = database.getWarnings(extra.from, target);

      

      if (currentWarnings.count === 0) {

        return extra.reply(`*✅ @${target.split('@')[0]} لا يوجد لديه أي تحذيرات لإعادة ضبطها.*`, { mentions: [target] });

      }

      

      // مسح كل التحذيرات

      database.clearWarnings(extra.from, target);

      

      await sock.sendMessage(extra.from, {

        text: `*✅ تم إعادة ضبط التحذيرات*\n\n👤 المستخدم: @${target.split('@')[0]}\n⚠️ التحذيرات السابقة: ${currentWarnings.count}\n\n*تم مسح كل التحذيرات.*`,

        mentions: [target]

      }, { quoted: msg });

      

    } catch (error) {

      console.error('خطأ في أمر إعادة_تنبيه:', error);

      await extra.reply(`*❌ خطأ: ${error.message}*`);

    }

  }

};