/**

 * أمر وضع_البوت - التبديل بين الوضع الخاص والعام للبوت

 */

const config = require('../../config');

const fs = require('fs');

const path = require('path');

module.exports = {

  name: 'وضع_البوت',

  aliases: ['وضع', 'botmode', 'خاص', 'عام'],

  description: 'تبديل البوت بين الوضع الخاص والعام',

  usage: '.وضع_البوت <خاص/عام>',

  category: 'المالك',

  ownerOnly: true,

  

  async execute(sock, msg, args, extra) {

    try {

      if (!args[0]) {

        const currentMode = config.selfMode ? 'خاص' : 'عام';

        const description = config.selfMode 

          ? 'فقط المالك والمستخدمون المصرح لهم يمكنهم استخدام الأوامر'

          : 'الجميع يمكنهم استخدام الأوامر';

        

        return extra.reply(

          `🤖 *وضع البوت*\n\n` +

          `الوضع الحالي: *${currentMode.toUpperCase()}*\n` +

          `الحالة: ${description}\n\n` +

          `*طريقة الاستعمال:*\n` +

          `  .وضع_البوت خاص - فقط المالك يمكنه استخدام الأوامر\n` +

          `  .وضع_البوت عام - الجميع يمكنه استخدام الأوامر`

        );

      }

      

      const mode = args[0].toLowerCase();

      

      if (mode === 'خاص' || mode === 'kh') {

        if (config.selfMode) {

          return extra.reply('*🔒 البوت بالفعل في الوضع الخاص*\n*فقط المالك يمكنه استخدام الأوامر.*');

        }

        

        // تحديث config

        updateConfig('selfMode', true);

        config.selfMode = true; 

        return extra.reply('*🔒 تم تغيير وضع البوت إلى خاص*\n*فقط المالك يمكنه استخدام الأوامر الآن.*');

      }

      

      if (mode === 'عام' || mode === 'am') {

        if (!config.selfMode) {

          return extra.reply('*🌐 البوت بالفعل في الوضع العام*\n*الجميع يمكنه استخدام الأوامر.*');

        }

        

        // تحديث config

        updateConfig('selfMode', false);

        config.selfMode = false; 

        return extra.reply('*🌐 تم تغيير وضع البوت إلى عام*\n*الجميع يمكنهم استخدام الأوامر الآن.*');

      }

      

      return extra.reply('*❌ وضع غير صالح!*\n*استعمال: .وضع_البوت <خاص/عام>*');

      

    } catch (error) {

      console.error('خطأ في أمر وضع_البوت:', error);

      await extra.reply('*❌ خطأ أثناء تغيير وضع البوت.*');

    }

  }

};

function updateConfig(key, value) {

  try {

    const configPath = path.join(__dirname, '..', '..', 'config.js');

    let configContent = fs.readFileSync(configPath, 'utf8');

    

    const regex = new RegExp(`(${key}:\\s*)(true|false)`, 'g');

    configContent = configContent.replace(regex, `$1${value}`);

    

    fs.writeFileSync(configPath, configContent, 'utf8');

    

    delete require.cache[require.resolve('../../config')];

  } catch (error) {

    console.error('*خطأ أثناء حفظ الإعدادات:*', error);

  }

}