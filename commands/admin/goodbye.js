/**

 * تفعيل / تعطيل رسالة الوداع

 */

const db = require('../../database');

module.exports = {

  name: 'وداع',

  aliases: [],

  category: 'admin',

  desc: 'تفعيل او تعطيل رسالة الوداع',

  usage: '.وداع تشغيل / ايقاف',

  groupOnly: true,

  adminOnly: true,

  botAdminNeeded: true,

  execute: async (sock, msg, args) => {

    try {

      const groupId = msg.key.remoteJid;

      const action = args[0]?.toLowerCase();

      

      if (!action || !['تشغيل', 'ايقاف'].includes(action)) {

        const groupSettings = db.getGroupSettings(groupId);

        const status = groupSettings.goodbye ? '✅ مفعلة' : '❌ معطلة';

        return await sock.sendMessage(groupId, {

          text: `👋 *رسالة الوداع*\n\nالحالة: ${status}\n\nطريقة الاستعمال:\n.وداع تشغيل\n.وداع ايقاف`

        }, { quoted: msg });

      }

      

      const enable = action === 'تشغيل';

      db.updateGroupSettings(groupId, { goodbye: enable });

      

      await sock.sendMessage(groupId, {

        text: `✅ *تم ${enable ? 'تفعيل' : 'تعطيل'} رسالة الوداع*`

      }, { quoted: msg });

      

    } catch (error) {

      console.error('Goodbye Error:', error);

      await sock.sendMessage(msg.key.remoteJid, {

        text: `❌ *حدث خطأ: ${error.message}*`

      }, { quoted: msg });

    }

  }

};