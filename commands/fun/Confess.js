module.exports = {

    name: "اعتراف",

    aliases: ["confess", "همس"],

    category: "fun",

    description: "إرسال اعتراف لشخص عشوائي",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            if (!from.endsWith('@g.us')) {

                return await sock.sendMessage(from, {

                    text: '❌ هذا الأمر متاح فقط في المجموعات.'

                }, { quoted: msg });

            }

            const sender = msg.key.participant || msg.key.remoteJid;

            const groupMetadata = await sock.groupMetadata(from);

            const participants = groupMetadata.participants.map(p => p.id).filter(id => id !== sender);

            if (participants.length === 0) {

                return await sock.sendMessage(from, {

                    text: '😔 لا يوجد أعضاء آخرون للاعتراف لهم.'

                }, { quoted: msg });

            }

            const randomIndex = Math.floor(Math.random() * participants.length);

            const target = participants[randomIndex];

            const text = `

*╔══💘 رسالة اعتراف 💘══╗*

@${sender.split('@')[0]} ❤️ يهمس لـ @${target.split('@')[0]}:

🌹 *"قلبي اختارك من بين الجميع..."*

*╚════════════════╝*`;

            await sock.sendMessage(from, {

                text,

                mentions: [sender, target]

            }, { quoted: msg });

        } catch (error) {

            console.error('خطأ في الاعتراف:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};