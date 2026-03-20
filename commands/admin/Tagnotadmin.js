module.exports = {

    name: "منشن",

    aliases: ["tag", "all"],

    category: "group",

    description: "منشن جميع الأعضاء غير المشرفين",

 ownerOnly:true,   
groupOnly:true,
    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            const sender = msg.key.participant || msg.key.remoteJid;

            if (!from.endsWith('@g.us')) {

                return await sock.sendMessage(from, {

                    text: '❌ هذا الأمر متاح فقط في المجموعات.'

                }, { quoted: msg });

            }

            const groupMetadata = await sock.groupMetadata(from);

            const participants = groupMetadata.participants;

            const isSenderAdmin = participants.find(p => p.id === sender)?.admin;

            const isBotAdmin = participants.find(p => p.id === sock.user.id)?.admin;

            if (!isBotAdmin) {

                return await sock.sendMessage(from, {

                    text: '❌ البوت ليس مشرفاً في المجموعة.'

                }, { quoted: msg });

            }

            if (!isSenderAdmin) {

                return await sock.sendMessage(from, {

                    text: '❌ هذا الأمر للمشرفين فقط!'

                }, { quoted: msg });

            }

            const nonAdmins = participants.filter(p => !p.admin).map(p => p.id);

            

            if (nonAdmins.length === 0) {

                return await sock.sendMessage(from, {

                    text: '📭 لا يوجد أعضاء غير مشرفين.'

                }, { quoted: msg });

            }

            let text = args.join(' ') || '📢 منشن للأعضاء:\n\n';

            nonAdmins.forEach(jid => {

                text += `@${jid.split('@')[0]}\n`;

            });

            await sock.sendMessage(from, {

                text: text,

                mentions: nonAdmins

            }, { quoted: msg });

        } catch (error) {

            console.error('خطأ في منشن:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};