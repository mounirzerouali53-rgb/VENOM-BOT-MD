const { loadDB, saveDB, getUserData } = require('../../lib/database');

const fs = require('fs');
const path = require('path');

// ملفات إضافية

const DAILY_FILE = path.join(__dirname, '../../database/daily.json');

const TRANSACTIONS_FILE = path.join(__dirname, '../../database/transactions.json');

// تحميل آخر مكافأة يومية

function loadDaily() {

    try {

        if (!fs.existsSync(DAILY_FILE)) return {};

        return JSON.parse(fs.readFileSync(DAILY_FILE));

    } catch {

        return {};

    }

}

function saveDaily(data) {

    try {

        fs.writeFileSync(DAILY_FILE, JSON.stringify(data, null, 2));

    } catch (error) {

        console.error('خطأ في حفظ اليومي:', error);

    }

}

// تحميل المعاملات

function loadTransactions() {

    try {

        if (!fs.existsSync(TRANSACTIONS_FILE)) return {};

        return JSON.parse(fs.readFileSync(TRANSACTIONS_FILE));

    } catch {

        return {};

    }

}

function saveTransactions(data) {

    try {

        fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(data, null, 2));

    } catch (error) {

        console.error('خطأ في حفظ المعاملات:', error);

    }

}

// ===============================

// 👑 نظام الرتب الملكية (محدث)

// ===============================

const ROYAL_RANKS = [

    { 

        level: 1,

        name: '⛓️ *مواطن*', 

        minCPS: 0, 

        maxCPS: 999,

        color: '⚫',

        dailyReward: 50,

        benefits: [

            '• راتب يومي: 50 CPS',

            '• استخدام الأوامر الأساسية',

            '• دخول المتجر'

        ],

        emoji: '🪓'

    },

    { 

        level: 2,

        name: '⚔️ *جندي مبتدئ*', 

        minCPS: 1000, 

        maxCPS: 4999,

        color: '🔵',

        dailyReward: 150,

        benefits: [

            '• راتب يومي: 150 CPS',

            '• المشاركة في الفعاليات',

            '• خصم 5% في المتجر'

        ],

        emoji: '🛡️'

    },

    { 

        level: 3,

        name: '🛡️ *محارب*', 

        minCPS: 5000, 

        maxCPS: 9999,

        color: '🟢',

        dailyReward: 300,

        benefits: [

            '• راتب يومي: 300 CPS',

            '• فتح قسم الأدوات الخاصة',

            '• خصم 10% في المتجر'

        ],

        emoji: '⚔️'

    },

    { 

        level: 4,

        name: '🏹 *فارس النبالة*', 

        minCPS: 10000, 

        maxCPS: 24999,

        color: '🟡',

        dailyReward: 600,

        benefits: [

            '• راتب يومي: 600 CPS',

            '• فتح قسم الهدايا',

            '• خصم 15% في المتجر',

            '• هدية أسبوعية'

        ],

        emoji: '🐎'

    },

    { 

        level: 5,

        name: '⚜️ *الأميرة/الأميرة*', 

        minCPS: 2500000, 

        maxCPS: 4999999,

        color: '⚜️',

        dailyReward: 1200,

        benefits: [

            '• راتب يومي: 1200 CPS',

            '• فتح قسم المميزات VIP',

            '• خصم 20% في المتجر',

            '• منشن الكل مرة بالأسبوع'

        ],

        emoji: '👑'

    },

    { 

        level: 6,

        name: '👑 *نائب اللورد*', 

        minCPS: 50000000, 

        maxCPS: 99999999,

        color: '👑',

        dailyReward: 2500,

        benefits: [

            '• راتب يومي: 2500 CPS',

            '• فتح الممتلكات الافتراضية',

            '• خصم 25% في المتجر',

            '• لون ذهبي للاسم',

            '• هدية أسبوعية مضاعفة'

        ],

        emoji: '🤴'

    },

    { 

        level: 7,

        name: '🏰 *الجنرال*', 

        minCPS: 100000000, 

        maxCPS: 249999999,

        color: '🏰',

        dailyReward: 5000,

        benefits: [

            '• راتب يومي: 5000 CPS',

            '• جميع أقسام المتجر مفتوحة',

            '• خصم 30% في المتجر',

            '• بث مباشر للأعضاء',

            '• هدية يومية مضاعفة'

        ],

        emoji: '⚖️'

    },

    { 

        level: 8,

        name: '⚡ *لورد*', 

        minCPS: 250000000, 

        maxCPS: 499999999,

        color: '⚡',

        dailyReward: 10000,

        benefits: [

            '• راتب يومي: 10000 CPS',

            '• خصم 35% في المتجر',

            '• منشن الكل بدون حدود',

            '• حماية من السرقة',

            '• عنصر نادر أسبوعياً'

        ],

        emoji: '📜'

    },

    { 

        level: 9,

        name: '🔥 *نائب الإمبراطور*', 

        minCPS: 500000000, 

        maxCPS: 999999999,

        color: '🔥',

        dailyReward: 20000,

        benefits: [

            '• راتب يومي: 20000 CPS',

            '• خصم 40% في المتجر',

            '• جميع ميزات المتجر مجاناً',

            '• اسم لامع',

            '• هدية يومية ×3'

        ],

        emoji: '💍'

    },

    { 

        level: 10,

        name: '👑✨ *Eclipse Royal*', 

        minCPS: 1000000000, 

        maxCPS: Infinity,

        color: '✨',

        dailyReward: 50000,

        benefits: [

            '• راتب يومي: 50000 CPS',

            '• خصم 50% في المتجر',

            '• جميع الصلاحيات المطلقة',

            '• صناعة القوانين',

            '• اسم ملون متحرك',

            '• هدية يومية ×5'

        ],

        emoji: '👑✨'

    }

];

