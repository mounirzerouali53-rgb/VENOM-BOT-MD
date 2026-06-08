const { voiceEffect } = require('../../voiceFX');

module.exports = {

    name: "امراة",

    aliases: ["woman", "بنت"],

    category: "media",

    description: "تأثير صوت امرأة",

    

    async execute(sock, msg, args, extra) {

        try {

            await voiceEffect(sock, msg, "asetrate=44100*1.3,atempo=0.85");

        } catch (error) {

            console.error('خطأ في تأثير امراة:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};