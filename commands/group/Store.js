const { loadDB, saveDB, getUserData } = require('../../lib/database');

const fs = require('fs');

const path = require('path');

// ملفات تخزين المشتريات

const PURCHASES_FILE = path.join(__dirname, '../../database/purchases.json');

const ITEMS_FILE = path.join(__dirname, '../../database/items.json');

// تحميل المشتريات

function loadPurchases() {

    try {

        if (!fs.existsSync(PURCHASES_FILE)) return {};

        return JSON.parse(fs.readFileSync(PURCHASES_FILE));

    } catch {

        return {};

    }

}

// حفظ المشتريات

function savePurchases(data) {

    try {

        fs.writeFileSync(PURCHASES_FILE, JSON.stringify(data, null, 2));

    } catch (error) {

        console.error('خطأ في حفظ المشتريات:', error);

    }

}

// تحميل العناصر

function loadItems() {

    try {

        if (!fs.existsSync(ITEMS_FILE)) return {};

        return JSON.parse(fs.readFileSync(ITEMS_FILE));

    } catch {

        return {};

    }

}

// حفظ العناصر

function saveItems(data) {

    try {

        fs.writeFileSync(ITEMS_FILE, JSON.stringify(data, null, 2));

    } catch (error) {

        console.error('خطأ في حفظ العناصر:', error);

    }

}

// دالة عشوائية لصندوق الحظ

function getRandomInt(min, max) {

    return Math.floor(Math.random() * (max - min + 1)) + min;

}

