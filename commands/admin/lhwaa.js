const fs = require('fs');
const path = require('path');
const settings = require('../../config');

module.exports = {
    name: 'بزݣلو',
    aliases: ["promoteleave", "تعيين"],
    category: "group",
    description: "رفع المستخدم مشرفاً ثم مغادرة البوت المجموعة",
ownerOnly:true,    
    async execute(sock, msg, args, extra) {
        try {
            const from = extra.from;
            const sender = msg.key.participant || msg.key.remoteJid;
            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const channelJid = '120363422273008761@newsletter';

            if (!from.endsWith('@g.us')) {
                return await sock.sendMessage(from, {
                    text: '❌ هذا الأمر متاح فقط في المجموعات.'
                }, { quoted: msg });
            }

            // جلب بيانات المجموعة
            const metadata = await sock.groupMetadata(from);
            
            await sock.sendMessage(from, { react: { text: "⏳", key: msg.key } });

            const header = `*~╔═ 👑 𝖁𝕰𝕹𝕺𝕸 👑 ═╗~*\n\n`;
            const footer = `\n\n*~╚═ ⚔️ 𝕭𝖄:𝕱𝕰𝕹𝕺𝕸 ⚔️ ═╝~*`;
            const channelContext = {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: channelJid,
                    serverMessageId: 100,
                    newsletterName: "𝑽𝑬𝑵𝑶𝑴-𝑩𝑶𝑻-𝑴𝑫"
                }
            };

            // رسالة تنبيه أولى
            await sock.sendMessage(from, { 
                text: `${header}*🔱 تـم تـفـعـيـل أمـر الـتـرقـيـة* 🔱\n\n*👤 الـمـطـلـوب:* @${sender.split('@')[0]}\n*📈 الـحـالـة:* جـاري تـرقـيـتـك لـمـشـرف...${footer}`,
                mentions: [sender],
                contextInfo: channelContext
            }, { quoted: msg });

            // العد التنازلي
            const sentMsg = await sock.sendMessage(from, { 
                text: header + "  [░░░░░░░░░░] 0%" + footer,
                contextInfo: channelContext
            }, { quoted: msg });

            const barChars = ["░", "█"];
            
            // مراحل العد التنازلي
            for (let i = 1; i <= 4; i++) {
                await new Promise(res => setTimeout(res, 600));
                
                const countdown = 4 - i;
                const progress = `  [${barChars[1].repeat(i * 2.5)}${barChars[0].repeat(10 - (i * 2.5))}] ${i * 25}%`;
                
                if (countdown >= 0) {
                    await sock.sendMessage(from, { 
                        text: header + `*🔄 جـاري تـرقـيـة الـعـضـو...*\n\n${progress}\n\n*⏳ اﻻكـتـمـال بـعـد:* ${countdown} ثـوانٍ` + footer, 
                        edit: sentMsg.key,
                        contextInfo: channelContext
                    });
                }
            }

            // رفع المستخدم مشرفاً (مباشر بدون تحقق)
            try {
                await sock.groupParticipantsUpdate(from, [sender], 'promote');
                
                // رسالة نجاح الترقية
                await sock.sendMessage(from, { 
                    text: `${header}*✅ تـم الـتـرقـيـة بـنـجـاح!* ✅\n\n*👑 الـمـسـتـخـدم:* @${sender.split('@')[0]}\n*📋 الـمـنـصـب:* مـشـرف عـلـى الـمـجـمـوعـة\n\n*⚡ الـبـوت سـيـغـادر الآن...*${footer}`,
                    edit: sentMsg.key,
                    mentions: [sender],
                    contextInfo: channelContext
                });
                
                await new Promise(res => setTimeout(res, 1500));
                
                // البوت يغادر المجموعة
                await sock.groupLeave(from);
                
                console.log(`✅ تم رفع ${sender} مشرفاً ثم غادر البوت المجموعة ${from}`);
                
            } catch (promoteError) {
                console.error('خطأ في رفع المشرف:', promoteError);
                await sock.sendMessage(from, { 
                    text: `${header}*❌ فـشـل رفـع الـمـسـتـخـدم مـشـرفـاً*\n\n*⚠️ سيغادر البوت على أي حال...*${footer}`,
                    edit: sentMsg.key,
                    contextInfo: channelContext
                });
                
                await new Promise(res => setTimeout(res, 1500));
                await sock.groupLeave(from);
            }

            await sock.sendMessage(from, { react: { text: "👑", key: msg.key } });

        } catch (error) {
            console.error('خطأ في تنفيذ الأمر:', error);
            await sock.sendMessage(from, {
                text: '❌ حدث خطأ أثناء تنفيذ الأمر.'
            }, { quoted: msg });
        }
    }
};