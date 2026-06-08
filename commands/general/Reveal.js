const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {

    name: "افتح",

    aliases: ["open", "viewonce"],

    category: "media",

    description: "فتح رسالة العرض لمرة واحدة",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            const quotedContext = msg.message?.extendedTextMessage?.contextInfo;

            if (!quotedContext || !quotedContext.quotedMessage) {

                return await sock.sendMessage(from, {

                    text: '⚠️ رد على رسالة العرض لمرة واحدة'

                }, { quoted: msg });

            }

            const quotedMsg = quotedContext.quotedMessage;

            const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage'];

            let mediaType = null;

            let mediaContent = null;

            for (const type of mediaTypes) {

                if (quotedMsg[type]) {

                    mediaType = type.replace('Message', '');

                    mediaContent = quotedMsg[type];

                    break;

                }

            }

            if (!mediaContent || !mediaContent.viewOnce) {

                return await sock.sendMessage(from, {

                    text: '❌ هذه ليست رسالة عرض لمرة واحدة'

                }, { quoted: msg });

            }

            const stream = await downloadContentFromMessage(mediaContent, mediaType);

            let buffer = Buffer.from([]);

            

            for await (const chunk of stream) {

                buffer = Buffer.concat([buffer, chunk]);

            }

            const sendOptions = {};

            sendOptions[mediaType] = buffer;

            

            if (mediaContent.caption) {

                sendOptions.caption = mediaContent.caption;

            }

            

            if (mediaType === 'audio') {

                sendOptions.mimetype = 'audio/mp4';

                sendOptions.ptt = true;

            }

            await sock.sendMessage(from, sendOptions, { quoted: msg });

        } catch (error) {

            console.error('خطأ في فتح الوسائط:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};