module.exports = {

    name: "رحب",

    aliases: ["welcome", "رحب"],

    category: "group",

    description: "ترحيب بعضو جديد",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            if (!from.endsWith('@g.us')) {

                return await sock.sendMessage(from, {

                    text: '❌ هذا الأمر متاح فقط في المجموعات.'

                }, { quoted: msg });

            }

            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

            

            if (!mentioned || mentioned.length === 0) {

                return await sock.sendMessage(from, {

                    text: '❌ منشن الشخص المطلوب: .ترحيب @المستخدم'

                }, { quoted: msg });

            }

            const targetJid = mentioned[0];

            const groupMetadata = await sock.groupMetadata(from);

            const groupName = groupMetadata.subject;

            let ppUrl;

            try {

                ppUrl = await sock.profilePictureUrl(targetJid, 'image');

            } catch {

                ppUrl = null;

            }

            const caption = `

*༺═──────── 👑 ────────═༻*

   *⚜️ ترحيب بنجم جديد ⚜️*

 *༺═─────── 💖 ───────═༻*

 

✨ أهلاً @${targetJid.split('@')[0]}

🏰 في مجموعة: ${groupName}

🌹 تشريفك زادنا بهجة

🌟 نتمنى لك إقامة ممتعة

*💫 أهلاً وسهلاً بك*`;

            if (ppUrl) {

                await sock.sendMessage(from, {

                    image: { url: ppUrl },

                    caption: caption,

                    mentions: mentioned

                }, { quoted: msg });

            } else {

                await sock.sendMessage(from, {

                    text: caption,

                    mentions: mentioned

                }, { quoted: msg });

            }

        } catch (error) {

            console.error('خطأ في الترحيب:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};