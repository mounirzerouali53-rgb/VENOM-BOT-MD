const { sendInteractiveMessage } = require('gifted-btns');

module.exports = {
    name: 'بينج',
    aliases: ['p'],
    category: 'عام',
    description: 'تحقق من سرعة استجابة البوت',
    usage: '.بينج',

    async execute(sock, msg, args, extra) {
        try {
            const start = Date.now();
            await extra.reply('🏓 جاري القياس...');
            const end = Date.now();
            const responseTime = end - start;

            const jid = msg.key?.remoteJid;

            await sendInteractiveMessage(sock, jid, {
                text: `🏓 بينج! سرعة الاستجابة: ${responseTime}ms`,
                footer: 'البوت يعمل بشكل طبيعي',
                interactiveButtons: [
                    // رد سريع
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🔄 قياس مجدداً',
                            id: 'ping_again'
                        })
                    },
                    // قائمة اختيار
                    {
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                            title: 'خيارات إضافية',
                            sections: [
                                {
                                    title: 'الخيارات',
                                    rows: [
                                        {
                                            header: 'ℹ️',
                                            title: 'معلومات البوت',
                                            description: 'عرض معلومات عن البوت',
                                            id: 'opt_info'
                                        },
                                        {
                                            header: '❓',
                                            title: 'المساعدة',
                                            description: 'عرض قائمة الأوامر',
                                            id: 'opt_help'
                                        }
                                    ]
                                }
                            ]
                        })
                    }
                ]
            });

        } catch (error) {
            await extra.reply(`❌ خطأ: ${error.message}`);
        }
    }
};