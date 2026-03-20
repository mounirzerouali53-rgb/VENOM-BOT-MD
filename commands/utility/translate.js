/**

 * أمر ترجمة النصوص

 */

const fetch = require('node-fetch');

module.exports = {

  name: 'ترجم',

  aliases: ['trt', 'tr'],

  category: 'utility',

  description: 'ترجمة النصوص إلى لغات مختلفة',

  usage: '.ترجم <نص> <رمز اللغة> أو الرد على رسالة مع .ترجم <رمز اللغة>',

  

  async execute(sock, msg, args) {

    try {

      const chatId = msg.key.remoteJid;

      

      // إظهار مؤشر الكتابة

      await sock.sendPresenceUpdate('composing', chatId);

      

      let textToTranslate = '';

      let lang = '';

      

      // التحقق إذا كان الرد

      const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

      

      if (quotedMessage) {

        textToTranslate = quotedMessage.conversation || 

                         quotedMessage.extendedTextMessage?.text || 

                         quotedMessage.imageMessage?.caption || 

                         quotedMessage.videoMessage?.caption || 

                         '';

        lang = args.join(' ').trim();

      } else {

        if (args.length < 2) {

          return await sock.sendMessage(chatId, {

            text: `*مترجم*\n\n` +

            `الاستخدام:\n` +

            `1. الرد على رسالة مع: .ترجم <رمز اللغة>\n` +

            `2. أو كتابة: .ترجم <النص> <رمز اللغة>\n\n` +

            `مثال:\n` +

            `.ترجم hello fr\n` +

            `.trt hello fr\n\n` +

            `رموز اللغات:\n` +

            `fr - فرنسية, es - إسبانية, de - ألمانية, it - إيطالية\n` +

            `pt - برتغالية, ru - روسية, ja - يابانية, ko - كورية\n` +

            `zh - صينية, ar - عربية, hi - هندية`

          }, { quoted: msg });

        }

        

        lang = args.pop();

        textToTranslate = args.join(' ');

      }

      

      if (!textToTranslate) {

        return await sock.sendMessage(chatId, { 

          text: '❌ *لا يوجد نص للترجمة. الرجاء كتابة نص أو الرد على رسالة.*' 

        }, { quoted: msg });

      }

      

      if (!lang) {

        return await sock.sendMessage(chatId, { 

          text: '❌ *الرجاء تحديد رمز اللغة.*\nمثال: .ترجم hello fr' 

        }, { quoted: msg });

      }

      

      let translatedText = null;

      

      // محاولة API 1

      try {

        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(textToTranslate)}`);

        if (response.ok) {

          const data = await response.json();

          if (data && data[0] && data[0][0] && data[0][0][0]) {

            translatedText = data[0][0][0];

          }

        }

      } catch {}

      // محاولة API 2

      if (!translatedText) {

        try {

          const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=auto|${lang}`);

          if (response.ok) {

            const data = await response.json();

            if (data && data.responseData && data.responseData.translatedText) {

              translatedText = data.responseData.translatedText;

            }

          }

        } catch {}

      }

      

      // محاولة API 3

      if (!translatedText) {

        try {

          const response = await fetch(`https://api.dreaded.site/api/translate?text=${encodeURIComponent(textToTranslate)}&lang=${lang}`);

          if (response.ok) {

            const data = await response.json();

            if (data && data.translated) {

              translatedText = data.translated;

            }

          }

        } catch {}

      }

      

      if (!translatedText) {

        return await sock.sendMessage(chatId, { 

          text: '❌ *فشل الترجمة. حاول لاحقاً.*' 

        }, { quoted: msg });

      }

      

      await sock.sendMessage(chatId, {

        text: `*${translatedText}*`

      }, { quoted: msg });

      

    } catch (error) {

      console.error('❌ خطأ في أمر الترجمة:', error);

      await sock.sendMessage(msg.key.remoteJid, { 

        text: '❌ *فشل الترجمة. حاول لاحقاً.*' 

      }, { quoted: msg });

    }

  }

};