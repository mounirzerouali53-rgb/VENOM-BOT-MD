/**

 * أمر تعيين_وداع - تخصيص رسالة الوداع

 */

const db = require('../../database');

module.exports = {

  name: 'تعيين_وداع',

  aliases: ['نص_وداع'],

  category: 'إدارة',

  desc: 'تعيين رسالة وداع مخصصة',

  usage: '.تعيين_وداع <الرسالة> (استعمل @المستخدم للإشارة للعضو المغادر)',

  groupOnly: true,

  adminOnly: true,

  botAdminNeeded: true,

  execute: async (sock, msg, args) => {

    try {

      const groupId = msg.key.remoteJid;

      

      if (!args.length) {

        const groupSettings = db.getGroupSettings(groupId);

        return await sock.sendMessage(groupId, {

          text: `📝 *رسالة الوداع الحالية*\n\n${groupSettings.goodbyeMessage}\n\n*طريقة الاستعمال:* .تعيين_وداع <الرسالة>\n\n*نصيحة:* استعمل @المستخدم للإشارة للعضو الذي غادر`

        }, { quoted: msg });

      }

      

      const goodbyeMessage = args.join(' ');

      

      if (goodbyeMessage.length > 500) {

        return await sock.sendMessage(groupId, {

          text: '*❌ رسالة الوداع طويلة جدًا! الحد الأقصى 500 حرف.*'

        }, { quoted: msg });

      }

      

      db.updateGroupSettings(groupId, { goodbyeMessage });

      

      await sock.sendMessage(groupId, {

        text: `*✅ تم تحديث رسالة الوداع!*\n\n*معاينة:*\n${goodbyeMessage.replace('@user', '@' + msg.key.participant.split('@')[0])}`,

        mentions: [msg.key.participant]

      }, { quoted: msg });

      

    } catch (error) {

      console.error('خطأ في أمر تعيين_وداع:', error);

      await sock.sendMessage(msg.key.remoteJid, {

        text: `*❌ خطأ: ${error.message}*`

      }, { quoted: msg });

    }

  }

};