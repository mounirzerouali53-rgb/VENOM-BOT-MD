module.exports = {

    name: "شخصية",

    aliases: ["character", "تحليل"],

    category: "fun",

    description: "تحليل شخصية المستخدم",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            let userToAnalyze;

            if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {

                userToAnalyze = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];

            } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {

                userToAnalyze = msg.message.extendedTextMessage.contextInfo.participant;

            } else {

                userToAnalyze = msg.key.participant || msg.key.remoteJid;

            }

            let profilePic;

            try {

                profilePic = await sock.profilePictureUrl(userToAnalyze, 'image');

            } catch {

                profilePic = 'https://i.imgur.com/2wzGhpF.jpeg';

            }

            const traits = [

                "دماغه سم وتفكير عالي", "مبدع ورايق", "عنده عزيمة حديد", "طموح ملوش حدود",

                "كاريزما تخطف العين", "ثقة في النفس جبارة", "شعلة نشاط وحيوية", "ابن أصول وودود",

                "كريم وشهم", "صادق ومبيحبش اللف", "دمه خفيف", "وفي وصاحب صاحبه"

            ];

            const numTraits = Math.floor(Math.random() * 3) + 3;

            const selectedTraits = [];

            

            while (selectedTraits.length < numTraits) {

                const trait = traits[Math.floor(Math.random() * traits.length)];

                if (!selectedTraits.includes(trait)) {

                    const percentage = Math.floor(Math.random() * 41) + 60;

                    selectedTraits.push(`🔥 ${trait}: ${percentage}%`);

                }

            }

            const analysis = `*╔═══〔 🔮 تحليل الشخصية 〕═══╗*\n\n` +

                `👤 @${userToAnalyze.split('@')[0]}\n\n` +

                `✨ *الصفات:*\n${selectedTraits.join('\n')}\n\n` +

                `🎯 *التقييم:* ${Math.floor(Math.random() * 21) + 80}%\n\n` +

                `*فينوم بيقولك:* ده مجرد هزار يا وحش! 😎`;

            await sock.sendMessage(from, {

                image: { url: profilePic },

                caption: analysis,

                mentions: [userToAnalyze]

            }, { quoted: msg });

        } catch (error) {

            console.error('خطأ في تحليل الشخصية:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};
