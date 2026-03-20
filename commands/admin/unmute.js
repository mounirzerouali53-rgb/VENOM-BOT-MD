/**

 * أمر فتح_الجروب - فتح الجروب (جميع الأعضاء يمكنهم الإرسال)

 */

module.exports = {

    name: 'فتح_الجروب',

    aliases: ['فتح', 'فتح_المجموعة'],

    category: 'إدارة',

    description: 'فتح الجروب (جميع الأعضاء يمكنهم إرسال الرسائل)',

    usage: '.فتح_الجروب',

    groupOnly: true,

    adminOnly: true,

    botAdminNeeded: true,

    

    async execute(sock, msg, args, extra) {

      try {

        await sock.groupSettingUpdate(extra.from, 'not_announcement');

        await extra.reply('*🔓 تم فتح الجروب!*\n\n*جميع الأعضاء يمكنهم إرسال الرسائل الآن.*');

        

      } catch (error) {

        await extra.reply(`*❌ خطأ: ${error.message}*`);

      }

    }

};