/**

 * أمر بينج - قياس سرعة استجابة البوت

 */

module.exports = {

    name: 'بينج',

    aliases: ['p'],

    category: 'عام',

    description: 'تحقق من سرعة استجابة البوت',

    usage: '.بينج',

    

    async execute(sock, msg, args, extra) {

      try {

        const start = Date.now();

        const sent = await extra.reply('🏓 جاري القياس...');

        const end = Date.now();

        

        const responseTime = end - start;

        

        await sock.sendMessage(extra.from, {

          text: `🏓 *بونغ!*\n⚡ سرعة الاستجابة: ${responseTime}ms`,

          edit: sent.key

        });

        

      } catch (error) {

        await extra.reply(`❌ خطأ: ${error.message}`);

      }

    }

};