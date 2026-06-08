/**

 * أمر إعادة_تشغيل - إعادة تشغيل البوت (المالك فقط)

 */

const { exec } = require('child_process');

module.exports = {

  name: 'إعادة_تشغيل',

  aliases: ['reboot', 'reload'],

  category: 'المالك',

  description: 'إعادة تشغيل البوت (المالك فقط)',

  usage: '.إعادة_تشغيل',

  ownerOnly: true,

  async execute(sock, msg, args, extra) {

    try {

      await extra.reply('*🔁 جارٍ إعادة تشغيل البوت...*');

      const run = (cmd) =>

        new Promise((resolve, reject) => {

          exec(cmd, (error, stdout, stderr) => {

            if (error) reject(error);

            else resolve(stdout || stderr);

          });

        });

      try {

        // إذا كان البوت شغال تحت PM2

        await run('pm2 restart all');

        return;

      } catch (e) {

        console.log('*PM2 غير متوفر، سيتم استخدام process.exit*');

      }

      // للنودمون أو البانل – عادة يعيد تشغيل البوت عند الخروج

      setTimeout(() => {

        process.exit(0);

      }, 500);

    } catch (error) {

      console.error('*خطأ في إعادة التشغيل:*', error);

      await extra.reply(`*❌ خطأ أثناء إعادة تشغيل البوت: ${error.message}*`);

    }

  },

};