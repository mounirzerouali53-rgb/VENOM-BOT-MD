/**

 * أمر تغيير_اسم_بوت - تغيير اسم البوت

 */

const config = require('../../config');

const fs = require('fs');

const path = require('path');

module.exports = {

  name: 'اسم_بوت',

  aliases: ['setname', 'botname'],

  category: 'المالك',

  description: 'تغيير اسم البوت',

  usage: '.اسم_بوت <الاسم الجديد> أو الرد على رسالة',

  ownerOnly: true,

  async execute(sock, msg, args, extra) {

    try {

      let newName = '';

      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      if (quoted) {

        newName = (quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || quoted.videoMessage?.caption || '').trim();

      } else {

        newName = args.join(' ').trim();

      }

      if (!newName) {

        return extra.reply(`*📝 الاسم الحالي للبوت: ${config.botName}*\n\n*الاستخدام:* .اسم_بوت <الاسم الجديد>`);

      }

      if (newName.length > 50) {

        return extra.reply('*❌ الاسم طويل جداً! يجب أن يكون 50 حرف أو أقل*');

      }

      // تحديث الاسم

      config.botName = newName;

      // تحديث ملف config

      const configPath = path.join(__dirname, '../../config.js');

      let content = fs.readFileSync(configPath, 'utf-8');

      content = content.replace(/botName:\s*['"`]([^'"`]*)['"`]/, `botName: '${newName.replace(/'/g, "\\'")}'`);

      fs.writeFileSync(configPath, content, 'utf-8');

      // إعادة تحميل config

      delete require.cache[require.resolve('../../config')];

      await extra.reply(`*✅ تم تغيير اسم البوت إلى: ${newName}*`);

    } catch (err) {

      console.error('Setbotname error:', err);

      await extra.reply(`*❌ خطأ: ${err.message}*`);

    }

  }

};