/**

 * AntiTag Command

 */

const database = require('../../database');

module.exports = {

  name: 'منع_تاك',

  aliases: [],

  description: 'حماية من التاغ الجماعي',

  usage: '.منع_تاك <تشغيل/ايقاف/تعيين/عرض>',

  category: 'admin',

  groupOnly: true,

  adminOnly: true,

  botAdminNeeded: true,

  

  async execute(sock, msg, args, extra) {

    try {

      if (!args[0]) {

        const settings = database.getGroupSettings(extra.from);

        const status = settings.antitag ? 'مفعل' : 'معطل';

        const action = settings.antitagAction === 'kick' ? 'طرد' : 'حذف';

        return extra.reply(

          `📛 *حالة منع التاغ*\n\n` +

          `الحالة: *${status}*\n` +

          `الإجراء: *${action}*\n\n` +

          `📖 *طريقة الاستعمال:*\n` +

          `  .منع_تاك تشغيل\n` +

          `  .منع_تاك ايقاف\n` +

          `  .منع_تاك تعيين حذف\n` +

          `  .منع_تاك تعيين طرد\n` +

          `  .منع_تاك عرض`

        );

      }

      

      const opt = args[0].toLowerCase();

      

      if (opt === 'تشغيل') {

        if (database.getGroupSettings(extra.from).antitag) {

          return extra.reply('*⚠️ منع التاغ مفعل بالفعل*');

        }

        database.updateGroupSettings(extra.from, { antitag: true });

        return extra.reply('*✅ تم تفعيل منع التاغ*');

      }

      

      if (opt === 'ايقاف') {

        database.updateGroupSettings(extra.from, { antitag: false });

        return extra.reply('*❌ تم تعطيل منع التاغ*');

      }

      

      if (opt === 'تعيين') {

        if (args.length < 2) {

          return extra.reply('*⚠️ اختر حذف او طرد*\nمثال: .منع_تاك تعيين حذف');

        }

        

        let setAction = args[1].toLowerCase();

        

        if (setAction === 'حذف') setAction = 'delete';

        else if (setAction === 'طرد') setAction = 'kick';

        else return extra.reply('*❌ خيار غير صالح اختر حذف او طرد*');

        

        database.updateGroupSettings(extra.from, { 

          antitagAction: setAction,

          antitag: true

        });

        

        return extra.reply(`*✅ تم تعيين الاجراء الى ${args[1]}*`);

      }

      

      if (opt === 'عرض') {

        const settings = database.getGroupSettings(extra.from);

        const status = settings.antitag ? 'مفعل' : 'معطل';

        const action = settings.antitagAction === 'kick' ? 'طرد' : 'حذف';

        return extra.reply(

          `📊 *اعدادات منع التاغ*\n\n` +

          `الحالة: *${status}*\n` +

          `الاجراء: *${action}*`

        );

      }

      

      return extra.reply('*📖 استعمل .منع_تاك لعرض الاعدادات*');

      

    } catch (error) {

      await extra.reply(`❌ خطأ: ${error.message}`);

    }

  }

};