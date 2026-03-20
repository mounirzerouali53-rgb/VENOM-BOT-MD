/**

 * أمر كيو آر - توليد رمز الاستجابة السريعة

 */

const qrcode = require('qrcode');

module.exports = {

  name: 'كيو آر',

  aliases: ['qrcode'],

  category: 'عام',

  description: 'انشئ رمز QR من نص',

  usage: '.كيو آر <النص>',

  

  async execute(sock, msg, args, extra) {

    try {

      if (args.length === 0) {

        return extra.reply('❌ الاستخدام: .كيو آر <النص>\nمثال: .كيو آر https://google.com');

      }

      

      const text = args.join(' ');

      

      const qrBuffer = await qrcode.toBuffer(text, {

        type: 'png',

        width: 500,

        margin: 2

      });

      

      await sock.sendMessage(extra.from, {

        image: qrBuffer,

        caption: `✅ تم إنشاء رمز *QR*!\nالنص: ${text}`

      }, { quoted: msg });

      

    } catch (error) {

      await extra.reply(`❌ خطأ: ${error.message}`);

    }

  }

};