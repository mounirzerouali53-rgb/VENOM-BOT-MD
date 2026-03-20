/**

 * تنظيف الرسائل

 */

module.exports = {

  name: 'تنظيف',

  aliases: [],

  category: 'admin',

  description: 'حذف رسائل من الكروب',

  usage: '.تنظيف <عدد>',

  groupOnly: true,

  adminOnly: true,

  botAdminNeeded: true,

  

  async execute(sock, msg, args, extra) {

    try {

      const count = parseInt(args[0]);

      if (!count || count < 1 || count > 100) {

        return extra.reply('❌ *ادخل رقم صحيح بين 1 و 100*');

      }

      const jid = extra.from;

      const { store } = require('../../index');

      

      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;

      const msgs = store.messages[jid];

      if (!msgs) {

        return extra.reply('❌ *لا توجد رسائل محفوظة*');

      }

      let messagesToDelete = [];

      if (quotedMsg && quotedParticipant) {

        // حذف رسائل شخص معين

        messagesToDelete = Object.values(msgs)

          .filter(m => {

            const sender = m.key.participant || m.key.remoteJid;

            return sender === quotedParticipant;

          })

          .sort((a, b) => (b.messageTimestamp || 0) - (a.messageTimestamp || 0))

          .slice(0, count);

      } else {

        // حذف اخر الرسائل من الكروب

        messagesToDelete = Object.values(msgs)

          .sort((a, b) => (b.messageTimestamp || 0) - (a.messageTimestamp || 0))

          .slice(0, count);

      }

      let deleted = 0;

      for (const m of messagesToDelete) {

        try {

          await sock.sendMessage(jid, { delete: m.key });

          deleted++;

          await new Promise(resolve => setTimeout(resolve, 300));

        } catch (err) {

          console.error('[تنظيف] خطأ:', err.message);

        }

      }

      return extra.reply(`✅ *تم حذف ${deleted} رسالة بنجاح*`);

      

    } catch (e) {

      console.error('[تنظيف] error:', e);

      extra.reply('❌ *فشل حذف الرسائل*');

    }

  }

};