/**

 * أمر إرسال_عام - إرسال رسالة لجميع الدردشات

 */

module.exports = {

    name: 'إرسال_عام',

    aliases: ['bc', 'ع'],

    category: 'المالك',

    description: 'إرسال رسالة لجميع الدردشات',

    usage: '.إرسال_عام <الرسالة>',

    ownerOnly: true,

    

    async execute(sock, msg, args, extra) {

      try {

        if (args.length === 0) {

          return extra.reply('*❌ طريقة الاستعمال: .إرسال_عام <الرسالة>*\n\n*مثال: .إرسال_عام مرحباً بالجميع!*');

        }

        

        const message = args.join(' ');

        

        const chats = await sock.groupFetchAllParticipating();

        const groups = Object.values(chats);

        

        let success = 0;

        let failed = 0;

        

        for (const group of groups) {

          try {

            await sock.sendMessage(group.id, {

              text: `📢 *رسالة عامة*\n\n${message}\n\n*هذه رسالة من مالك البوت*`

            });

            success++;

          } catch (e) {

            failed++;

          }

        }

        

        await extra.reply(`*✅ تم إرسال الرسالة لجميع الدردشات!*\n\n*✅ نجاح: ${success}*\n*❌ فشل: ${failed}*`);

        

      } catch (error) {

        await extra.reply(`*❌ خطأ: ${error.message}*`);

      }

    }

};