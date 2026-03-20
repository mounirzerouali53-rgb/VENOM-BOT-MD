const truths = [

    'شنو أكثر سر مخبيه؟',

    'واش عمرك كذبت على شي حد قريب؟',

    'شنو الحاجة لي كتندم عليها؟',

    'شنو أكثر حاجة كتخاف منها؟',

    'شنو آخر كذبة قلتها؟',

    'شنو أغرب مكان دخلتيه؟',

    'هل بكيت أمام أحد؟',

    'شنو أكثر شيء ندمت عليه؟'

];

module.exports = {

    name: "صراحة",

    aliases: ["truth"],

    category: "fun",

    description: "سؤال صراحة عشوائي",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            const random = truths[Math.floor(Math.random() * truths.length)];

            await sock.sendMessage(from, {

                text: `*╔══〔 🤫 سؤال صراحة 〕══╗*\n\n${random}`

            }, { quoted: msg });

        } catch (error) {

            console.error('خطأ في صراحة:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};