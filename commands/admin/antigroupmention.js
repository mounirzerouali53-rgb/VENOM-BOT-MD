/**

 * Anti-Group Mention Command

 */

const database = require('../../database');

module.exports = {

  name: 'منع_منشن',

  aliases: ['agm'],

  category: 'admin',

  description: 'حماية من المنشن الجماعي',

  usage: '.منع_منشن <تشغيل/ايقاف/تعيين/عرض>',

  groupOnly: true,

  adminOnly: true,

  botAdminNeeded: true,

  

  async execute(sock, msg, args, extra) {

    try {

      if (!args[0]) {

        const settings = database.getGroupSettings(extra.from);

        const status = settings.antigroupmention ? 'مفعل' : 'معطل';

        const action = settings.antigroupmentionAction === 'kick' ? 'طرد' : 'حذف';

        return extra.reply(

          `📌 *حالة منع المنشن الجماعي*\n\n` +

          `الحالة: *${status}*\n` +

          `الإجراء: *${action}*\n\n` +

          `📖 *طريقة الاستعمال:*\n` +

          `  .منع_منشن تشغيل\n` +

          `  .منع_منشن ايقاف\n` +

          `  .منع_منشن تعيين حذف\n` +

          `  .منع_منشن تعيين طرد\n` +

          `  .منع_منشن عرض`

        );

      }

      

      const opt = args[0].toLowerCase();

      

      if (opt === 'تشغيل') {

        if (database.getGroupSettings(extra.from).antigroupmention) {

          return extra.reply('*⚠️ منع المنشن مفعل بالفعل*');

        }

        database.updateGroupSettings(extra.from, { antigroupmention: true });

        return extra.reply('*✅ تم تفعيل منع المنشن الجماعي*');

      }

      

      if (opt === 'ايقاف') {

        database.updateGroupSettings(extra.from, { antigroupmention: false });

        return extra.reply('*❌ تم تعطيل منع المنشن الجماعي*');

      }

      

      if (opt === 'تعيين') {

        if (args.length < 2) {

          return extra.reply('*⚠️ اختر حذف او طرد*\nمثال: .منع_منشن تعيين حذف');

        }

        

        let setAction = args[1].toLowerCase();

        

        if (setAction === 'حذف') setAction = 'delete';

        else if (setAction === 'طرد') setAction = 'kick';

        else return extra.reply('*❌ خيار غير صالح اختر حذف او طرد*');

        

        database.updateGroupSettings(extra.from, { 

          antigroupmentionAction: setAction,

          antigroupmention: true

        });

        

        return extra.reply(`*✅ تم تعيين الاجراء الى ${args[1]}*`);

      }

      

      if (opt === 'عرض') {

        const settings = database.getGroupSettings(extra.from);

        const status = settings.antigroupmention ? 'مفعل' : 'معطل';

        const action = settings.antigroupmentionAction === 'kick' ? 'طرد' : 'حذف';

        return extra.reply(

          `📊 *اعدادات منع المنشن*\n\n` +

          `الحالة: *${status}*\n` +

          `الاجراء: *${action}*`

        );

      }

      

      return extra.reply('*📖 استعمل .منع_منشن لعرض الاعدادات*');

      

    } catch (error) {

      await extra.reply(`❌ خطأ: ${error.message}`);

    }

  }

};