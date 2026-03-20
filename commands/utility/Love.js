module.exports = {

    name: "حب",

    aliases: ["love", "نسبة الحب"],

    category: "fun",

    description: "حساب نسبة الحب بين شخصين",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            let userToAnalyze;

            if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {

                userToAnalyze = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];

            } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {

                userToAnalyze = msg.message.extendedTextMessage.contextInfo.participant;

            } else {

                return await sock.sendMessage(from, {

                    text: '❌ منشن الشخص أو رد على رسالته!'

                }, { quoted: msg });

            }

            const sender = msg.key.participant || msg.key.remoteJid;

            const percent = Math.floor(Math.random() * 100);

            await sock.sendMessage(from, {

                text: `*╔══〔 ❤️ نسبة الحب 〕══╗*\n\n` +

                      `👤 @${sender.split('@')[0]}\n` +

                      `👤 @${userToAnalyze.split('@')[0]}\n\n` +

                      `💖 النسبة: ${percent}%`,

                mentions: [sender, userToAnalyze]

            }, { quoted: msg });

        } catch (error) {

            console.error('خطأ في نسبة الحب:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};