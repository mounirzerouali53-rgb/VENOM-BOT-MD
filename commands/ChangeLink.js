module.exports = {

    name: "رابط",

    aliases: ["link", "group link"],

    category: "group",

    description: "تغيير رابط المجموعة",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            const sender = msg.key.participant || msg.key.remoteJid;

            if (!from.endsWith('@g.us')) {

                return await sock.sendMessage(from, {

                    text: '❌ هذا الأمر يُستخدم داخل المجموعات فقط.'

                }, { quoted: msg });

            }

            const groupMetadata = await sock.groupMetadata(from);

            const isBotAdmin = groupMetadata.participants.find(p => p.id === sock.user.id)?.admin;

            

            if (!isBotAdmin) {

                return await sock.sendMessage(from, {

                    text: '❌ البوت ليس مشرفاً في المجموعة.'

                }, { quoted: msg });

            }

            const newInviteCode = await sock.groupRevokeInvite(from);

            const newLink = `https://chat.whatsapp.com/${newInviteCode}`;

            await sock.sendMessage(from, {

                text: `✅ تم تغيير رابط المجموعة بنجاح!\n\n*الرابط الجديد:* ${newLink}`

            }, { quoted: msg });

        } catch (error) {

            console.error('خطأ في تغيير الرابط:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ فشل في تغيير الرابط. تأكد من صلاحيات البوت.`

            }, { quoted: msg });

        }

    }

};