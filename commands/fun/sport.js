let activeGames = {};

const sports = [
    { name: "كرة القدم", hint: "تلعب بـ 11 لاعباً", star: "ميسي ورونالدو", type: "جماعية" },
    { name: "كرة السلة", hint: "سلة وطابة", star: "مايكل جوردان", type: "جماعية" },
    { name: "كرة المضرب", hint: "مضرب وكرة صفراء", star: "روجر فيدرر", type: "فردية" },
    { name: "السباحة", hint: "في الماء", star: "مايكل فيلبس", type: "فردية" },
    { name: "الملاكمة", hint: "قفازات وحلبة", star: "محمد علي", type: "قتالية" },
    { name: "الجودو", hint: "فن قتالي ياباني", star: "تيددي رينر", type: "قتالية" },
    { name: "كرة الطائرة", hint: "شبكة وضرب باليدين", star: "جيبا", type: "جماعية" },
    { name: "الجمباز", hint: "حركات أرضية وأجهزة", star: "سيمون بايلز", type: "فردية" },
    { name: "الرماية", hint: "مسدس أو بندقية", star: "عبد الله الراشدي", type: "فردية" },
    { name: "الفروسية", hint: "حصان وخيل", star: "أبطال العرب", type: "حيوانية" },
    { name: "التنس الأرضي", hint: "رولان غاروس ويمبلدون", star: "نادال", type: "فردية" }
];

module.exports = {
    name: 'رياضة',
    aliases: ['sport', 'رياضي'],
    category: 'games',
    description: 'تخمين الرياضة',
    usage: '.رياضة [لعب|تخمين|stop]',
    groupOnly: true,
    adminOnly: false,
    botAdminNeeded: false,

    async execute(sock, msg, args, extra) {
        const { from, reply, sender } = extra;
        const userId = sender;

        if (args[0] === 'stop') {
            if (activeGames[from]) delete activeGames[from];
            return reply('🛑 تم');
        }

        if (args[0] === 'تخمين' || args[0] === 'guess') {
            if (args.length < 2) return reply('⚠️ .رياضة تخمين [الرياضة]');
            const game = activeGames[from];
            if (!game) return reply('❌ .رياضة لعب');

            const guess = args.slice(1).join(' ').toLowerCase();
            if (guess === game.answer.name.toLowerCase()) {
                await reply(`🏆 *إجابة صحيحة!*\n✅ الرياضة: ${game.answer.name}\n⭐ نجمها: ${game.answer.star}\n👤 العضو: @${userId.split('@')[0]}`,
                    { mentions: [userId] }
                );
                delete activeGames[from];
            } else {
                return reply(`❌ غلط! الرياضة ليست "${guess}"`);
            }
            return;
        }

        if (args[0] === 'لعب' || !args[0]) {
            if (activeGames[from]) return reply('⚠️ لعبة نشطة');
            const random = sports[Math.floor(Math.random() * sports.length)];
            activeGames[from] = { answer: random, ended: false };
            return reply(`⚽ *لعبة تخمين الرياضة*\n\n💡 تلميح: ${random.hint}\n🏅 نجم: ${random.star}\n\nاستخدم .رياضة تخمين [الاسم]`);
        }
    }
};