module.exports = {

    name: 'متجر',

    aliases: ['shop', 'store', 'المملكة'],

    category: 'economy',

    description: '🏰 متجر المملكة الملكي – Eclipse Royal X',

    async execute(sock, msg, args, extra) {

        try {

            const chatId = extra.from;

            const sender = msg.key.participant || msg.key.remoteJid;

            const db = loadDB();

            const user = getUserData(db, sender);

            // ===============================

            // 🏰 متجر المملكة الملكي - أسعار CPS مرفوعة

            // ===============================

            const royalShop = {

                // 1️⃣ الترقيات الملكية (فاخر جدًا) - أسعار ×5

                royalRanks: [

                    { 

                        id: 1, 

                        name: '🌟 *رتبة شينوبي تدريبي*', 

                        price: 2500,  // 500 × 5

                        cps: 2500,

                        type: 'rank',

                        rank: 'شينوبي تدريبي',

                        desc: 'بداية طريق النينجا',

                        emoji: '🌟',

                        benefits: [

                            '• تدريب أساسي',

                            '• مهارات النينجا الأولى',

                            '• شارة تدريب'

                        ]

                    },

                    { 

                        id: 2, 

                        name: '🛡️ *رتبة كيوجن*', 

                        price: 6000,  // 1200 × 5

                        cps: 6000,

                        type: 'rank',

                        rank: 'كيوجن',

                        desc: 'محارب متقدم',

                        emoji: '🛡️',

                        benefits: [

                            '• تقنيات قتالية متقدمة',

                            '• درع كيوجن',

                            '• احترام في المعارك'

                        ]

                    },

                    { 

                        id: 3, 

                        name: '⚔️ *رتبة هاشيرا*', 

                        price: 12500,  // 2500 × 5

                        cps: 12500,

                        type: 'rank',

                        rank: 'هاشيرا',

                        desc: 'عمود من أعمدة السيوف',

                        emoji: '⚔️',

                        benefits: [

                            '• أقوى مقاتلي السيوف',

                            '• تقنيات breathing',

                            '• مكانة مرموقة'

                        ]

                    },

                    { 

                        id: 4, 

                        name: '🪽 *رتبة تشيبّوكاي*', 

                        price: 20000,  // 4000 × 5

                        cps: 20000,

                        type: 'rank',

                        rank: 'تشيبّوكاي',

                        desc: 'أسياد البحر السبعة',

                        emoji: '🪽',

                        benefits: [

                            '• قوة بحرية هائلة',

                            '• سفينة خاصة',

                            '• سلطة على البحار'

                        ]

                    },

                    { 

                        id: 5, 

                        name: '🌕 *رتبة شوغن*', 

                        price: 30000,  // 6000 × 5

                        cps: 30000,

                        type: 'rank',

                        rank: 'شوغن',

                        desc: 'القائد الأعلى',

                        emoji: '🌕',

                        benefits: [

                            '• قيادة الجيوش',

                            '• حكم المقاطعات',

                            '• أعلى سلطة عسكرية'

                        ]

                    }

                ],

                // 2️⃣ الأدوات الخاصة (نادرة وفخمة) - أسعار ×4

                specialTools: [

                    { 

                        id: 6, 

                        name: '🪙 *حقيبة CPS إضافية*', 

                        price: 4000,  // 1000 × 4

                        cps: 200,  // 50 × 4

                        type: 'cps_booster',

                        desc: '+200 CPS فوراً',

                        emoji: '🪙',

                        use: 'تضاف لرصيدك مباشرة'

                    },

                    { 

                        id: 7, 

                        name: '⚔️ *سلاح خاص للفعاليات*', 

                        price: 6000,  // 1500 × 4

                        cps: 0,

                        type: 'weapon',

                        desc: 'سلاح نادر للمناسبات',

                        emoji: '⚔️',

                        effect: 'قوة هجوم +100 في الفعاليات'

                    },

                    { 

                        id: 8, 

                        name: '🎭 *خوذة الفعاليات الملكية*', 

                        price: 4800,  // 1200 × 4

                        cps: 0,

                        type: 'helmet',

                        desc: 'خوذة تظهر في الفعاليات',

                        emoji: '🎭',

                        effect: 'حماية +60 في المعارك'

                    },

                    { 

                        id: 9, 

                        name: '🏹 *القوس الملكي الأسطوري*', 

                        price: 8000,  // 2000 × 4

                        cps: 0,

                        type: 'bow',

                        desc: 'قوس الملوك القدماء',

                        emoji: '🏹',

                        effect: 'دقة تصويب +140'

                    },

                    { 

                        id: 10, 

                        name: '🛡️ *درع ملكي فاخر*', 

                        price: 7200,  // 1800 × 4

                        cps: 0,

                        type: 'shield',

                        desc: 'درع من ذهب خالص',

                        emoji: '🛡️',

                        effect: 'دفاع +120'

                    },

                    { 

                        id: 11, 

                        name: '🎖️ *شارة ملكية فخمة للملف الشخصي*', 

                        price: 4800,  // 1200 × 4

                        cps: 0,

                        type: 'badge',

                        desc: 'شارة تظهر بجانب اسمك',

                        emoji: '🎖️',

                        effect: 'تظهر في الملف الشخصي'

                    }

                ],

                // 3️⃣ الهدايا والمكافآت (نادرة جدًا) - أسعار ×4

                gifts: [

                    { 

                        id: 12, 

                        name: '🎁 *صندوق الحظ الملكي اليومي*', 

                        price: 2000,  // 500 × 4

                        cps: 0,

                        type: 'lucky_box',

                        desc: 'ممكن يطلع CPS أو ذهب أو أداة نادرة',

                        emoji: '🎁',

                        possible: ['CPS (200-800)', 'ذهب (400-2000)', 'أداة نادرة', 'سلاح', 'درع']

                    },

                    { 

                        id: 13, 

                        name: '🏆 *تذكرة دخول الفعاليات الكبرى*', 

                        price: 4800,  // 1200 × 4

                        cps: 0,

                        type: 'event_ticket',

                        desc: 'دخول جميع الفعاليات',

                        emoji: '🏆',

                        duration: 'شهر'

                    },

                    { 

                        id: 14, 

                        name: '🌌 *ختم الأسطورة*', 

                        price: 10000,  // 2500 × 4

                        cps: 0,

                        type: 'legend_seal',

                        desc: 'زيادة نقاط التفاعل مؤقتًا',

                        emoji: '🌌',

                        effect: 'نقاط تفاعل ×2 لمدة أسبوع'

                    },

                    { 

                        id: 15, 

                        name: '🪄 *بطاقة سحرية ملكية*', 

                        price: 7200,  // 1800 × 4

                        cps: 0,

                        type: 'magic_card',

                        desc: 'للحصول على عنصر نادر عشوائي',

                        emoji: '🪄',

                        possible: ['أي عنصر من المتجر', 'CPS مضاعف', 'رتبة مؤقتة']

                    }

                ],

                // 4️⃣ المميزات الخاصة (VIP للغاية) - أسعار ×5

                vipFeatures: [

                    { 

                        id: 16, 

                        name: '👑 *أيقونة VIP للملف الشخصي*', 

                        price: 7500,  // 1500 × 5

                        cps: 0,

                        type: 'vip_icon',

                        desc: 'أيقونة خاصة بجانب اسمك',

                        emoji: '👑',

                        duration: 'شهر'

                    },

                    { 

                        id: 17, 

                        name: '💬 *ميزة رسائل ملكية خاصة*', 

                        price: 5000,  // 1000 × 5

                        cps: 0,

                        type: 'royal_messages',

                        desc: 'رسائل بتصميم ملكي',

                        emoji: '💬',

                        duration: 'شهر'

                    },

                    { 

                        id: 18, 

                        name: '🌑 *وضع باهت للعضو في المجموعة*', 

                        price: 4000,  // 800 × 5

                        cps: 0,

                        type: 'ghost_mode',

                        desc: 'تظهر بشكل مختلف',

                        emoji: '🌑',

                        duration: 'أسبوع'

                    },

                    { 

                        id: 19, 

                        name: '⚡ *إظهار العضو على التوب الأسبوعي بشكل فخم*', 

                        price: 6000,  // 1200 × 5

                        cps: 0,

                        type: 'top_showcase',

                        desc: 'ظهور مميز في قائمة الأسبوع',

                        emoji: '⚡',

                        duration: 'شهر'

                    },

                    { 

                        id: 20, 

                        name: '✨ *لقب ملكي مؤقت*', 

                        price: 5000,  // 1000 × 5

                        cps: 0,

                        type: 'royal_title',

                        desc: 'لقب خاص يظهر بجانب اسمك',

                        emoji: '✨',

                        duration: 'أسبوع'

                    },

                    { 

                        id: 21, 

                        name: '🧿 *تفعيل لون ملكي خاص للكتابة*', 

                        price: 4000,  // 800 × 5

                        cps: 0,

                        type: 'royal_color',

                        desc: 'لون ذهبي لرسائلك',

                        emoji: '🧿',

                        duration: 'شهر'

                    }

                ],

                // 5️⃣ الممتلكات الافتراضية (أغلى الممتلكات) - أسعار ×5

                virtualProperties: [

                    { 

                        id: 22, 

                        name: '🏰 *قصر شخصي داخل الريلم*', 

                        price: 40000,  // 8000 × 5

                        cps: 0,

                        type: 'palace',

                        desc: 'قصر فخم خاص بك',

                        emoji: '🏰',

                        benefits: [

                            '• استقبال الضيوف',

                            '• إقامة الحفلات',

                            '• تخزين العناصر'

                        ]

                    },

                    { 

                        id: 23, 

                        name: '🏯 *غرفة تدريب ملكية خاصة*', 

                        price: 25000,  // 5000 × 5

                        cps: 0,

                        type: 'training_room',

                        desc: 'تطوير مهاراتك',

                        emoji: '🏯',

                        benefits: [

                            '• تدريب مكثف',

                            '• زيادة نقاط القوة',

                            '• معلم خاص'

                        ]

                    },

                    { 

                        id: 24, 

                        name: '🛡️ *درع خاص للمشاركات*', 

                        price: 20000,  // 4000 × 5

                        cps: 0,

                        type: 'participation_shield',

                        desc: 'درع يظهر في مشاركاتك',

                        emoji: '🛡️',

                        effect: 'مضاعفة نقاط المشاركات'

                    },

                    { 

                        id: 25, 

                        name: '🪞 *مرآة الملوك*', 

                        price: 15000,  // 3000 × 5

                        cps: 0,

                        type: 'kings_mirror',

                        desc: 'تظهر العضو في ملفه بأسلوب ملكي',

                        emoji: '🪞',

                        effect: 'ملف شخصي متحرك'

                    },

                    { 

                        id: 26, 

                        name: '🛋️ *صالة ملكية فخمة*', 

                        price: 22500,  // 4500 × 5

                        cps: 0,

                        type: 'royal_lounge',

                        desc: 'للاحتفالات داخل الريلم',

                        emoji: '🛋️',

                        benefits: [

                            '• استضافة المناسبات',

                            '• اجتماعات النبلاء',

                            '• حفلات التتويج'

                        ]

                    },

                    { 

                        id: 27, 

                        name: '🎨 *لوحة تذكارية ملكية*', 

                        price: 12500,  // 2500 × 5

                        cps: 0,

                        type: 'memorial_painting',

                        desc: 'لوضع صورة أو رمز العضو',

                        emoji: '🎨',

                        effect: 'صورة شخصية في سجلات المملكة'

                    }

                ]

            };

            // ===============================

            // 🛒 عرض المتجر الرئيسي

            // ===============================

            if (!args[0] || args[0] === 'عرض') {

                const userCPS = user.cps || 0;

                

                let shopText = `

╔═══〔 🏰 *المملكة الملكي* 〕═══╗

     *Eclipse Royal X - المتجر الفاخر*

👑 @${sender.split('@')[0]}

💳 رصيدك: ${userCPS.toLocaleString()} CPS

━━━━━━━━━━━━━━━━━━

1️⃣ *الترقيات الملكية (فاخر جدًا)*

🌟 1. رتبة شينوبي تدريبي → 2,500 CPS

🛡️ 2. رتبة كيوجن → 6,000 CPS

⚔️ 3. رتبة هاشيرا → 12,500 CPS

🪽 4. رتبة تشيبّوكاي → 20,000 CPS

🌕 5. رتبة شوغن → 30,000 CPS

2️⃣ *الأدوات الخاصة (نادرة وفخمة)*

🪙 6. حقيبة CPS إضافية +200 → 4,000 CPS

⚔️ 7. سلاح خاص للفعاليات → 6,000 CPS

🎭 8. خوذة الفعاليات الملكية → 4,800 CPS

🏹 9. القوس الملكي الأسطوري → 8,000 CPS

🛡️ 10. درع ملكي فاخر → 7,200 CPS

🎖️ 11. شارة ملكية فخمة → 4,800 CPS

3️⃣ *الهدايا والمكافآت (نادرة جدًا)*

🎁 12. صندوق الحظ الملكي اليومي → 2,000 CPS

🏆 13. تذكرة دخول الفعاليات الكبرى → 4,800 CPS

🌌 14. ختم الأسطورة → 10,000 CPS

🪄 15. بطاقة سحرية ملكية → 7,200 CPS

4️⃣ *المميزات الخاصة (VIP للغاية)*

👑 16. أيقونة VIP للملف الشخصي → 7,500 CPS

💬 17. ميزة رسائل ملكية خاصة → 5,000 CPS

🌑 18. وضع باهت للعضو → 4,000 CPS

⚡ 19. إظهار فخم بالتوب الأسبوعي → 6,000 CPS

✨ 20. لقب ملكي مؤقت → 5,000 CPS

🧿 21. لون ملكي للكتابة → 4,000 CPS

5️⃣ *الممتلكات الافتراضية (أغلى الممتلكات)*

🏰 22. قصر شخصي داخل الريلم → 40,000 CPS

🏯 23. غرفة تدريب ملكية → 25,000 CPS

🛡️ 24. درع خاص للمشاركات → 20,000 CPS

🪞 25. مرآة الملوك → 15,000 CPS

🛋️ 26. صالة ملكية فخمة → 22,500 CPS

🎨 27. لوحة تذكارية ملكية → 12,500 CPS

━━━━━━━━━━━━━━━━━━

📌 *للشراء:* .متجر شراء رقم_المنتج

📌 *لتفاصيل:* .متجر منتج رقم

📌 *لتصفح قسم:* .متجر قسم الرقم

📌 *لمشترياتي:* .مشترياتي

╚════════════════════╝`;

                await sock.sendMessage(chatId, {

                    text: shopText,

                    mentions: [sender]

                }, { quoted: msg });

            }

            // ===============================

            // ℹ️ تفاصيل منتج

            // ===============================

            else if (args[0] === 'منتج' && args[1]) {

                const productId = parseInt(args[1]);

                let found = null;

                let category = '';

                // البحث في جميع الأقسام

                for (const [cat, items] of Object.entries(royalShop)) {

                    const item = items.find(p => p.id === productId);

                    if (item) {

                        found = item;

                        category = cat;

                        break;

                    }

                }

                if (!found) {

                    return sock.sendMessage(chatId, {

                        text: '❌ المنتج غير موجود'

                    }, { quoted: msg });

                }

                let details = `

*📦 تفاصيل المنتج #${found.id}*

*الاسم:* ${found.name}

*السعر:* ${found.price.toLocaleString()} CPS

`;

                if (found.cps > 0) {

                    details += `*يحوي:* +${found.cps} CPS\n`;

                }

                details += `

*الوصف:* ${found.desc}

`;

                if (found.benefits) {

                    details += `\n*المميزات:*\n${found.benefits.map(b => `  ${b}`).join('\n')}\n`;

                }

                if (found.effect) {

                    details += `\n*التأثير:* ${found.effect}\n`;

                }

                if (found.duration) {

                    details += `*المدة:* ${found.duration}\n`;

                }

                if (found.possible) {

                    details += `*الجوائز المحتملة:*\n  ${found.possible.join('\n  ')}\n`;

                }

                details += `\n━━━━━━━━━━━━━━\n📌 للشراء: .متجر شراء ${found.id}`;

                await sock.sendMessage(chatId, { text: details }, { quoted: msg });

            }

            // ===============================

            // 💰 شراء منتج

            // ===============================

            else if (args[0] === 'شراء' && args[1]) {

                const productId = parseInt(args[1]);

                let found = null;

                for (const category of Object.values(royalShop)) {

                    const item = category.find(p => p.id === productId);

                    if (item) {

                        found = item;

                        break;

                    }

                }

                if (!found) {

                    return sock.sendMessage(chatId, {

                        text: '❌ المنتج غير موجود'

                    }, { quoted: msg });

                }

                const userCPS = user.cps || 0;

                if (userCPS < found.price) {

                    const needed = found.price - userCPS;

                    return sock.sendMessage(chatId, {

                        text: `❌ رصيدك غير كافي!\nتحتاج ${needed.toLocaleString()} CPS إضافي`

                    }, { quoted: msg });

                }

                // خصم الرصيد

                user.cps = userCPS - found.price;

                

                // معالجة نوع المنتج

                let purchaseMsg = '';

                

                if (found.type === 'cps_booster') {

                    // إضافة CPS إضافية

                    user.cps += found.cps;

                    purchaseMsg = `💰 تمت إضافة ${found.cps} CPS إلى رصيدك!`;

                }

                else if (found.type === 'lucky_box') {

                    // صندوق الحظ - اختيار عشوائي

                    const random = getRandomInt(1, 100);

                    let reward = '';

                    

                    if (random <= 30) { // 30% CPS

                        const cpsGain = getRandomInt(200, 800);

                        user.cps += cpsGain;

                        reward = `🎉 ربحت ${cpsGain} CPS!`;

                    }

                    else if (random <= 60) { // 30% ذهب

                        const goldGain = getRandomInt(400, 2000);

                        user.gold = (user.gold || 0) + goldGain;

                        reward = `🎉 ربحت ${goldGain} ذهب!`;

                    }

                    else if (random <= 85) { // 25% أداة عادية

                        reward = `🎉 ربحت أداة نادرة!`;

                        // تخزين الأداة

                        const items = loadItems();

                        if (!items[sender]) items[sender] = [];

                        items[sender].push(`أداة نادرة من صندوق الحظ`);

                        saveItems(items);

                    }

                    else { // 15% أداة نادرة

                        reward = `🎉 ربحت أداة نادرة جداً!`;

                        const items = loadItems();

                        if (!items[sender]) items[sender] = [];

                        items[sender].push(`أداة أسطورية من صندوق الحظ`);

                        saveItems(items);

                    }

                    

                    purchaseMsg = `🎁 *صندوق الحظ*\n${reward}`;

                }

                else if (found.type === 'magic_card') {

                    // بطاقة سحرية

                    const random = getRandomInt(1, 3);

                    if (random === 1) {

                        user.cps += 1000;

                        purchaseMsg = `🪄 حصلت على 1000 CPS إضافية!`;

                    } else if (random === 2) {

                        user.cps += 2000;

                        purchaseMsg = `🪄 حصلت على 2000 CPS إضافية!`;

                    } else {

                        user.cps += 5000;

                        purchaseMsg = `🪄 حصلت على 5000 CPS إضافية!`;

                    }

                }

                else {

                    // منتج عادي - تخزين في المشتريات

                    const purchases = loadPurchases();

                    if (!purchases[sender]) purchases[sender] = [];

                    

                    purchases[sender].push({

                        id: found.id,

                        name: found.name,

                        purchasedAt: new Date().toISOString(),

                        type: found.type,

                        expiresAt: found.duration ? new Date(Date.now() + 30*24*60*60*1000).toISOString() : null

                    });

                    

                    savePurchases(purchases);

                    purchaseMsg = `✅ تم شراء ${found.name} بنجاح!`;

                }

                saveDB(db);

                const receipt = `

✅ *تم الشراء بنجاح!*
📦 ${found.name}
💰 المبلغ: ${found.price.toLocaleString()} CPS
💳 رصيدك الجديد: ${user.cps.toLocaleString()} CPS
${purchaseMsg}
━━━━━━━━━━━━━━
👑 *Eclipse Royal X*
شكراً لثقتك بالمملكة`;

                await sock.sendMessage(chatId, {

                    text: receipt,

                    mentions: [sender]

                }, { quoted: msg });

            }

            // ===============================

            // 📋 عرض مشترياتي

            // ===============================

            else if (args[0] === 'مشترياتي' || args[0] === 'myitems') {

                const purchases = loadPurchases();

                const items = loadItems();

                

                const userPurchases = purchases[sender] || [];

                const userItems = items[sender] || [];

                

                if (userPurchases.length === 0 && userItems.length === 0) {

                    return sock.sendMessage(chatId, {

                        text: '📭 لا توجد مشتريات أو عناصر لديك'

                    }, { quoted: msg });

                }

                let text = `*📦 مشتريات وعناصر @${sender.split('@')[0]}*\n\n`;

                

                if (userPurchases.length > 0) {

                    text += `*🛍️ المشتريات:*\n`;

                    userPurchases.forEach((p, i) => {

                        text += `${i+1}. ${p.name}\n`;

                        if (p.expiresAt) {

                            const expiry = new Date(p.expiresAt);

                            const now = new Date();

                            const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

                            text += `   ⏳ متبقي: ${daysLeft} يوم\n`;

                        }

                    });

                    text += `\n`;

                }

                

                if (userItems.length > 0) {

                    text += `*🎁 العناصر:*\n`;

                    userItems.forEach((item, i) => {

                        text += `${i+1}. ${item}\n`;

                    });

                }

                await sock.sendMessage(chatId, {

                    text,

                    mentions: [sender]

                }, { quoted: msg });

            }

        } catch (error) {

            console.error('خطأ في المتجر:', error);

            await extra.reply(`❌ خطأ: ${error.message}`);

        }

    }

};