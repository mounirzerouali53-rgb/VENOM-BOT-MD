const fs = require('fs');
const path = require('path');
const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');
const { sendInteractiveMessage } = require('gifted-btns');

module.exports = {
    name: 'مساعدة',
    description: '⚔️ تعرف على أوامر 𝕽𝖚𝖚𝖇𝖎𝖔',
    usage: '◈ استخدم .مساعدة لإظهار الأقسام\n◈ .مساعدة [رقم القسم] لاستعراض الأوامر',
    category: '👑 الـقـسـم الـذهـبـي 👑',

    async execute(sock, msg, args, extra) {
        try {
            const prefix = config.prefix;
            const commands = loadCommands();
            const isCategoryRequest = !isNaN(parseInt(args[0])) && parseInt(args[0]) > 0;

            const localImagePath = path.join(process.cwd(), 'utils', 'bot_image.jpg');
            const imageUrl = fs.existsSync(localImagePath)
                ? { url: localImagePath }
                : { url: 'https://telegra.ph/file/07f8725916053327d741c.jpg' };

            let categories = {};
            commands.forEach((cmd) => {
                let cat = (cmd.category || 'أخرى').toLowerCase();
                if (!categories[cat]) categories[cat] = [];
                if (!categories[cat].includes(cmd.name)) categories[cat].push(cmd.name);
            });

            const categoryList = Object.keys(categories).sort();
            const requestNumber = parseInt(args[0]);

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 1️⃣ القائمة الرئيسية - فهرس الأقسام
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            if (!isCategoryRequest || requestNumber > categoryList.length) {

                let mainMenuText = `╭━━━⚔️👑⚔️━━━╮\n`;
                mainMenuText += `┃ 🇩🇪 *BOT 𝕽𝖚𝖚𝖇𝖎𝖔* 🇩🇪\n`;
                mainMenuText += `╰━━━⛓️☣️⛓️━━━╯\n\n`;
                mainMenuText += `┃ 🪽 مرحباً يا @${extra.sender.split('@')[0]} ✨\n`;
                mainMenuText += `┃ ⚡ البادئة : *${prefix}*\n`;
                mainMenuText += `┃ 🍁 الحالة : 【 نشط 】\n`;
                mainMenuText += `*◈ ━━━━━━ ⚔️ ━━━━━━ ◈*\n\n`;
                mainMenuText += `👇 *اختر قسماً من القائمة أدناه*\n`;
                mainMenuText += `📦 *الأوامر الكلية* : ${commands.size} أمر\n`;
                mainMenuText += `*◈ ━━━━━━ ⚔️ ━━━━━━ ◈*\n`;
                mainMenuText += `> ☣️ *BOT 𝕽𝖚𝖚𝖇𝖎𝖔* ☣️`;

                // بناء صفوف القائمة المنسدلة - كل قسم صف
                const menuRows = categoryList.map((cat, index) => ({
                    header: `0${index + 1}`,
                    title: `${getCategoryEmoji(cat)} ${cat.toUpperCase()}`,
                    description: `${categories[cat].length} أمر متاح`,
                    id: `help_cat_${index + 1}`
                }));

                await sendInteractiveMessage(sock, extra.from, {
                    image: imageUrl,
                    text: mainMenuText,
                    footer: '⛓️ Powered by 𝕽𝖚𝖚𝖇𝖎𝖔 ⛓️',
                    interactiveButtons: [
                        // ━━━ القائمة المنسدلة للأقسام ━━━
                        {
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: '📂 اختر القسم',
                                sections: [
                                    {
                                        title: '👑 الأقسام المتاحة',
                                        rows: menuRows
                                    }
                                ]
                            })
                        },
                        // ━━━ زر قناة البوت ━━━
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '⚔️ قـنـاة البـوت ⚔️',
                                url: 'https://whatsapp.com/channel/0029VbD5Wf1JUM2VtknMSj0R'
                            })
                        }
                    ]
                }, { quoted: msg });
                return;
            }

            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            // 2️⃣ صفحة الأوامر - قسم محدد
            // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            const selectedCategory = categoryList[requestNumber - 1];
            const commandNames = categories[selectedCategory].sort();

            let categoryText = `╭━━━⚔️🇩🇪⚔️━━━╮\n`;
            categoryText += `┃ 👑 القسم : *${selectedCategory.toUpperCase()}*\n`;
            categoryText += `┃ 🍁 عدد الأوامر : *${commandNames.length} أمر*\n`;
            categoryText += `┃ ✨ الحالة : *فعال*\n`;
            categoryText += `╰━━━⛓️☣️⛓️━━━╯\n\n`;
            categoryText += `*╭━━━ 📋 قائمة الأوامر ━━━╮*\n`;

            commandNames.forEach((cmd) => {
                const cmdObj = commands.get(cmd);
                const cmdDesc = cmdObj?.description || '⚔️ أمر احترافي';
                categoryText += `*┃ 🪽 الأمر :* \`${prefix}${cmd}\`\n`;
                categoryText += `*┃ 📄 الشرح :* ${cmdDesc}\n`;
                categoryText += `*┃ ━━━━━━━━━━━━━━━━━━ ┃*\n`;
            });

            categoryText += `*╰━━━━━━━━━━━━━━━━━━━╯*\n`;
            categoryText += `🇮🇲 *الصفحة* : ${requestNumber} / ${categoryList.length}\n`;
            categoryText += `> ⚔️ *BOT 𝕽𝖚𝖚𝖇𝖎𝖔* ⚔️`;

            // بناء أزرار التنقل - نستخدم single_select فقط لأن quick_reply غير مدعوم
            const navButtons = [];

            // بناء صفوف التنقل داخل القائمة المنسدلة
            const navRows = [];

            // زر الصفحة التالية
            if (requestNumber < categoryList.length) {
                navRows.push({
                    header: '⬅️',
                    title: `التالي: ${categoryList[requestNumber]?.toUpperCase()}`,
                    description: `الانتقال للصفحة ${requestNumber + 1}`,
                    id: `help_cat_${requestNumber + 1}`
                });
            }

            // زر الصفحة السابقة
            if (requestNumber > 1) {
                navRows.push({
                    header: '➡️',
                    title: `السابق: ${categoryList[requestNumber - 2]?.toUpperCase()}`,
                    description: `الانتقال للصفحة ${requestNumber - 1}`,
                    id: `help_cat_${requestNumber - 1}`
                });
            }

            // زر الرجوع للقائمة الرئيسية
            navRows.push({
                header: '🏠',
                title: 'القائمة الرئيسية',
                description: 'عرض جميع الأقسام',
                id: 'help_main'
            });

            // القائمة المنسدلة الرئيسية للتنقل + الأقسام
            navButtons.push({
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                    title: '📂 التنقل والأقسام',
                    sections: [
                        {
                            title: '🔀 التنقل',
                            rows: navRows
                        },
                        {
                            title: '👑 جميع الأقسام',
                            rows: categoryList.map((cat, index) => ({
                                header: `0${index + 1}`,
                                title: `${getCategoryEmoji(cat)} ${cat.toUpperCase()}`,
                                description: `${categories[cat].length} أمر`,
                                id: `help_cat_${index + 1}`
                            }))
                        }
                    ]
                })
            });

            // زر المطور
            navButtons.push({
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                    display_text: '👑 المطور 𝕽𝖚𝖚𝖇𝖎𝖔 👑',
                    url: 'https://github.com/mounirzerouali53'
                })
            });

            await sendInteractiveMessage(sock, extra.from, {
                image: imageUrl,
                text: categoryText,
                footer: `🍁 الصفحة ${requestNumber} من ${categoryList.length} 🍁`,
                interactiveButtons: navButtons
            }, { quoted: msg });

        } catch (err) {
            console.error('❌ خطأ في نظام المساعدة:', err);
            await extra.reply('╭━━━☣️━━━╮\n┃ ⚠️ حدث خطأ في النظام!\n┃ 🔄 حاول مجدداً لاحقاً\n╰━━━☣️━━━╯');
        }
    }
};

/**
 * دالة لمنح كل قسم إيموجي خاص به
 */
function getCategoryEmoji(category) {
    const categoryMap = {
        'عام':    '🌍',
        'ادمن':   '👑',
        'العاب':  '🎮',
        'تحميل':  '📥',
        'متعة':   '🎭',
        'اسلامي': '🕌',
        'أخرى':   '⚔️'
    };
    return categoryMap[category.toLowerCase()] || '🍁';
}
