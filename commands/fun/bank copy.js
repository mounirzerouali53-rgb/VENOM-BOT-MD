const fs = require('fs');
const path = require('path');
const settings = require('../../config');

// ===============================
// 📂 مسار قاعدة البيانات الموحدة
// ===============================
const WALLETS_PATH = path.join(__dirname, '../../database/wallets.json');

// ===============================
// 📂 دوال تحميل وحفظ البيانات
// ===============================
function loadWallets() {
    try {
        if (!fs.existsSync(WALLETS_PATH)) {
            const initialData = { users: {} };
            fs.writeFileSync(WALLETS_PATH, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        return JSON.parse(fs.readFileSync(WALLETS_PATH));
    } catch (error) {
        console.error('خطأ في تحميل المحافظ:', error);
        return { users: {} };
    }
}

function saveWallets(data) {
    try {
        fs.writeFileSync(WALLETS_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('خطأ في حفظ المحافظ:', error);
    }
}

// ===============================
// 📂 دوال مساعدة
// ===============================
function getUserData(db, userId) {
    try {
        if (!userId) {
            return {
                diamonds: 0, gold: 0, silver: 0, bronze: 0,
                cash: 0, bank: 0, crypto: 0, rank: "مبتدئ"
            };
        }
        const cleanUserId = userId.split(':')[0];
        if (!db.users[cleanUserId]) {
            db.users[cleanUserId] = {
                diamonds: 0, gold: 0, silver: 0, bronze: 0,
                cash: 0, bank: 0, crypto: 0, rank: "مبتدئ"
            };
        }
        return db.users[cleanUserId];
    } catch (error) {
        console.error('خطأ في getUserData:', error);
        return {
            diamonds: 0, gold: 0, silver: 0, bronze: 0,
            cash: 0, bank: 0, crypto: 0, rank: "مبتدئ"
        };
    }
}

function getContextId(message) {
    const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;
    const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    return quotedParticipant || mentionedJid || null;
}

function formatNumber(num) {
    return num?.toLocaleString() || "0";
}

module.exports = {
    name: 'بنك',
    aliases: ['bank', 'رصيد', 'محفظة', 'كريدت'],
    category: 'economy',
    description: 'النظام البنكي الموحد',

    // ===============================
    // 💰 عرض الرصيد (النمط الرئيسي)
    // ===============================
    async showWallet(sock, chatId, message, targetId) {
        try {
            const db = loadWallets();
            const cleanTarget = targetId.split(':')[0];
            const user = getUserData(db, cleanTarget);

            const response = `
*╔═❖═•̩̩͙VENOM 𝑩𝒐𝒕 ⛩️ 𝐁𝐀𝐍𝐊•̩̩͙═❖═╗*
_┃ 🏦    *بـنـك الـمـركـزي* 🏦_
┃ 👤 المستخدم: @${cleanTarget.split("@")[0]}
┃ 💳 الرتبة: ${user.rank || "مبتدئ"}
┃
┃ 💎 ألـمـاس: ${formatNumber(user.diamonds)}
┃ 🥇 ذهـب: ${formatNumber(user.gold)}
┃ 🥈 فـضـة: ${formatNumber(user.silver)}
┃ 🥉 بـرونـز: ${formatNumber(user.bronze)}
┃
┃ 💵 كـاش: ${formatNumber(user.cash)}
┃ 💰 سـبـائك: ${formatNumber(user.bank)}
┃ 🪙 عمـلات: ${user.crypto || 0} BTC
┃ ━━━━━━━━━━━━━━━
┃ 🛠️ أرسل [ تحويل ] لنقل الأموال
┃ 🛒 أرسل [ متجر ] لشراء الممتلكات
*╚═❖═•̩̩͙VENOM 𝑩𝒐𝒕 ⛩️•̩̩͙═❖═╝*
`;

            await sock.sendMessage(chatId, {
                text: response,
                mentions: [cleanTarget]
            }, { quoted: message });

        } catch (error) {
            console.error('خطأ في showWallet:', error);
            await sock.sendMessage(chatId, {
                text: '❌ حدث خطأ في عرض الرصيد'
            }, { quoted: message });
        }
    },

    // ===============================
    // 💰 إضافة رصيد (للمالك فقط)
    // ===============================
    async addGold(sock, chatId, message, amount) {
        try {
            const senderJid = message.key.participant || message.key.remoteJid;
            const ownerJid = settings.ownerNumber + '@s.whatsapp.net';
            const isOwner = message.key.fromMe || senderJid === ownerJid;

            if (!isOwner) {
                return await sock.sendMessage(chatId, { 
                    text: `*❌ تباً لك.. فقط "إمبراطور الكيان" 𝖁𝕰𝕹𝕺𝕸 يمكنه التحكم بالخزينة!*` 
                }, { quoted: message });
            }

            const targetId = getContextId(message);

            if (!targetId || isNaN(amount) || amount <= 0) {
                return await sock.sendMessage(chatId, { 
                    text: '⚠️ *يـجـب اﻟـﺮد عـلـى اﻟـﻌـﻀـﻮ أو مـﻨـﺸـن حـسـابـه مـع كـتـابة اﻟـﻤـﺒـلـغ!*' 
                }, { quoted: message });
            }

            const wallets = loadWallets();
            const cleanTarget = targetId.split(':')[0];
            const user = getUserData(wallets, cleanTarget);
            user.gold += amount;
            saveWallets(wallets);

            const response = `
*┏━━━༻✨༺━━━┓*
> *𓆩〄║ 𝐄𝐂𝐋𝐈𝐏𝐒𝐄↓〄 𓆪*
*┗━━━༻✨༺━━━┛*

*📦 تـم إيـداع اﻟـﺬﻫـﺐ*
*👤 لـلـنـخـبـة:* @${targetId.split('@')[0]}
*💰 اﻟـﻤـﺒـﻠـغ:* *+${amount}* ذهب
*🛡️ اﻟـﺮﺻـﻴـيد الجديد:* *${user.gold}* ذهب`;

            await sock.sendMessage(chatId, {
                text: response,
                mentions: [targetId]
            }, { quoted: message });

        } catch (error) {
            console.error('خطأ في addGold:', error);
        }
    },

    // ===============================
    // 💰 أغنى الأعضاء
    // ===============================
    async showTop(sock, chatId, message) {
        try {
            if (!chatId.endsWith('@g.us')) return;

            const wallets = loadWallets();
            const groupMembers = [];

            // جمع أعضاء المجموعة
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants.map(p => p.id);

            participants.forEach(jid => {
                if (wallets.users[jid]) {
                    groupMembers.push({
                        jid: jid,
                        gold: wallets.users[jid].gold || 0
                    });
                }
            });

            // ترتيب تنازلي
            const sorted = groupMembers
                .sort((a, b) => b.gold - a.gold)
                .slice(0, 5);

            if (sorted.length === 0) {
                return await sock.sendMessage(chatId, { 
                    text: '⚠️ *لا يوجد أعضاء لديهم رصيد بعد.*' 
                }, { quoted: message });
            }

            let topMsg = `
*╔═══〔 👑 أغنى الأعضاء 〕═══╗*\n`;

            sorted.forEach((member, index) => {
                topMsg += `*${index + 1}.* @${member.jid.split('@')[0]} › 💰 ${member.gold} ذهب\n`;
            });

            topMsg += `\n*╚══════════════════╝*`;

            await sock.sendMessage(chatId, {
                text: topMsg,
                mentions: sorted.map(m => m.jid)
            }, { quoted: message });

        } catch (error) {
            console.error('خطأ في showTop:', error);
        }
    },

    // ===============================
    // 💰 تحويل الأموال
    // ===============================
    async transfer(sock, chatId, message, args) {
        try {
            const sender = message.key.participant || message.key.remoteJid;
            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;

            if (!mentioned || mentioned.length === 0) {
                return await sock.sendMessage(chatId, {
                    text: "❌ يرجى منشن المستخدم المرسل له"
                }, { quoted: message });
            }

            const receiver = mentioned[0];
            const amount = parseInt(args[1]);

            if (isNaN(amount) || amount <= 0) {
                return await sock.sendMessage(chatId, {
                    text: "❌ المبلغ غير صحيح"
                }, { quoted: message });
            }

            const wallets = loadWallets();
            const senderData = getUserData(wallets, sender);
            const receiverData = getUserData(wallets, receiver);

            if (senderData.gold < amount) {
                return await sock.sendMessage(chatId, {
                    text: `❌ رصيدك غير كافٍ!\nرصيدك الحالي: ${senderData.gold} ذهب`
                }, { quoted: message });
            }

            senderData.gold -= amount;
            receiverData.gold += amount;
            saveWallets(wallets);

            await sock.sendMessage(chatId, {
                text: `✅ تم التحويل بنجاح!\n\n📤 المحول: @${sender.split("@")[0]}\n📥 المستلم: @${receiver.split("@")[0]}\n💰 المبلغ: ${amount} ذهب`,
                mentions: [sender, receiver]
            }, { quoted: message });

        } catch (error) {
            console.error('خطأ في التحويل:', error);
            await sock.sendMessage(chatId, {
                text: `❌ حدث خطأ: ${error.message}`
            }, { quoted: message });
        }
    },

    // ===============================
    // 💰 عرض الرصيد (بالصيغة القديمة للتوافق)
    // ===============================
    async showLegacyBalance(sock, chatId, message, targetId) {
        try {
            if (!chatId.endsWith('@g.us')) return;

            const wallets = loadWallets();
            const cleanTarget = targetId.split(':')[0];
            const user = getUserData(wallets, cleanTarget);

            const response = `
*┏━━━༻🏦༺━━━┓*
> *𓆩〄║𝐄𝐂𝐋𝐈𝐏𝐒𝐄↓〄 𓆪*
*┗━━━༻🏦༺━━━┛*

*👤 اﻟـﻤـﺴـﺘـﻌـﻠـﻢ:* @${targetId.split('@')[0]}
*💰 اﻟـﺮﺻـﻴـيد:* *${user.gold}* ذهب
*💎 اﻟـﻤـﺎس:* *${user.diamonds}*

*─── { 🛡️ } ───*
*⚖️ بـنـك اﻟـنـخـبـة الموحد*`;

            await sock.sendMessage(chatId, {
                text: response,
                mentions: [targetId]
            }, { quoted: message });

        } catch (error) {
            console.error('خطأ في showLegacyBalance:', error);
        }
    },

    // ===============================
    // 🏦 الدالة الرئيسية
    // ===============================
    async execute(sock, msg, args, extra) {
        try {
            const chatId = extra.from;
            const sender = msg.key.participant || msg.key.remoteJid;
            const targetId = getContextId(msg) || sender;
            const command = args[0]?.toLowerCase();

            // أوامر فرعية
            if (command === 'add' || command === 'اضف' || command === 'اعط') {
                const amount = parseInt(args[1]);
                await this.addGold(sock, chatId, msg, amount);
            } 
            else if (command === 'top' || command === 'اعلى' || command === 'أغنى' || command === 'توب') {
                await this.showTop(sock, chatId, msg);
            }
            else if (command === 'تحويل' || command === 'حول' || command === 'send' || command === 'transfer') {
                await this.transfer(sock, chatId, msg, args);
            }
            else if (command === 'قديم' || command === 'old') {
                await this.showLegacyBalance(sock, chatId, msg, targetId);
            }
            else {
                // العرض الرئيسي
                await this.showWallet(sock, chatId, msg, targetId);
            }

        } catch (error) {
            console.error('خطأ في أمر البنك:', error);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `❌ حدث خطأ: ${error.message}`
            }, { quoted: msg });
        }
    }
};