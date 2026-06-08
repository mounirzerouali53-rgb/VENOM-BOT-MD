const challenges = [

    '📸 أرسل صورة من ألبومك خلال 10 ثواني!',

    '🎤 غنّي أغنية بصوتك وأرسلها الآن!',

    '😂 اكتب جملة من دون استخدام حرف "ا"',

    '📱 أرسل آخر رسالة وصلتك في الخاص',

    '🕺 قم بتقليد شخصية مشهورة وأرسل مقطع صوتي',

    '📢 قل بصوتك: "أنا أحب هذا الجروب"',

    '✍️ اكتب نكتة جديدة من تأليفك',

    '🎮 اذكر اسم لعبة مفضلة لديك',

    '💬 لا تكتب أي رسالة لمدة 5 دقائق',

    '🎭 أرسل ملصق يعبر عن حالتك النفسية'

];

module.exports = {

    name: "تحدي",

    aliases: ["challenge"],

    category: "fun",

    description: "تحدي عشوائي للأعضاء",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            const random = challenges[Math.floor(Math.random() * challenges.length)];

            await sock.sendMessage(from, {

                text: `*╔═══〔 🎮 تحدي 〕═══╗*\n\n${random}`

            }, { quoted: msg });

        } catch (error) {

            console.error('خطأ في التحدي:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};