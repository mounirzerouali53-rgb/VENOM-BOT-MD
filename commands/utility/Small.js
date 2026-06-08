const { voiceEffect } = 
require('../../voiceFX');
module.exports = {

    name: "صغير",

    aliases: ["baby"],

    category: "media",

    description: "تأثير صوت طفل",

    

    async execute(sock, msg, args, extra) {

        try {

            await voiceEffect(sock, msg, "asetrate=44100*1.5,atempo=0.7");

        } catch (error) {

            console.error('خطأ في تأثير صغير:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};