module.exports = {

    name: 'نظام_العملات',

    aliases: ['عملات', 'cps', 'رصيد', 'economy'],

    category: 'economy',

    description: '💰 نظام العملات الملكي - Eclipse Royal X',

    // ===============================

    // 📊 حساب الرتبة

    // ===============================

    getRank(cps) {

        for (const rank of ROYAL_RANKS) {

            if (cps >= rank.minCPS && cps <= rank.maxCPS) {

                return rank;

            }

        }

        return ROYAL_RANKS[0]; // الرتبة الافتراضية

    },

    // ===============================

    // 📈 شريط التقدم

    // ===============================

    createProgressBar(percent, size = 10) {

        const filled = Math.floor(percent / (100 / size));

        const empty = size - filled;

        return '█'.repeat(filled) + '░'.repeat(empty);

    },

    // ===============================

    // 👤 عرض رصيدي

    // ===============================

    async showBalance(sock, chatId, message, targetId) {

        const db = loadDB();

        const user = getUserData(db, targetId);

        

        const cps = user.cps || 0;

        const gold = user.gold || 0;

        const diamonds = user.diamonds || 0;

        

        const currentRank = this.getRank(cps);

        

        // حساب التقدم للرتبة التالية

        let progress = 100;

        let nextRank = null;

        

        const currentIndex = ROYAL_RANKS.findIndex(r => r.level === currentRank.level);

        if (currentIndex < ROYAL_RANKS.length - 1) {

            nextRank = ROYAL_RANKS[currentIndex + 1];

            const range = nextRank.minCPS - currentRank.minCPS;

            const current = cps - currentRank.minCPS;

            progress = Math.min(100, Math.floor((current / range) * 100));

        }

        

        const progressBar = this.createProgressBar(progress);

        const response = `

╔═══〔 👑 *Eclipse Royal X* 〕═══╗
     *الحساب الملكي*
👤 @${targetId.split('@')[0]}
${currentRank.emoji} *الرتبة:* ${currentRank.name}
💳 *CPS:* ${cps.toLocaleString()}
💰 *ذهب:* ${gold.toLocaleString()}
💎 *ماس:* ${diamonds.toLocaleString()}
━━━━━━━━━━━━━━━━━━
*📊 التقدم للرتبة التالية:*
${progressBar} ${progress}%
${nextRank ? `⬆️ *الرتبة التالية:* ${nextRank.name}\n✨ *المطلوب:* ${(nextRank.minCPS - cps).toLocaleString()} CPS` : '🏆 *وصلت لأعلى رتبة!*'}
━━━━━━━━━━━━━━━━━━
*⚡ مميزات رتبتك:*
${currentRank.benefits.map(b => `  ${b}`).join('\n')}
📌 *راتبك اليومي:* ${currentRank.dailyReward.toLocaleString()} CPS
╚════════════════════╝`;

        await sock.sendMessage(chatId, {

            text: response,

            mentions: [targetId]

        }, { quoted: message });

    },

    // ===============================

    // 🎁 المكافأة اليومية

    // ===============================

    async daily(sock, chatId, message) {

        const sender = message.key.participant || message.key.remoteJid;

        const db = loadDB();

        const user = getUserData(db, sender);

        

        const daily = loadDaily();

        const now = Date.now();

        const oneDay = 24 * 60 * 60 * 1000;

        

        // التحقق من آخر مكافأة

        if (daily[sender] && (now - daily[sender]) < oneDay) {

            const timeLeft = oneDay - (now - daily[sender]);

            const hours = Math.floor(timeLeft / (60 * 60 * 1000));

            const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

            

            return sock.sendMessage(chatId, {

                text: `⏳ *المكافأة اليومية*\n\nانتظر ${hours} ساعة و ${minutes} دقيقة`

            }, { quoted: message });

        }

        

        // حساب الرتبة والمكافأة

        const cps = user.cps || 0;

        const currentRank = this.getRank(cps);

        const baseReward = currentRank.dailyReward;

        

        // مكافأة إضافية عشوائية

        const bonus = Math.floor(Math.random() * (baseReward * 0.2)); // حتى 20% bonus

        const totalReward = baseReward + bonus;

        

        // إضافة المكافأة

        user.cps = (user.cps || 0) + totalReward;

        

        // فرصة للحصول على هدية إضافية

        let extraGift = '';

        if (Math.random() < 0.1) { // 10% فرصة

            const extraCPS = Math.floor(totalReward * 0.5);

            user.cps += extraCPS;

            extraGift = `\n🎁 *هدية إضافية:* +${extraCPS} CPS`;

        }

        

        // حفظ التاريخ

        daily[sender] = now;

        saveDaily(daily);

        saveDB(db);

        

        const response = `

🎁 *المكافأة اليومية - Eclipse Royal X*
👑 @${sender.split('@')[0]}
📊 *رتبتك:* ${currentRank.name}
💰 *المكافأة الأساسية:* +${baseReward.toLocaleString()} CPS
✨ *مكافأة إضافية:* +${bonus.toLocaleString()} CPS
💳 *الإجمالي:* +${totalReward.toLocaleString()} CPS
${extraGift}
━━━━━━━━━━━━━━━━━━
💎 *رصيدك الجديد:* ${user.cps.toLocaleString()} CPS
تعال غداً لمكافأة جديدة! 👋`;
        await sock.sendMessage(chatId, {

            text: response,

            mentions: [sender]

        }, { quoted: message });

    },

    // ===============================

    // 💸 تحويل CPS

    // ===============================

    async transfer(sock, chatId, message, args) {

        const sender = message.key.participant || message.key.remoteJid;

        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;

        

        if (!mentioned || mentioned.length === 0) {

            return sock.sendMessage(chatId, {

                text: '❌ منشن المستخدم المرسل إليه'

            }, { quoted: message });

        }

        

        const receiver = mentioned[0];

        const amount = parseInt(args[1]);

        

        if (isNaN(amount) || amount <= 0) {

            return sock.sendMessage(chatId, {

                text: '❌ المبلغ غير صحيح'

            }, { quoted: message });

        }

        

        if (amount < 100) {

            return sock.sendMessage(chatId, {

                text: '❌ الحد الأدنى للتحويل 100 CPS'

            }, { quoted: message });

        }

        

        const db = loadDB();

        const senderData = getUserData(db, sender);

        const receiverData = getUserData(db, receiver);

        

        if ((senderData.cps || 0) < amount) {

            return sock.sendMessage(chatId, {

                text: `❌ رصيدك غير كافي!\nرصيدك: ${(senderData.cps || 0).toLocaleString()} CPS`

            }, { quoted: message });

        }

        

        // خصم رسوم التحويل (5%)

        const fee = Math.floor(amount * 0.05);

        const netAmount = amount - fee;

        

        senderData.cps = (senderData.cps || 0) - amount;

        receiverData.cps = (receiverData.cps || 0) + netAmount;

        

        // تسجيل المعاملة

        const transactions = loadTransactions();

        if (!transactions[chatId]) transactions[chatId] = [];

        transactions[chatId].push({

            from: sender,

            to: receiver,

            amount: amount,

            netAmount: netAmount,

            fee: fee,

            date: new Date().toISOString()

        });

        saveTransactions(transactions);

        

        saveDB(db);

        

        const response = `

✅ *تم التحويل بنجاح*
📤 *من:* @${sender.split('@')[0]}
📥 *إلى:* @${receiver.split('@')[0]}
💰 *المبلغ:* ${amount.toLocaleString()} CPS
📦 *المستلم:* ${netAmount.toLocaleString()} CPS
💸 *الرسوم (5%):* ${fee.toLocaleString()} CPS
━━━━━━━━━━━━━━━━━━
💳 *رصيدك الجديد:* ${senderData.cps.toLocaleString()} CPS`;

        await sock.sendMessage(chatId, {

            text: response,

            mentions: [sender, receiver]

        }, { quoted: message });

    },

    // ===============================

    // 🏆 قائمة الأغنياء

    // ===============================

    async leaderboard(sock, chatId, message) {

        const db = loadDB();

        const users = db.users || {};

        

        // تحويل إلى مصفوفة وترتيب حسب CPS

        const leaderboard = Object.entries(users)

            .map(([jid, data]) => ({

                jid,

                cps: data.cps || 0,

                gold: data.gold || 0

            }))

            .filter(u => u.cps > 0)

            .sort((a, b) => b.cps - a.cps)

            .slice(0, 10);

        

        if (leaderboard.length === 0) {

            return sock.sendMessage(chatId, {

                text: '📊 لا يوجد أغنياء بعد'

            }, { quoted: message });

        }

        

        let text = `

╔═══〔 🏆 *أغنياء Eclipse Royal X* 〕═══╗
     *أصحاب الثروات العظيمة*
━━━━━━━━━━━━━━━━━━

`;

        leaderboard.forEach((user, index) => {

            const rank = this.getRank(user.cps);

            let medal = '';
            if (index === 0) medal = '👑';
            else if (index === 1) medal = '⚜️';
            else if (index === 2) medal = '🥉';
            else medal = `${index + 1}.`;

            

            text += `${medal} @${user.jid.split('@')[0]}\n`;
            text += `   💳 ${user.cps.toLocaleString()} CPS | ${rank.emoji} ${rank.name}\n\n`;
        });
        text += `╚════════════════════╝`;

        await sock.sendMessage(chatId, {

            text,

            mentions: leaderboard.map(u => u.jid)

        }, { quoted: message });

    },

    // ===============================

    // 📊 إحصائياتي

    // ===============================

    async stats(sock, chatId, message) {

        const sender = message.key.participant || message.key.remoteJid;

        const db = loadDB();

        const user = getUserData(db, sender);

        

        const transactions = loadTransactions();

        const userTransactions = [];

        

        // جمع معاملات المستخدم

        for (const [group, transList] of Object.entries(transactions)) {

            transList.forEach(t => {

                if (t.from === sender || t.to === sender) {

                    userTransactions.push(t);

                }

            });

        }

        

        // إحصائيات

        const sent = userTransactions.filter(t => t.from === sender).length;

        const received = userTransactions.filter(t => t.to === sender).length;

        const totalSent = userTransactions

            .filter(t => t.from === sender)

            .reduce((sum, t) => sum + t.amount, 0);

        const totalReceived = userTransactions

            .filter(t => t.to === sender)

            .reduce((sum, t) => sum + t.netAmount, 0);

        

        const currentRank = this.getRank(user.cps || 0);

        

        const response = `

╔═══〔 📊 *إحصائياتك المالية* 〕═══╗
     *Eclipse Royal X*
👤 @${sender.split('@')[0]}
${currentRank.emoji} *الرتبة:* ${currentRank.name}
💳 *الرصيد الحالي:* ${(user.cps || 0).toLocaleString()} CPS
💰 *الذهب:* ${(user.gold || 0).toLocaleString()}
💎 *الماس:* ${(user.diamonds || 0).toLocaleString()}
━━━━━━━━━━━━━━━━━━
*📈 إحصائيات التحويل:*
📤 *حولت:* ${sent} مرة
📥 *استلمت:* ${received} مرة
💸 *أرسلت:* ${totalSent.toLocaleString()} CPS
💵 *استلمت:* ${totalReceived.toLocaleString()} CPS
━━━━━━━━━━━━━━━━━━
*🎁 المكافآت:*
📅 *آخر مكافأة:* ${user.lastDaily ? new Date(user.lastDaily).toLocaleDateString('ar-EG') : 'لم تستلم بعد'}
⭐ *نقاط التفاعل:* ${user.interaction || 0}
╚════════════════════╝`;

        await sock.sendMessage(chatId, {

            text: response,

            mentions: [sender]

        }, { quoted: message });

    },

 // ===============================
// 💰 إضافة رصيد (للمشرفين فقط) - المعدلة
// ===============================
async addCPS(sock, chatId, msg, args, extra) {  // ✅ استقبل extra
    try {
        // ✅ استخدم extra.isAdmin مباشرة (الموجود في handler)
        if (!extra.isAdmin && !extra.isOwner) {
            return sock.sendMessage(chatId, {
                text: '❌ هذا الأمر للمشرفين فقط'
            }, { quoted: msg });
        }

        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
        if (!mentioned || mentioned.length === 0) {
            return sock.sendMessage(chatId, {
                text: '⚠️ منشن العضو المطلوب'
            }, { quoted: msg });
        }

        const target = mentioned[0];
        const amount = parseInt(args[1]);  // args[1] لأن args[0] هو كلمة 'اضافة'

        if (isNaN(amount) || amount <= 0) {
            return sock.sendMessage(chatId, {
                text: '❌ المبلغ غير صحيح'
            }, { quoted: msg });
        }

        const db = loadDB();
        const user = getUserData(db, target);
        user.cps = (user.cps || 0) + amount;
        saveDB(db);

        await sock.sendMessage(chatId, {
            text: `✅ *تمت الإضافة*\n\n👤 @${target.split('@')[0]}\n💰 +${amount.toLocaleString()} CPS\n💳 الرصيد الجديد: ${user.cps.toLocaleString()} CPS`,
            mentions: [target]
        }, { quoted: msg });

    } catch (error) {
        console.error('خطأ في الإضافة:', error);
        await sock.sendMessage(chatId, {
            text: `❌ خطأ: ${error.message}`
        }, { quoted: msg });
    }
},

// ===============================
// 🏦 الدالة الرئيسية - المعدلة
// ===============================
async execute(sock, msg, args, extra) {
    const chatId = extra.from;
    const sender = msg.key.participant || msg.key.remoteJid;
    const targetId = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || sender;
    const command = args[0]?.toLowerCase();

    try {
        if (!args[0] || command === 'رصيدي' || command === 'balance') {
            await this.showBalance(sock, chatId, msg, sender);
        }
        else if (command === 'رصيد' || command === 'bal') {
            await this.showBalance(sock, chatId, msg, targetId);
        }
        else if (command === 'يومي' || command === 'daily') {
            await this.daily(sock, chatId, msg);
        }
        else if (command === 'تحويل' || command === 'transfer') {
            await this.transfer(sock, chatId, msg, args);
        }
        else if (command === 'توب' || command === 'leaderboard' || command === 'اغنياء') {
            await this.leaderboard(sock, chatId, msg);
        }
        else if (command === 'احصائياتي' || command === 'stats') {
            await this.stats(sock, chatId, msg);
        }
        else if (command === 'اضافة' || command === 'add') {
            await this.addCPS(sock, chatId, msg, args, extra);  // ✅ مرر extra
        }
        else {
            await this.showBalance(sock, chatId, msg, sender);
        }
    } catch (error) {
        console.error('خطأ في نظام العملات:', error);
        await extra.reply(`❌ خطأ: ${error.message}`);
    }
}
};
