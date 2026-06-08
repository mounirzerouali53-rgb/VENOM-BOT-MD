/**

 * أمر تحذير - تحذير مستخدم

 */

const database = require('../../database');

const config = require('../../config');

module.exports = {

  name: 'تحذير',

  aliases: ['تنبيه'],

  category: 'إدارة',

  description: 'تحذير مستخدم',

  usage: '.تحذير @المستخدم <السبب>',

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

        return extra.reply('*❌ المرجو تحديد المستخدم أو الرد عليه لتحذيره!*\n\n*مثال: .تحذير @المستخدم مخالفة القوانين*');

      }

      

      const reason = args.slice(mentioned.length > 0 ? 1 : 0).join(' ') || 'لم يتم تحديد سبب';

      

      // لا يمكن تحذير المشرفين

      const foundParticipant = extra.groupMetadata.participants.find(

        p => (p.id === target || p.lid === target) && (p.admin === 'admin' || p.admin === 'superadmin')

      );

      

      if (foundParticipant) {

        return extra.reply('*❌ لا يمكن تحذير مشرف!*');

      }

      

      const warnings = database.addWarning(extra.from, target, reason);

      

      let text = `⚠️ *تحذير المستخدم*\n\n`;

      text += `👤 المستخدم: @${target.split('@')[0]}\n`;

      text += `📝 السبب: ${reason}\n`;

      text += `⚠️ عدد التحذيرات: ${warnings.count}/${config.maxWarnings}\n\n`;

      

      if (warnings.count >= config.maxWarnings) {

        text += '*❌ وصل المستخدم الحد الأقصى من التحذيرات وسيتم حذفه!*';

        

        await sock.sendMessage(extra.from, {

          text,

          mentions: [target]

        }, { quoted: msg });

        

        if (extra.isBotAdmin) {

          await sock.groupParticipantsUpdate(extra.from, [target], 'remove');

          database.clearWarnings(extra.from, target);

        }

      } else {

        text += '*⚠️ التحذير التالي سيؤدي إلى الحذف!*';

        

        await sock.sendMessage(extra.from, {

          text,

          mentions: [target]

        }, { quoted: msg });

      }

      

    } catch (error) {

      await extra.reply(`*❌ خطأ: ${error.message}*`);

    }

  }

};