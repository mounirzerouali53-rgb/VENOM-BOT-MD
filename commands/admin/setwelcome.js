/**

 * أمر تعيين_ترحيب - تخصيص رسالة الترحيب

 */

const db = require('../../database');

module.exports = {

  name: 'تعيين_ترحيب',

  aliases: ['نص_ترحيب'],

  category: 'إدارة',

  desc: 'تعيين رسالة ترحيب مخصصة',

  usage: '.تعيين_ترحيب <الرسالة> (استعمل @المستخدم للإشارة للعضو الجديد)',

  groupOnly: true,

  adminOnly: true,

  botAdminNeeded: true,

  execute: async (sock, msg, args) => {

    try {

      const groupId = msg.key.remoteJid;

      

      if (!args.length) {

        const groupSettings = db.getGroupSettings(groupId);

        return await sock.sendMessage(groupId, {

          text: `📝 *رسالة الترحيب الحالية*\n\n${groupSettings.welcomeMessage}\n\n*طريقة الاستعمال:* .تعيين_ترحيب <الرسالة>\n\n*نصيحة:* استعمل @المستخدم للإشارة للعضو الجديد`

        }, { quoted: msg });

      }

      

      const welcomeMessage = args.join(' ');

      

      if (welcomeMessage.length > 500) {

        return await sock.sendMessage(groupId, {

          text: '*❌ رسالة الترحيب طويلة جدًا! الحد الأقصى 500 حرف.*'

        }, { quoted: msg });

      }

      

      db.updateGroupSettings(groupId, { welcomeMessage });

      

      await sock.sendMessage(groupId, {

        text: `*✅ تم تحديث رسالة الترحيب!*\n\n*معاينة:*\n${welcomeMessage.replace('@user', '@' + msg.key.participant.split('@')[0])}`,

        mentions: [msg.key.participant]

      }, { quoted: msg });

      

    } catch (error) {

      console.error('خطأ في أمر تعيين_ترحيب:', error);

      await sock.sendMessage(msg.key.remoteJid, {

        text: `*❌ خطأ: ${error.message}*`

      }, { quoted: msg });

    }

  }

};