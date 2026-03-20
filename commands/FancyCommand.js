const fancyText = require('../../data/fancyText');

module.exports = {

    name: "زخرفة",

    aliases: ["fancy", "زخرف"],

    category: "fun",

    description: "زخرفة النصوص بأنماط مختلفة",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            const text = args.join(' ');

            if (!text) {

                return await sock.sendMessage(from, {

                    text: '✏️ اكتب نص للزخرفة\nمثال: .زخرفة Hello'

                }, { quoted: msg });

            }

            const styles = ['style1', 'style2', 'style3', 'style4'];

            const results = styles.map(style => fancyText(text, style));

            const messageText = `*╔═══〔 ✨ زخرفة النص 〕═══╗*\n\n` +

                `*النص:* ${text}\n\n` +

                results.map((res, i) => `✨ شكل ${i+1}:\n${res}`).join('\n\n');

            await sock.sendMessage(from, {

                text: messageText

            }, { quoted: msg });

        } catch (error) {

            console.error('خطأ في الزخرفة:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};