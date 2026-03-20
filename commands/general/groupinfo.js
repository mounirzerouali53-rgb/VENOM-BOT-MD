/**

 * معلومات الجروب

 */

module.exports = {

  name: 'جروب',

  aliases: ['info','ginfo'],

  category: 'عام',

  description: 'عرض معلومات الجروب',

  usage: '.جروب',

  groupOnly: true,

  async execute(sock, msg, args, extra) {

    try {

      const meta = extra.groupMetadata;

      const admins = meta.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');

      const members = meta.participants.filter(p => !p.admin);

      let text = `📋 *معلومات الجروب*\n\n`;

      text += `🏷️ الاسم: ${meta.subject}\n`;

      text += `🆔 المعرف: ${meta.id}\n`;

      text += `👥 الأعضاء: ${meta.participants.length}\n`;

      text += `👑 الأدمنز: ${admins.length}\n`;

      text += `📝 الوصف: ${meta.desc || 'لا يوجد وصف'}\n`;

      text += `🔒 مقيد: ${meta.restrict ? 'نعم' : 'لا'}\n`;

      text += `📢 إعلان فقط: ${meta.announce ? 'نعم' : 'لا'}\n`;

      text += `📅 تم الإنشاء: ${new Date(meta.creation * 1000).toLocaleDateString()}\n\n`;

      text += `👑 *الأدمنز:*\n`;

      admins.forEach((a, i) => {

        text += `${i + 1}. @${a.id.split('@')[0]}\n`;

      });

      await sock.sendMessage(extra.from, {

        text,

        mentions: admins.map(a => a.id)

      }, { quoted: msg });

    } catch (error) {

      await extra.reply('*❌ حدث خطأ*');

    }

  }

};