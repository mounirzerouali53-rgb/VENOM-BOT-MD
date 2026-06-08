let activeGames = {};

const historicalFigures = [
    { name: "صلاح الدين الأيوبي", hint: "حرر القدس من الصليبيين", era: "القرن 12" },
    { name: "عمر بن الخطاب", hint: "ثاني الخلفاء الراشدين", era: "الخلافة الراشدة" },
    { name: "خالد بن الوليد", hint: "سيف الله المسلول", era: "الفتوحات الإسلامية" },
    { name: "المهاتما غاندي", hint: "الثورة السلمية في الهند", era: "القرن 20" },
    { name: "نابليون بونابرت", hint: "قائد فرنسي شهير", era: "القرن 19" },
    { name: "الإسكندر الأكبر", hint: "ملك مقدوني غزا العالم القديم", era: "القرن 4 ق.م" },
    { name: "يوليوس قيصر", hint: "ديكتاتور روماني", era: "القرن 1 ق.م" },
    { name: "جورج واشنطن", hint: "أول رئيس لأمريكا", era: "القرن 18" },
    { name: "ونستون تشرشل", hint: "رئيس وزراء بريطانيا في الحرب العالمية", era: "القرن 20" },
    { name: "أدولف هتلر", hint: "زعيم ألمانيا النازية", era: "الحرب العالمية الثانية" },
    { name: "تشارلي شابلن", hint: "ممثل صامت شهير", era: "القرن 20" },
    { name: "ألبرت أينشتاين", hint: "صاحب نظرية النسبية", era: "القرن 20" }
];

module.exports = {
    name: 'تاريخ',
    aliases: ['history', 'شخصية'],
    category: 'games',
    description: 'تخمين الشخصيات التاريخية',
    usage: '.تاريخ [لعب|تخمين|stop]',
    groupOnly: true,
    adminOnly: false,
    botAdminNeeded: false,

    async execute(sock, msg, args, extra) {
        const { from, reply, sender } = extra;
        const userId = sender;

        if (args[0] === 'stop') {
            if (activeGames[from]) delete activeGames[from];
            return reply(activeGames[from] ? '🛑 تم الإيقاف' : '❌ لا توجد لعبة');
        }

        if (args[0] === 'تخمين' || args[0] === 'guess') {
            if (args.length < 2) return reply('⚠️ .تاريخ تخمين [الاسم]');
            const game = activeGames[from];
            if (!game) return reply('❌ ابدأ لعبة بـ .تاريخ لعب');

            const guess = args.slice(1).join(' ').toLowerCase();
            if (guess === game.answer.name.toLowerCase()) {
                await reply(`✅ *إجابة صحيحة!*\n👤 @${userId.split('@')[0]} عرف الشخصية: ${game.answer.name}`,
                    { mentions: [userId] }
                );
                delete activeGames[from];
            } else {
                return reply(`❌ خطأ! الشخصية ليست "${guess}"`);
            }
            return;
        }

        if (args[0] === 'لعب' || !args[0]) {
            if (activeGames[from]) return reply('⚠️ لعبة نشطة حالياً');
            const random = historicalFigures[Math.floor(Math.random() * historicalFigures.length)];
            activeGames[from] = { answer: random, ended: false };
            return reply(`🏛️ *تخمين الشخصية التاريخية*\n\n📜 الحقبة: ${random.era}\n💡 التلميح: ${random.hint}\n\nاستخدم .تاريخ تخمين [الاسم]`);
        }
    }
};