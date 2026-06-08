const database = require('../../database');

// تخزين المكتمين
let mutedUsers = {};

// دالة التحقق من مكتوم (هذه تعمل بشكل صحيح)
const checkMuted = async (sock, msg) => {
    try {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;
        if (msg.key.fromMe) return;
        
        const sender = msg.key.participant || msg.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        
        if (mutedUsers[from] && mutedUsers[from][senderNumber]) {
            const muteData = mutedUsers[from][senderNumber];
            
            if (muteData.until && muteData.until < Date.now()) {
                delete mutedUsers[from][senderNumber];
                return;
            }
            
            await sock.sendMessage(from, { delete: msg.key });
            
            if (!muteData.lastWarning || Date.now() - muteData.lastWarning > 30000) {
                mutedUsers[from][senderNumber].lastWarning = Date.now();
                
                let durationText = '';
                if (muteData.until) {
                    const remaining = Math.ceil((muteData.until - Date.now()) / 60000);
                    durationText = `\n⏰ المتبقي: ${remaining} دقيقة`;
                }
                
                // هذه تعمل بشكل صحيح
                await sock.sendMessage(from, {
                    text: `🔇 *مكتوم* 🔇\n@${senderNumber} لا يمكنك التكلم${durationText}`,
                    mentions: [sender]
                });
            }
        }
    } catch (e) {}
};

// دالة كتم عضو
const muteUser = async (from, userId, duration, reason, adminName) => {
    const userNumber = userId.split('@')[0];
    
    if (!mutedUsers[from]) mutedUsers[from] = {};
    
    let until = null;
    let durationText = 'دائم';
    
    if (duration && duration > 0) {
        until = Date.now() + (duration * 60 * 1000);
        durationText = `${duration} دقيقة`;
    }
    
    mutedUsers[from][userNumber] = {
        mutedAt: Date.now(),
        until: until,
        reason: reason || 'بدون سبب',
        mutedBy: adminName || 'أدمن'
    };
    
    return { userNumber, durationText };
};

// دالة فك الكتم
const unmuteUser = (from, userId) => {
    const userNumber = userId.split('@')[0];
    
    if (mutedUsers[from] && mutedUsers[from][userNumber]) {
        delete mutedUsers[from][userNumber];
        return true;
    }
    return false;
};

// دالة قائمة المكتمين
const getMutedList = (from) => {
    if (!mutedUsers[from]) return [];
    
    const list = [];
    const now = Date.now();
    
    for (const [userId, data] of Object.entries(mutedUsers[from])) {
        const isExpired = data.until && data.until < now;
        if (!isExpired) {
            let remaining = 'دائم';
            if (data.until) {
                const minutes = Math.ceil((data.until - now) / 60000);
                remaining = `${minutes} دقيقة`;
            }
            
            list.push({
                userId,
                remaining,
                reason: data.reason,
                mutedBy: data.mutedBy
            });
        } else if (isExpired) {
            delete mutedUsers[from][userId];
        }
    }
    
    return list;
};

