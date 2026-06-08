const fs = require('fs');

const path = require('path');

const { loadDB } = require('../../lib/database');

module.exports = {

    name: "top",

    aliases: ["توب", "topmembers"],

    category: "economy",

    description: "عرض أكثر الأعضاء نشاطاً",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            

            if (!from.endsWith('@g.us')) {

                return await sock.sendMessage(from, {

                    text: '❌ هذا الأمر متاح فقط في المجموعات.'

                }, { quoted: msg });

            }

            const messageCountPath = path.join(__dirname, '../../database/messageCount.json');

            

            if (!fs.existsSync(messageCountPath)) {

                return await sock.sendMessage(from, {

                    text: '📊 لا توجد إحصائيات بعد.'

                }, { quoted: msg });

            }

            const counts = JSON.parse(fs.readFileSync(messageCountPath));

            const groupCounts = counts[from] || {};

            const sorted = Object.entries(groupCounts)

                .sort(([, a], [, b]) => b - a)

                .slice(0, 10);

            if (sorted.length === 0) {

                return await sock.sendMessage(from, {

                    text: '📊 لا توجد إحصائيات بعد.'

                }, { quoted: msg });

            }

            let text = '*╔═══〔 📊 قائمة التوب 10 〕═══╗*\n\n';

            sorted.forEach(([jid, count], i) => {

                text += `*${i + 1}.* @${jid.split('@')[0]} : ${count} رسالة\n`;

            });

            text += '\n*╚════════════════════╝*';

            await sock.sendMessage(from, {

                text: text,

                mentions: sorted.map(([jid]) => jid)

            }, { quoted: msg });

        } catch (error) {

            console.error('خطأ في أمر top:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};