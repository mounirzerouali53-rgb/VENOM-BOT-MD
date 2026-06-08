const { loadDB, saveDB, getUserData } = require('../../lib/database');

module.exports = {

    name: 'صرف',

    aliases: ['exchange', 'تحويل', 'صرف_عملات'],

    category: 'economy',

    description: '💱 صرف CPS إلى ذهب وماس',

    async execute(sock, msg, args, extra) {

        try {

            const chatId = extra.from;

            const sender = msg.key.participant || msg.key.remoteJid;

            const db = loadDB();

            const user = getUserData(db, sender);

            // ===============================

            // 📊 أسعار الصرف الثابتة

            // ===============================

            const exchangeRates = {

                cpsToGold: 1,      // 1 CPS = 1 ذهب

                cpsToDiamond: 100,  // 100 CPS = 1 ماس

                goldToCps: 1,       // 1 ذهب = 1 CPS

                diamondToCps: 100   // 1 ماس = 100 CPS

            };

            // ===============================

            // 📋 عرض أسعار الصرف

            // ===============================

            if (!args[0] || args[0] === 'سعر' || args[0] === 'اسعار') {

                const userCPS = user.cps || 0;

                const userGold = user.gold || 0;

                const userDiamonds = user.diamonds || 0;

                const priceList = `

╔═══〔 💱 *صرف العملات الملكي* 〕═══╗
     *Eclipse Royal X*
👑 @${sender.split('@')[0]}
━━━━━━━━━━━━━━━━━━
*💰 رصيدك الحالي:*
💳 CPS: ${userCPS.toLocaleString()}
🥇 ذهب: ${userGold.toLocaleString()}
💎 ماس: ${userDiamonds.toLocaleString()}
━━━━━━━━━━━━━━━━━━
*📊 أسعار الصرف:*
💳 *CPS → 🥇 ذهب*
1 CPS = 1 ذهب
💳 *CPS → 💎 ماس*
100 CPS = 1 ماس
🥇 *ذهب → 💳 CPS*
1 ذهب = 1 CPS
💎 *ماس → 💳 CPS*
1 ماس = 100 CPS
━━━━━━━━━━━━━━━━━━
📌 *أوامر الصرف:*
• .صرف cps_gold 500   (CPS → ذهب)
• .صرف cps_diamond 200 (CPS → ماس)
• .صرف gold_cps 300    (ذهب → CPS)
• .صرف diamond_cps 2   (ماس → CPS)
╚════════════════════╝`;

                await sock.sendMessage(chatId, {

                    text: priceList,

                    mentions: [sender]

                }, { quoted: msg });

                return;

            }

            // ===============================

            // 🔄 تنفيذ عملية الصرف

            // ===============================

            const operation = args[0].toLowerCase();

            const amount = parseInt(args[1]);

            // التحقق من صحة المبلغ

            if (isNaN(amount) || amount <= 0) {

                return sock.sendMessage(chatId, {

                    text: '❌ المبلغ غير صحيح'

                }, { quoted: msg });

            }

            // ===============================

            // 1️⃣ CPS → ذهب

            // ===============================

            if (operation === 'cps_gold' || operation === 'cps_ذهب') {

                const userCPS = user.cps || 0;

                

                if (userCPS < amount) {

                    return sock.sendMessage(chatId, {

                        text: `❌ رصيدك من CPS غير كافي!\n💳 لديك: ${userCPS.toLocaleString()} CPS`

                    }, { quoted: msg });

                }

                // تنفيذ الصرف

                user.cps = userCPS - amount;

                user.gold = (user.gold || 0) + amount;

                saveDB(db);

                const result = `
✅ *تم الصرف بنجاح!*
💳 *المبلغ المصروف:* ${amount.toLocaleString()} CPS
🥇 *ذهب مستلم:* ${amount.toLocaleString()}
━━━━━━━━━━━━━━━━━━
💳 *CPS المتبقي:* ${user.cps.toLocaleString()}
🥇 *الذهب الحالي:* ${user.gold.toLocaleString()}`;

                await sock.sendMessage(chatId, {

                    text: result,

                    mentions: [sender]

                }, { quoted: msg });

            }

            // ===============================

            // 2️⃣ CPS → ماس

            // ===============================

            else if (operation === 'cps_diamond' || operation === 'cps_ماس') {

                const userCPS = user.cps || 0;

                const requiredCPS = amount * exchangeRates.cpsToDiamond; // amount ماس المطلوب

                if (userCPS < requiredCPS) {

                    return sock.sendMessage(chatId, {

                        text: `❌ رصيدك من CPS غير كافي!\n💳 تحتاج: ${requiredCPS.toLocaleString()} CPS\n💳 لديك: ${userCPS.toLocaleString()} CPS`

                    }, { quoted: msg });

                }

                // تنفيذ الصرف

                user.cps = userCPS - requiredCPS;

                user.diamonds = (user.diamonds || 0) + amount;

                saveDB(db);

                const result = `

✅ *تم الصرف بنجاح!*
💳 *المبلغ المصروف:* ${requiredCPS.toLocaleString()} CPS
💎 *ماس مستلم:* ${amount.toLocaleString()}
━━━━━━━━━━━━━━━━━━
💳 *CPS المتبقي:* ${user.cps.toLocaleString()}
💎 *الماس الحالي:* ${user.diamonds.toLocaleString()}`;

                await sock.sendMessage(chatId, {

                    text: result,

                    mentions: [sender]

                }, { quoted: msg });

            }

            // ===============================

            // 3️⃣ ذهب → CPS

            // ===============================

            else if (operation === 'gold_cps' || operation === 'ذهب_cps') {

                const userGold = user.gold || 0;

                

                if (userGold < amount) {

                    return sock.sendMessage(chatId, {

                        text: `❌ رصيدك من الذهب غير كافي!\n🥇 لديك: ${userGold.toLocaleString()} ذهب`

                    }, { quoted: msg });

                }

                // تنفيذ الصرف

                user.gold = userGold - amount;

                user.cps = (user.cps || 0) + amount;

                saveDB(db);

                const result = `
✅ *تم الصرف بنجاح!*
🥇 *المبلغ المصروف:* ${amount.toLocaleString()} ذهب
💳 *CPS مستلم:* ${amount.toLocaleString()}
━━━━━━━━━━━━━━━━━━
🥇 *الذهب المتبقي:* ${user.gold.toLocaleString()}
💳 *CPS الحالي:* ${user.cps.toLocaleString()}`;

                await sock.sendMessage(chatId, {

                    text: result,

                    mentions: [sender]

                }, { quoted: msg });

            }

            // ===============================

            // 4️⃣ ماس → CPS

            // ===============================

            else if (operation === 'diamond_cps' || operation === 'ماس_cps') {

                const userDiamonds = user.diamonds || 0;

                

                if (userDiamonds < amount) {

                    return sock.sendMessage(chatId, {

                        text: `❌ رصيدك من الماس غير كافي!\n💎 لديك: ${userDiamonds.toLocaleString()} ماس`

                    }, { quoted: msg });

                }

                const cpsGain = amount * exchangeRates.diamondToCps;

                // تنفيذ الصرف

                user.diamonds = userDiamonds - amount;

                user.cps = (user.cps || 0) + cpsGain;

                saveDB(db);

                const result = `

✅ *تم الصرف بنجاح!*
💎 *المبلغ المصروف:* ${amount.toLocaleString()} ماس
💳 *CPS مستلم:* ${cpsGain.toLocaleString()}
━━━━━━━━━━━━━━━━━━
💎 *الماس المتبقي:* ${user.diamonds.toLocaleString()}
💳 *CPS الحالي:* ${user.cps.toLocaleString()}`;

                await sock.sendMessage(chatId, {

                    text: result,

                    mentions: [sender]

                }, { quoted: msg });

            }

            // ===============================

            // ❌ عملية غير معروفة

            // ===============================

            else {

                await sock.sendMessage(chatId, {

                    text: `❌ عملية غير معروفة!\n\n📌 *الأوامر المتاحة:*\n• .صرف cps_gold 500\n• .صرف cps_diamond 200\n• .صرف gold_cps 300\n• .صرف diamond_cps 2`

                }, { quoted: msg });

            }

        } catch (error) {

            console.error('خطأ في أمر الصرف:', error);

            await extra.reply(`❌ خطأ: ${error.message}`);

        }

    }

};