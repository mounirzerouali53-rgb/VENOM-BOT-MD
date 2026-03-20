/**

 * أمر منع_المكالمات - تفعيل/تعطيل نظام منع المكالمات

 */

module.exports = {

  name: 'منع_المكالمات',

  category: 'المالك',

  ownerOnly: true,

  description: 'تفعيل أو تعطيل نظام منع المكالمات',

  usage: '.منع_المكالمات on/off',

  async execute(sock, msg, args, extra) {

    if (!args[0]) {

      return extra.reply('*طريقة الاستعمال: .منع_المكالمات on/off*');

    }

    const option = args[0].toLowerCase();

    if (!['on', 'off'].includes(option)) {

      return extra.reply('*طريقة الاستعمال: .منع_المكالمات on/off*');

    }

    const enabled = option === 'on';

    // تحديث الإعداد الافتراضي في config

    const fs = require('fs');

    const path = require('path');

    const configPath = path.join(__dirname, '../../config.js');

    

    try {

      // قراءة ملف الإعدادات الحالي

      let configFile = fs.readFileSync(configPath, 'utf8');

      

      // تحديث إعداد منع المكالمات

      if (enabled) {

        configFile = configFile.replace(/anticall:\s*false/g, 'anticall: true');

      } else {

        configFile = configFile.replace(/anticall:\s*true/g, 'anticall: false');

      }

      

      // كتابة الملف بعد التحديث

      fs.writeFileSync(configPath, configFile);

      

      // مسح الكاش باش require القادم يقرأ النسخة الجديدة

      delete require.cache[require.resolve('../../config')];

      

      await extra.reply(

        enabled

          ? '*✅ تم تفعيل منع المكالمات. المكالمات سيتم رفضها وحظرها تلقائيًا.*'

          : '*❌ تم تعطيل منع المكالمات.*'

      );

    } catch (err) {

      console.error('[أمر منع_المكالمات] خطأ:', err);

      extra.reply('*❌ خطأ أثناء تحديث إعداد منع المكالمات.*');

    }

  }

};