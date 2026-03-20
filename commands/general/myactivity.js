// commands/general/myactivity.js

const { getStats } = require('../../utils/groupstats');

module.exports = {

    name: 'نشاطي',

    aliases: ['احصاءي', 'رسائلي', 'رتبتي'],

    category: 'عام',

    description: 'عرض احصائيات نشاطك اليوم',

    usage: '.نشاطي',

    groupOnly: true,

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            const sender = extra.sender;

            const stats = getStats(from);

            if (!stats || !stats.users || !stats.users[sender]) {

                return extra.reply('📊 لم ترسل أي رسائل اليوم بعد!');

            }

            const userCount = stats.users[sender];

            const totalMessages = stats.total;

            const percentage = ((userCount / totalMessages) * 100).toFixed(1);

            // ترتيب المستخدمين

            const sortedUsers = Object.entries(stats.users)

                .sort((a, b) => b[1] - a[1]);

            

            const rank = sortedUsers.findIndex(([id]) => id === sender) + 1;

            const text = `

📊 *نشاطك اليوم*

👤 *المستخدم:* @${sender.split('@')[0]}

📝 *الرسائل المرسلة:* ${userCount}

📈 *نسبة مشاركتك:* ${percentage}%

🏆 *رتبتك:* #${rank} من ${sortedUsers.length}

استمر في الدردشة! 💬

`.trim();

            await sock.sendMessage(from, {

                text,

                mentions: [sender]

            }, { quoted: msg });

        } catch (err) {

            console.error('[myactivity cmd] error:', err);

            extra.reply('❌ حدث خطأ أثناء عرض احصائيات نشاطك.');

        }

    }

};