/**

 * أمر كتم - غلق الجروب (المسؤولين فقط يمكنهم الإرسال)

 */

module.exports = {

    name: 'قفل',

    aliases: ['غلق', 'غلق_الجروب'],

    category: 'إدارة',

    description: 'غلق الجروب (المسؤولين فقط يمكنهم إرسال الرسائل)',

    usage: '.قفل',

    groupOnly: true,

    adminOnly: true,

    botAdminNeeded: true,

    

    async execute(sock, msg, args, extra) {

      try {

        await sock.groupSettingUpdate(extra.from, 'announcement');

        await extra.reply('*🔒 تم غلق الجروب!*\n\n*المسؤولين فقط يمكنهم إرسال الرسائل الآن.*');

        

      } catch (error) {

        await extra.reply(`*❌ خطأ: ${error.message}*`);

      }

    }

};