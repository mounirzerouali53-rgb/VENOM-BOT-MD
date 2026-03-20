/**

 * أمر ترقية - جعل عضو مشرف

 */

const { findParticipant } = require('../../utils/jidHelper');

module.exports = {

  name: 'ترقية',

  aliases: ['جعل_مشرف'],

  category: 'إدارة',

  description: 'ترقية عضو ليصبح مشرف',

  usage: '.ترقية @المستخدم',

  groupOnly: true,

  ownerOnly: true,

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

        return extra.reply('*❌ المرجو تحديد المستخدم أو الرد عليه لترقيته!*\n\n*مثال: .ترقية @المستخدم*');

      }

      

      // جلب بيانات الجروب الجديدة لتجنب البيانات القديمة

      const freshMetadata = await sock.groupMetadata(extra.from);

      

      // استخدام findParticipant لمطابقة LID مع البيانات الجديدة

      const foundParticipant = findParticipant(freshMetadata.participants, target);

      

      if (!foundParticipant) {

        return extra.reply('*❌ المستخدم غير موجود في الجروب!*');

      }

      

      // التحقق إذا كان المستخدم مشرف بالفعل

      if (foundParticipant.admin === 'admin' || foundParticipant.admin === 'superadmin') {

        return extra.reply('*❌ هذا المستخدم مشرف بالفعل!*');

      }

      

      await sock.groupParticipantsUpdate(extra.from, [target], 'promote');

      

      await sock.sendMessage(extra.from, {

        text: `*✅ @${target.split('@')[0]} أصبح الآن مشرفًا!*`,

        mentions: [target]

      }, { quoted: msg });

      

    } catch (error) {

      await extra.reply(`*❌ خطأ: ${error.message}*`);

    }

  }

};