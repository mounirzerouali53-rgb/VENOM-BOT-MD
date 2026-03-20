/**

 * أمر وقت تشغيل البوت - Uptime

 */

const config = require('../../config');

/**

 * تحويل الوقت لوحدة قابلة للقراءة

 * @param {number} seconds - مجموع الثواني منذ تشغيل البوت

 * @returns {string} نص الوقت بصيغة بشرية

 */

function formatUptime(seconds) {

  if (seconds <= 0) {

    return '0 ثانية';

  }

  

  const days = Math.floor(seconds / 86400);

  const hours = Math.floor((seconds % 86400) / 3600);

  const minutes = Math.floor((seconds % 3600) / 60);

  const secs = Math.floor(seconds % 60);

  

  const parts = [];

  

  if (days > 0) parts.push(`${days} يوم${days > 1 ? 'ـ' : ''}`);

  if (hours > 0) parts.push(`${hours} ساعة${hours > 1 ? 'ـ' : ''}`);

  if (minutes > 0) parts.push(`${minutes} دقيقة${minutes > 1 ? 'ـ' : ''}`);

  if (secs > 0 || parts.length === 0) parts.push(`${secs} ثانية${secs > 1 ? 'ـ' : ''}`);

  

  return parts.join(', ');

}

module.exports = {

  name: 'تشغيل',

  aliases: ['uptime', 'runtime', 'alive'],

  category: 'general',

  description: 'عرض مدة تشغيل البوت',

  usage: '.تشغيل',

  

  async execute(sock, msg, args, extra) {

    try {

      const uptimeSeconds = process.uptime();

      const uptime = formatUptime(uptimeSeconds);

      

      const botName = config.botName || 'بوت';

      const botVersion = 'V1.0.1';

      

      const message = `

╭━━『 *وقت تشغيل البوت* 』━━╮

🤖 *اسم البوت:* ${botName}

🧬 *نسخة البوت:* ${botVersion}

⏱️ *مدة التشغيل:* ${uptime}

╰━━━━━━━━━━━━━━━╯

      `.trim();

      

      await extra.reply(message);

      

    } catch (error) {

      console.error('خطأ في أمر uptime:', error);

      await extra.reply('❌ *حدث خطأ أثناء جلب معلومات وقت التشغيل. حاول مرة أخرى لاحقًا.*');

    }

  }

};