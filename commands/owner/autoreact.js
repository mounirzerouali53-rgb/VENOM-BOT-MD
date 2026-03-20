/**

 * أمر التفاعل_التلقائي - إعداد التفاعل التلقائي مع الرسائل

 */

const { load, save } = require('../../utils/autoReact');

module.exports = {

  name: 'التفاعل_التلقائي',

  aliases: ['tt'],

  category: 'المالك',

  description: 'إعداد التفاعل التلقائي مع الرسائل',

  usage: '.التفاعل_التلقائي <on/off/set bot/set all>',

  ownerOnly: true,

  async execute(sock, msg, args, extra) {

    try {

      if (!args[0]) {

        return extra.reply('*📋 خيارات التفاعل التلقائي:*\n\n• on - تفعيل التفاعل التلقائي\n• off - تعطيل التفاعل التلقائي\n• set bot - التفاعل فقط مع أوامر البوت\n• set all - التفاعل مع جميع الرسائل*');

      }

      const db = load();

      const opt = args.join(' ').toLowerCase();

      if (opt === 'on') {

        db.enabled = true;

        save(db);

        return extra.reply('*✅ تم تفعيل التفاعل التلقائي.*');

      }

      if (opt === 'off') {

        db.enabled = false;

        save(db);

        return extra.reply('*❌ تم تعطيل التفاعل التلقائي.*');

      }

      if (opt === 'set bot') {

        db.mode = 'bot';

        save(db);

        return extra.reply('*🤖 وضع التفاعل التلقائي: أوامر البوت فقط (⏳ تفاعل تلقائي)*');

      }

      if (opt === 'set all') {

        db.mode = 'all';

        save(db);

        return extra.reply('*🌟 وضع التفاعل التلقائي: جميع الرسائل (رموز تعبيرية عشوائية)*');

      }

      extra.reply('*❌ خيار غير صالح. استعمل: on | off | set bot | set all*');

    } catch (err) {

      console.error('[أمر التفاعل_التلقائي] خطأ:', err);

      extra.reply('*❌ خطأ أثناء إعداد التفاعل التلقائي.*');

    }

  }

};