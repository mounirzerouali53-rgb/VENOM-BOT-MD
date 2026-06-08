/**

 * أمر الترحيب - تفعيل/تعطيل رسائل الترحيب

 */

const db = require('../../database');

module.exports = {

  name: 'ترحيب',

  aliases: ['ترحيب_تشغيل', 'ترحيب_إيقاف'],

  category: 'إدارة',

  desc: 'تفعيل/تعطيل رسائل الترحيب',

  usage: '.ترحيب on/off',

  groupOnly: true,

  adminOnly: true,

  botAdminNeeded: true,

  execute: async (sock, msg, args) => {

    try {

      const groupId = msg.key.remoteJid;

      const action = args[0]?.toLowerCase();

      

      if (!action || !['on', 'off'].includes(action)) {

        const groupSettings = db.getGroupSettings(groupId);

        const status = groupSettings.welcome ? '*✅ مفعل*' : '*❌ معطل*';

        return await sock.sendMessage(groupId, {

          text: `👋 *رسائل الترحيب*\n\nالحالة: ${status}\nالرسالة: ${groupSettings.welcomeMessage}\n\n*طريقة الاستعمال:* .ترحيب on/off\n\nلتخصيص الرسالة: .تعيين_ترحيب <الرسالة>`

        }, { quoted: msg });

      }

      

      const enable = action === 'on';

      db.updateGroupSettings(groupId, { welcome: enable });

      

      await sock.sendMessage(groupId, {

        text: `*✅ رسائل الترحيب ${enable ? 'مفعلة' : 'معطلة'}!*${enable ? '\n\n*الأعضاء الجدد سيتلقون رسائل الترحيب الآن.*' : ''}`

      }, { quoted: msg });

      

    } catch (error) {

      console.error('خطأ في أمر الترحيب:', error);

      await sock.sendMessage(msg.key.remoteJid, {

        text: `*❌ خطأ: ${error.message}*`

      }, { quoted: msg });

    }

  }

};