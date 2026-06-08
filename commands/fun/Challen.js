const dares = [

    'بدل صورتك ساعة 😈',

    'غني مقطع صوتي 🎤',

    'قول نكتة قدام الجميع 😂',

    'شارك صورة حيوان ظريف 🐶',

    'اعمل مقطع فيديو تضحك فيه',

    'سمي شخص تحبه في المجموعة',

    'اكتب رسالة لشخص تكرهه',

    'اعترف بشيء محرج حصل معك'

];

module.exports = {

    name: "فعلها",

    aliases: ["dare"],

    category: "fun",

    description: "تحدي عشوائي",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            const random = dares[Math.floor(Math.random() * dares.length)];

            await sock.sendMessage(from, {

                text: `*╔══〔 🎭 تحدي 〕══╗*\n\n${random}`

            }, { quoted: msg });

        } catch (error) {

            console.error('خطأ في التحدي:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};