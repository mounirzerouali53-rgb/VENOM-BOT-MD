// commands/admin/groupstats.js

const { getStats } = require('../../utils/groupstats');

module.exports = {

    name: 'احصائيات',

    aliases: ['stats','leaderboard','gstats','topmembers','msgs','messagestats'],

    category: 'عام',

    description: 'عرض احصائيات محادثة الجروب لليوم',

    usage: '.احصائيات',

    groupOnly: true,

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            const stats = getStats(from);

            if (!stats)

                return extra.reply('📊 لا توجد نشاطات مسجلة اليوم.');

            const { total, users } = stats;

            // ترتيب الأعضاء حسب النشاط

            const sortedUsers = Object.entries(users)

                .sort((a, b) => b[1] - a[1])

                .slice(0, 5);

            let topText = sortedUsers.length

                ? sortedUsers.map(([id, count], i) => `${i + 1}) @${id.split('@')[0]} — ${count} رسائل`).join('\n')

                : 'لا يوجد أعضاء نشيطين حتى الآن.';

            const text = `

📊 *احصائيات الجروب — اليوم*

📌 *إجمالي الرسائل:* ${total}

👥 *أكثر الأعضاء نشاطاً:*

${topText}

اكتب .نشاطي لرؤية احصائياتك.

`.trim();

            await sock.sendMessage(from, {

                text,

                mentions: sortedUsers.map(u => u[0])

            }, { quoted: msg });

        } catch (err) {

            console.error('[groupstats cmd] error:', err);

            extra.reply('❌ حدث خطأ أثناء تحميل الاحصائيات.');

        }

    }

};