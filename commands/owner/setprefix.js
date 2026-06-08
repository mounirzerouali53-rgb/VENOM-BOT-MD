/**

 * أمر_البادئة - تغيير بادئة أوامر البوت

 */

const config = require('../../config');

const fs = require('fs');

const path = require('path');

module.exports = {

  name: 'أمر_البادئة',

  aliases: ['prefix'],

  category: 'المالك',

  description: 'تغيير بادئة أوامر البوت (1-3 أحرف)',

  usage: '.أمر_البادئة <بادئة جديدة>',

  ownerOnly: true,

  async execute(sock, msg, args, extra) {

    try {

      if (!args[0]) return extra.reply(`*📌 البادئة الحالية:* ${config.prefix}\n*الاستخدام:* .أمر_البادئة <بادئة جديدة>`);

      const prefix = args[0];

      if (prefix.length > 3) return extra.reply('*❌ البادئة يجب أن تكون من 1 إلى 3 أحرف فقط!*');

      config.prefix = prefix;

      const configPath = path.join(__dirname, '../../config.js');

      let conf = fs.readFileSync(configPath, 'utf8');

      conf = conf.replace(/prefix: '.*'/, `prefix: '${prefix}'`);

      fs.writeFileSync(configPath, conf, 'utf8');

      extra.reply(`*✅ تم تغيير البادئة إلى:* ${prefix}\n*الاستخدام الجديد:* ${prefix}أمر`);

    } catch (err) {

      console.error('SetPrefix error:', err);

      extra.reply('*❌ فشل في تغيير البادئة!*');

    }

  }

};