// الأمر الرئيسي
module.exports = {
    name: 'كتم',
    aliases: ['mute', 'silence'],
    category: 'admin',
    description: 'كتم عضو أو فك الكتم أو عرض المكتمين',
    usage: '.كتم <@مستخدم> [المدة] [السبب] | .كتم فك @مستخدم | .كتم قائمة',
    groupOnly: true,
    adminOnly: true,
    botAdminNeeded: false,

    async execute(sock, msg, args, extra) {
        const { from, reply, sender } = extra;
        
        // ========== SUBCOMMAND: قائمة ==========
        // ========== SUBCOMMAND: قائمة ==========
if (args[0] === 'قائمة' || args[0] === 'list') {
    const mutedList = getMutedList(from);
    
    if (mutedList.length === 0) {
        return reply('📋 *لا يوجد أعضاء مكتمين في المجموعة*');
    }
    
    let listText = `🔇 *قائمة المكتمين* 🔇\n\n`;
    const mentions = [];
    
    for (let i = 0; i < mutedList.length; i++) {
        const m = mutedList[i];
        const mentionJid = `${m.userId}@s.whatsapp.net`;
        mentions.push(mentionJid);
        // ⚠️ مهم: لا تضع @ أمام الرقم هنا
        listText += `${i + 1}️⃣ ${m.userId}\n`;
        listText += `   📝 ${m.reason}\n`;
        listText += `   ⏰ متبقي: ${m.remaining}\n`;
        listText += `   👮 بواسطة: ${m.mutedBy}\n\n`;
    }
    
    listText += `📊 *الإجمالي:* ${mutedList.length} عضو`;
    
    // استخدام sock.sendMessage مباشرة
    return await sock.sendMessage(from, {
        text: listText,
        mentions: mentions
    }, { quoted: msg });
}
        
        // ========== SUBCOMMAND: فك ==========
        if (args[0] === 'فك' || args[0] === 'unmute') {
            if (args.length < 2) {
                return reply('⚠️ *طريقة الاستخدام:*\n.كتم فك @مستخدم');
            }
            
            const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            let targetUser = mentionedJid;
            
            if (!targetUser && args[1]) {
                const numberMatch = args[1].match(/(\d{10,15})/);
                if (numberMatch) {
                    targetUser = `${numberMatch[1]}@s.whatsapp.net`;
                }
            }
            
            if (!targetUser) {
                return reply('⚠️ *قم بمنشن العضو*\nمثال: .كتم فك @مستخدم');
            }
            
            const targetNumber = targetUser.split('@')[0];
            
            if (unmuteUser(from, targetUser)) {
                return reply(`✅ *تم فك الكتم عن* @${targetNumber}`, { mentions: [targetUser] });
            } else {
                return reply(`❌ *العضو* @${targetNumber} *ليس مكتوماً*`, { mentions: [targetUser] });
            }
        }
        
        // ========== MAIN COMMAND: كتم عضو ==========
        // استخراج المنشن من الرسالة
        let targetUser = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        
        // إذا لم يوجد منشن، جرب من الرسالة المقتبسة
        if (!targetUser) {
            const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quotedMsg && quotedMsg.key && quotedMsg.key.participant) {
                targetUser = quotedMsg.key.participant;
            }
        }
        
        // إذا لم يوجد، جرب استخراج الرقم من النص
        if (!targetUser && args[0]) {
            const numberMatch = args[0].match(/(\d{10,15})/);
            if (numberMatch) {
                targetUser = `${numberMatch[1]}@s.whatsapp.net`;
            }
        }
        
        if (!targetUser) {
            return reply(
                `⚠️ *طريقة الاستخدام:*\n\n` +
                `📌 *كتم عضو:*\n` +
                `  .كتم @مستخدم [المدة] [السبب]\n\n` +
                `📌 *فك الكتم:*\n` +
                `  .كتم فك @مستخدم\n\n` +
                `📌 *قائمة المكتمين:*\n` +
                `  .كتم قائمة\n\n` +
                `📖 *أمثلة:*\n` +
                `  • .كتم @user 5 سبام\n` +
                `  • .كتم @user 30 شتم\n` +
                `  • .كتم @user دائم\n` +
                `  • .كتم فك @user\n` +
                `  • .كتم قائمة`
            );
        }
        
        // لا يمكن كتم البوت
        if (targetUser === sock.user.id || (sock.user.lid && targetUser === sock.user.lid)) {
            return reply('❌ *لا يمكنك كتم البوت نفسه*');
        }
        
        // استخراج المدة والسبب
        let duration = null;
        let reason = '';
        
        // تجاوز المنشن من الـ args
        let remainingArgs = [...args];
        if (remainingArgs.length > 0 && remainingArgs[0].startsWith('@')) {
            remainingArgs.shift();
        }
        
        if (remainingArgs.length > 0 && !isNaN(parseInt(remainingArgs[0]))) {
            duration = parseInt(remainingArgs[0]);
            remainingArgs.shift();
        }
        
        if (remainingArgs.length > 0) {
            reason = remainingArgs.join(' ');
        } else {
            reason = 'بدون سبب';
        }
        
        let durationText = '';
        if (duration) {
            if (duration >= 1440) {
                const days = Math.floor(duration / 1440);
                durationText = `${days} يوم`;
            } else if (duration >= 60) {
                const hours = Math.floor(duration / 60);
                durationText = `${hours} ساعة`;
            } else {
                durationText = `${duration} دقيقة`;
            }
        } else {
            durationText = 'دائم';
        }
        
        const adminNumber = sender?.split('@')[0] || 'أدمن';
        const targetNumber = targetUser.split('@')[0];
        
        await muteUser(from, targetUser, duration, reason, adminNumber);
        
        // نفس الصيغة المستخدمة في checkMuted (التي تعمل بشكل صحيح)
        await sock.sendMessage(from, {
            text: `🔇 *تم كتم العضو* 🔇\n\n` +
                  `👤 العضو: @${targetNumber}\n` +
                  `⏰ المدة: ${durationText}\n` +
                  `📝 السبب: ${reason}\n` +
                  `👮 تم بواسطة: @${adminNumber}\n\n` +
                  `⚠️ سيتم حذف أي رسالة يرسلها تلقائياً`,
            mentions: [targetUser, sender]
        }, { quoted: msg });
    }
};

module.exports.checkMuted = checkMuted;