const fs = require('fs');

const path = require('path');

const settings = require('../../config');

module.exports = {

    name: "هوبة",

    aliases: ["hoba", "تدمير"],

    category: "group",

    description: "أمر خاص للمالك",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            const sender = msg.key.participant || msg.key.remoteJid;

            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

            const ownerJid = settings.ownerNumber + '@s.whatsapp.net';

            if (!from.endsWith('@g.us')) {

                return await sock.sendMessage(from, {

                    text: '❌ هذا الأمر متاح فقط في المجموعات.'

                }, { quoted: msg });

            }

            if (sender !== ownerJid && !msg.key.fromMe) {

                return await sock.sendMessage(from, {

                    text: '*❌ هذا الأمر للمالك فقط!*'

                }, { quoted: msg });

            }

            const metadata = await sock.groupMetadata(from);

            const allParticipants = metadata.participants.map(p => p.id);

            const toKick = allParticipants.filter(id => id !== sender && id !== botId);

            await sock.sendMessage(from, {

                text: `*⚠️ تنبيه للجميع!*\n\n*سيتم تطهير المجموعة...*\n*عدد المستهدفين:* ${toKick.length}`

            }, { quoted: msg });

            for (let i = 1; i <= 4; i++) {

                await new Promise(res => setTimeout(res, 1000));

                await sock.sendMessage(from, {

                    text: `*⏳ التنفيذ بعد:* ${4 - i} ثوانٍ`

                });

            }

            await sock.groupUpdateSubject(from, '꧁༒『𝑽𝑬𝑵𝑶𝑴』༒꧂').catch(() => {});

            

            if (toKick.length > 0) {

                await sock.groupParticipantsUpdate(from, toKick, 'remove').catch(() => {});

            }

            await sock.sendMessage(from, {

                text: `*💀 تم التدمير بنجاح!*\n*👥 تم طرد:* ${toKick.length} عضو`

            });

        } catch (error) {

            console.error('خطأ في هوبة:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};