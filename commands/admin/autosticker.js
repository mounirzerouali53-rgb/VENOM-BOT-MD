/**

 * AutoSticker Command

 */

const database = require('../../database');

module.exports = {

  name: 'ملصق_تلقائي',

  aliases: [],

  category: 'admin',

  description: 'تحويل الصور والفيديوهات الى ملصقات تلقائيا',

  usage: '.ملصق_تلقائي <تشغيل/ايقاف>',

  groupOnly: true,

  adminOnly: true,

  botAdminNeeded: false,

  

  async execute(sock, msg, args, extra) {

    try {

      if (!args[0]) {

        const settings = database.getGroupSettings(extra.from);

        const status = settings.autosticker ? 'مفعل' : 'معطل';

        return extra.reply(

          `🖼️ *حالة الملصق التلقائي*\n\n` +

          `الحالة: *${status}*\n\n` +

          `📖 *طريقة الاستعمال:*\n` +

          `  .ملصق_تلقائي تشغيل\n` +

          `  .ملصق_تلقائي ايقاف`

        );

      }

      

      const opt = args[0].toLowerCase();

      

      if (opt === 'تشغيل') {

        if (database.getGroupSettings(extra.from).autosticker) {

          return extra.reply('*⚠️ الملصق التلقائي مفعل بالفعل*');

        }

        database.updateGroupSettings(extra.from, { autosticker: true });

        return extra.reply('✅ *تم تفعيل الملصق التلقائي*\n\n*الآن سيتم تحويل جميع الصور والفيديوهات الى ملصقات تلقائيا!*');

      }

      

      if (opt === 'ايقاف') {

        if (!database.getGroupSettings(extra.from).autosticker) {

          return extra.reply('*⚠️ الملصق التلقائي معطل بالفعل*');

        }

        database.updateGroupSettings(extra.from, { autosticker: false });

        return extra.reply('❌ *تم تعطيل الملصق التلقائي*');

      }

      

      return extra.reply('*❌ خيار غير صالح*\nاستعمل: .ملصق_تلقائي تشغيل او ايقاف');

    } catch (error) {

      console.error('[AutoSticker Command Error]:', error);

      return extra.reply('❌ حدث خطأ أثناء تحديث الاعدادات');

    }

  }

};