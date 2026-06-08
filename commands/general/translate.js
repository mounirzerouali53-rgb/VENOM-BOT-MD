/**

 * أمر الترجمة - ترجمة النصوص للغات مختلفة

 */

const APIs = require('../../utils/api');

module.exports = {

  name: 'ترجم',

  aliases: ['tr', 'ترجمة'],

  category: 'general',

  description: 'ترجمة النص إلى لغة أخرى',

  usage: '.ترجم <رمز اللغة> <النص>',

  

  async execute(sock, msg, args, extra) {

    try {

      if (args.length < 2) {

        return extra.reply('❌ *الاستخدام:* .ترجم <رمز اللغة> <النص>\n\n*مثال:* .ترجم es Hello world');

      }

      

      const targetLang = args[0];

      const text = args.slice(1).join(' ');

      

      await extra.reply('🔄 *جارٍ الترجمة...*');

      

      const result = await APIs.translate(text, targetLang);

      

      let replyText = `🌐 *الترجمة*\n\n`;

      replyText += `📝 *النص الأصلي:* ${text}\n`;

      replyText += `🔤 *النص المترجم:* ${result.translation || result}\n`;

      replyText += `🌍 *اللغة:* ${targetLang.toUpperCase()}`;

      

      await extra.reply(replyText);

      

    } catch (error) {

      await extra.reply(`❌ *فشل الترجمة!*\n\n*الرموز المدعومة:* en, es, fr, de, it, pt, ru, ja, ko, zh\n\n*الخطأ:* ${error.message}`);

    }

  }

};