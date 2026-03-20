/**

 * أمر_النشرة - تعيين/تغيير JID النشرة

 */

const fs = require('fs');

const path = require('path');

const config = require('../../config');

module.exports = {

  name: 'أمر_النشرة',

  aliases: ['setnl', 'nl'],

  category: 'المالك',

  description: 'تعيين أو تغيير JID النشرة (رد على رسالة النشرة أو كتابة JID)',

  usage: '.أمر_النشرة <JID النشرة>',

  ownerOnly: true,

  async execute(sock, msg, args, extra) {

    try {

      let jid = '';

      // إذا الرسالة من نشرة مباشرة

      if (msg.key.remoteJid?.endsWith('@newsletter')) jid = msg.key.remoteJid;

      // إذا ردينا على رسالة

      else if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {

        const ctx = msg.message.extendedTextMessage.contextInfo;

        const findJid = (obj, depth = 0) => {

          if (!obj || depth > 5) return null;

          for (const k in obj) {

            const v = obj[k];

            if (typeof v === 'string' && v.endsWith('@newsletter')) return v;

            if (typeof v === 'object') {

              const f = findJid(v, depth + 1);

              if (f) return f;

            }

          }

          return null;

        };

        jid = findJid(ctx);

        if (!jid) return extra.reply('*❌ الرسالة المردودة ليست من نشرة! استخدم JID مباشرة*');

      } 

      

      // من الوسائط

      else if (args[0]) jid = args[0].trim();

      // عرض الحالة الحالية

      else return extra.reply(`*📰 JID النشرة الحالي:* \`${config.newsletterJid || 'غير محدد'}\`\n*الاستخدام:* .أمر_النشرة <JID>`);

      // تحقق من JID

      if (!jid.endsWith('@newsletter')) return extra.reply('*❌ JID غير صالح! يجب أن ينتهي بـ @newsletter*');

      // تعديل config.js

      const configPath = path.join(__dirname, '../../config.js');

      let conf = fs.readFileSync(configPath, 'utf8');

      if (conf.includes('newsletterJid:')) {

        conf = conf.replace(/newsletterJid:\s*['"]([^'"]+)['"]/, `newsletterJid: '${jid}'`);

      } else {

        conf = conf.replace(/(sessionName:\s*['"][^'"]+['"],)/, `$1\n    newsletterJid: '${jid}',`);

      }

      fs.writeFileSync(configPath, conf, 'utf8');

      config.newsletterJid = jid;

      await extra.reply(`*✅ تم تحديث JID النشرة بنجاح!*\n*📰 JID:* \`${jid}\`\n*📛 اسم البوت:* ${config.botName}`);

    } catch (err) {

      console.error('SetNewsletter error:', err);

      extra.reply('*❌ فشل في تعيين JID النشرة!*');

    }

  }

};