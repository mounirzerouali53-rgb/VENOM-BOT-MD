/**

 * جلب رابط المجموعة

 */

module.exports = {

  name: 'رابط',

  aliases: [],

  category: 'admin',

  description: 'الحصول على رابط المجموعة',

  usage: '.رابط',

  groupOnly: true,

  adminOnly: true,

  botAdminNeeded: true,

  

  async execute(sock, msg, args, extra) {

    try {

      const code = await sock.groupInviteCode(extra.from);

      const link = `https://chat.whatsapp.com/${code}`;

      

      let text = `🔗 *رابط المجموعة*\n\n`;

      text += `📱 المجموعة: ${extra.groupMetadata.subject}\n`;

      text += `🔗 الرابط: ${link}\n\n`;

      text += `⚠️ لا تشارك الرابط مع أي شخص غريب!`;

      

      await extra.reply(text);

      

    } catch (error) {

      await extra.reply(`❌ خطأ: ${error.message}`);

    }

  }

};