const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const settings = require('../../config');

module.exports = {

    name: "سبام",

    aliases: ["spam"],

    category: "owner",

    description: "تكرار الرسائل (للمالك فقط)",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            const sender = msg.key.participant || msg.key.remoteJid;

            const ownerJid = settings.ownerNumber + '@s.whatsapp.net';

            if (sender !== ownerJid && !msg.key.fromMe) {

                return await sock.sendMessage(from, {

                    text: '❌ هذا الأمر للمالك فقط!'

                }, { quoted: msg });

            }

            const count = parseInt(args[0]);

            if (isNaN(count) || count <= 0 || count > 50) {

                return await sock.sendMessage(from, {

                    text: '❌ عدد غير صحيح (1-50)'

                }, { quoted: msg });

            }

            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (quoted) {

                if (quoted.imageMessage) {

                    const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');

                    let buffer = Buffer.from([]);

                    for await (const chunk of stream) {

                        buffer = Buffer.concat([buffer, chunk]);

                    }

                    

                    for (let i = 0; i < count; i++) {

                        await sock.sendMessage(from, {

                            image: buffer,

                            caption: quoted.imageMessage.caption || ''

                        });

                        await new Promise(res => setTimeout(res, 500));

                    }

                } else if (quoted.videoMessage) {

                    const stream = await downloadContentFromMessage(quoted.videoMessage, 'video');

                    let buffer = Buffer.from([]);

                    for await (const chunk of stream) {

                        buffer = Buffer.concat([buffer, chunk]);

                    }

                    

                    for (let i = 0; i < count; i++) {

                        await sock.sendMessage(from, {

                            video: buffer,

                            caption: quoted.videoMessage.caption || ''

                        });

                        await new Promise(res => setTimeout(res, 500));

                    }

                } else {

                    const quotedText = quoted.conversation || quoted.extendedTextMessage?.text;

                    for (let i = 0; i < count; i++) {

                        await sock.sendMessage(from, { text: quotedText });

                        await new Promise(res => setTimeout(res, 500));

                    }

                }

            } else {

                const spamText = args.slice(1).join(' ');

                if (!spamText) {

                    return await sock.sendMessage(from, {

                        text: '❌ اكتب نص للسبام أو رد على رسالة'

                    }, { quoted: msg });

                }

                

                for (let i = 0; i < count; i++) {

                    await sock.sendMessage(from, { text: spamText });

                    await new Promise(res => setTimeout(res, 500));

                }

            }

        } catch (error) {

            console.error('خطأ في السبام:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};