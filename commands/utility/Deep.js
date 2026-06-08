const { voiceEffect } = require('../../voiceFX');

module.exports = {

    name: "عميق",

    aliases: ["deep"],

    category: "media",

    description: "تأثير صوت عميق",

    

    async execute(sock, msg, args, extra) {

        try {

            await voiceEffect(sock, msg, "asetrate=44100*0.75,atempo=1.25");

        } catch (error) {

            console.error('خطأ في تأثير عميق:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};