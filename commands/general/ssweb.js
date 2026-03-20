/**

 * لقطة موقع - SSWeb

 */

const APIs = require('../../utils/api');

module.exports = {

  name: 'لقطموقع',

  aliases: ['screenshot', 'ss', 'webss'],

  category: 'عام',

  description: 'خذ لقطة شاشة لأي موقع',

  usage: '.لقطموقع <رابط>',

  

  async execute(sock, msg, args, extra) {

    try {

      if (args.length === 0) {

        return extra.reply('❌ أدخل رابط الموقع!\n\nمثال: .لقطموقع https://github.com');

      }

      

      const url = args.join(' ');

      

      if (!url.startsWith('http://') && !url.startsWith('https://')) {

        return extra.reply('❌ الرابط غير صحيح، يجب أن يبدأ بـ http:// أو https://');

      }

      

      await sock.sendMessage(extra.from, { react: { text: '📥', key: msg.key } });

      

      const screenshotBuffer = await APIs.screenshotWebsite(url);

      

      await sock.sendMessage(extra.from, {

        image: screenshotBuffer,

        caption: `✅ تم أخذ لقطة الشاشة للموقع *${url}*`

      }, { quoted: msg });

      

    } catch (error) {

      console.error('خطأ في أمر لقطموقع:', error);

      await extra.reply(`❌ فشل أخذ لقطة الشاشة.\n\nخطأ: ${error.message}`);

    }

  }

};