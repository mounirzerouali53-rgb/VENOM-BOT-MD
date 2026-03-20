const fs = require('fs');

const path = require('path');

const marriagesFile = path.join(__dirname, '../../database/married.json');

function loadMarriages() {

    if (!fs.existsSync(marriagesFile)) return {};

    return JSON.parse(fs.readFileSync(marriagesFile));

}

module.exports = {

    name: "زوجاتي",

    aliases: ["mywives", "زوجتي"],

    category: "marriage",

    description: "عرض قائمة الزوجات",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            const sender = msg.key.participant || msg.key.remoteJid;

            const marriages = loadMarriages();

            

            if (!marriages[from] || !marriages[from][sender] || marriages[from][sender].length === 0) {

                return await sock.sendMessage(from, {

                    text: '🙁 ليس لديك زوجات في هذه المجموعة.'

                }, { quoted: msg });

            }

            const wives = marriages[from][sender];

            const wivesText = wives.map(jid => `👸 @${jid.split('@')[0]}`).join('\n');

            await sock.sendMessage(from, {

                text: `

*╔══〔 💍 زوجاتك 〕══╗*

👑 @${sender.split('@')[0]}

${wivesText}

*عدد الزوجات: ${wives.length}*

*╚════════════════╝*`,

                mentions: [sender, ...wives]

            }, { quoted: msg });

        } catch (error) {

            console.error('خطأ في عرض الزوجات:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};