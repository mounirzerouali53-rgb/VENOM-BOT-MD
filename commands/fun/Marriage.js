const fs = require('fs');

const path = require('path');

const marriagesFile = path.join(__dirname, '../../database/married.json');

function loadMarriages() {

    if (!fs.existsSync(marriagesFile)) return {};

    return JSON.parse(fs.readFileSync(marriagesFile));

}

function saveMarriages(data) {

    fs.writeFileSync(marriagesFile, JSON.stringify(data, null, 2));

}

module.exports = {

    name: "زواج",

    aliases: ["marry", "ارتبط"],

    category: "marriage",

    description: "الزواج من عضو في المجموعة",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            const sender = msg.key.participant || msg.key.remoteJid;

            let target = null;

            if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {

                target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];

            } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {

                target = msg.message.extendedTextMessage.contextInfo.participant;

            }

            if (!target) {

                return await sock.sendMessage(from, {

                    text: '❌ منشن الشخص أو رد على رسالته!'

                }, { quoted: msg });

            }

            if (sender === target) {

                return await sock.sendMessage(from, {

                    text: '😂 لا يمكنك الزواج بنفسك!'

                }, { quoted: msg });

            }

            const marriages = loadMarriages();

            

            if (!marriages[from]) marriages[from] = {};

            if (!marriages[from][sender]) marriages[from][sender] = [];

            if (marriages[from][sender].includes(target)) {

                return await sock.sendMessage(from, {

                    text: '💔 أنت متزوج من هذا الشخص بالفعل!'

                }, { quoted: msg });

            }

            marriages[from][sender].push(target);

            saveMarriages(marriages);

            await sock.sendMessage(from, {

                text: `

*╔══〔 💍 زواج مبارك 〕══╗*

👑 الزوج: @${sender.split('@')[0]}

👸 الزوجة: @${target.split('@')[0]}

*🎉 ألف مبروك!*

*╚════════════════╝*`,

                mentions: [sender, target]

            }, { quoted: msg });

        } catch (error) {

            console.error('خطأ في الزواج:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};