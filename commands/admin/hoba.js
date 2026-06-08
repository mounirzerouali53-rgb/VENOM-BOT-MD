const fs = require('fs');
const path = require('path');
const settings = require('../../config');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'حويهم',
    aliases: ["hitler", "تدمير"],
    category: "group",
    description: "أمر تدمير المجموعة أو تحديث الصورة فقط",
    ownerOnly: true,
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

            // التحقق من وجود subcommand "صورة"
            const subCommand = args[0]?.toLowerCase();
            const isImageOnly = (subCommand === 'صورة');

            // التحقق من الرد على صورة في حالة subcommand صورة
            const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (isImageOnly) {
                // ========== حالة: .حويهم صورة (تحديث الصورة فقط) ==========
                if (!quotedMsg || !quotedMsg.imageMessage) {
                    return await sock.sendMessage(from, {
                        text: '❌ يجب الرد على صورة مع الأمر.\n\nمثال: قم بالرد على صورة ثم اكتب `.حويهم صورة`'
                    }, { quoted: msg });
                }

                try {
                    await sock.sendMessage(from, { react: { text: "📥", key: msg.key } });

                    // تحميل الصورة التي تم الرد عليها
                    const stream = await downloadMediaMessage(
                        { key: msg.message.extendedTextMessage.contextInfo.stanzaId, message: quotedMsg },
                        'buffer',
                        { reuploadRequest: sock.updateMediaMessage }
                    );
                    
                    // حفظ الصورة في المسار المحدد (استبدال الصورة القديمة)
                    const imagePath = path.join(__dirname, '../../utils/hoba.jpg');
                    await fs.promises.writeFile(imagePath, stream);
                    
                    await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });
                    
                    return await sock.sendMessage(from, {
                        text: `✅ تم تحديث الصورة بنجاح في المسار:\n\`${imagePath}\`\n\nيمكنك الآن استخدام الأمر \`.حويهم\` لتطبيقها على المجموعة.`
                    }, { quoted: msg });
                    
                } catch (downloadError) {
                    console.error('❌ فشل تحميل الصورة:', downloadError);
                    await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
                    return await sock.sendMessage(from, {
                        text: '❌ فشل تحميل الصورة. تأكد من صحة الصورة وحاول مرة أخرى.'
                    }, { quoted: msg });
                }
            }

            // ========== الحالة الأساسية: .حويهم (تنفيذ الإجراء الكامل) ==========
            
            // جلب الصورة من المسار
            let imageBuffer = await fs.promises.readFile(path.join(__dirname, '../../utils/hoba.jpg')).catch(() => null);
            
            if (!imageBuffer) {
                return await sock.sendMessage(from, {
                    text: '⚠️ لا توجد صورة محفوظة. قم أولاً بتعيين صورة باستخدام:\n`.حويهم صورة` (مع الرد على صورة)'
                }, { quoted: msg });
            }

            // جلب بيانات المجموعة
            const metadata = await sock.groupMetadata(from);
            const allParticipants = metadata.participants.map(p => p.id);
            const toKick = allParticipants.filter(id => id !== sender && id !== botId);

            await sock.sendMessage(from, { react: { text: "⏳", key: msg.key } });

            const header = `*~╔═ ⛓️🩸 𝖁𝕰𝕹𝕺𝕸🩸⛓️ ═╗~*\n\n`;
            const footer = `\n\n*~╚═ ⚔️ 𝕭𝖄:𝕱𝕰𝕹𝕺𝕸⚔️ ═╝~*`;
            const channelContext = {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: channelJid,
                    serverMessageId: 100,
                    newsletterName: "𝑽𝑬𝑵𝑶𝑴-𝑩𝑶𝑻-𝑴𝑫"
                }
            };

            // رسالة التنبيه
            await sock.sendMessage(from, {
                text: `${header}*⚠️ تـنـبـيـه لـلـجـمـيـع! (إبـادة فـوريـة)*\n\n*تـم رصـدكـم ضـمـن أهـداف اﻟـتـطـهـيـر...*\n*شـاهـد كـيـف تـم سـحـقـكـم فـي قـنـاتـنـا بـالـأسـفـل!👇*${footer}`,
                mentions: allParticipants,
                contextInfo: channelContext
            }, { quoted: msg });

            // رسالة العد التنازلي
            const sentMsg = await sock.sendMessage(from, {
                text: header + "  [░░░░░░░░░░] 0%" + footer,
                contextInfo: channelContext
            }, { quoted: msg });

            // تحديثات المجموعة (الاسم والوصف والصورة)
            const updatePromise = (async () => {
                await Promise.all([
                    sock.groupUpdateSubject(from, '꧁༒『~𝑽𝑬𝑵𝑶𝑴~』༒꧂').catch(() => { }),
                    sock.groupUpdateDescription(from, `⚖️ 𝑽𝑬𝑵𝑶𝑴-𝑩𝑶𝑻-𝑴𝑫 : اﻟـسـكـوت هـنـا أصـبـح لـبـاسـكـم.`).catch(() => { })
                ]);

                if (imageBuffer) {
                    await sock.updateProfilePicture(from, imageBuffer).catch(() => { });
                }
            })();

            // العد التنازلي
            const barChars = ["░", "█"];
            for (let i = 1; i <= 4; i++) {
                await new Promise(res => setTimeout(res, 400));

                const countdown = 4 - i;
                const progress = `  [${barChars[1].repeat(i * 2.5)}${barChars[0].repeat(10 - (i * 2.5))}] ${i * 25}%`;

                if (countdown >= 0) {
                    await sock.sendMessage(from, {
                        text: header + `*🚀 بـدء مـحـرك اﻟـإبـادة...*\n\n${progress}\n\n*⏳ اﻟـتـنـفـيـذ بـعـد:* ${countdown} ثـوانٍ` + footer,
                        edit: sentMsg.key,
                        contextInfo: channelContext
                    });
                }
            }

            await updatePromise;

            // تنفيذ الطرد والرسالة النهائية معاً
            await Promise.all([
                sock.groupParticipantsUpdate(from, toKick, 'remove').catch(() => { }),
                (async () => {
                    const finalBoom = `${header}* ⊰『 𝑩 𝑶 𝑶 𝑴 』⊱   *\n\n*☠️ تـم اﻟـاسـتـيـلـاء اﻟ-كـامـل*\n\n*🩸 اﻟـروم أصـبـح مـلـكـاً لـفـيـنـوم.*\n*🕷️ اﻟـجـمـيـع إلـى اﻟـقـنـاة اﻟـآن...*\n\n*👥 اﻟـأهـداف اﻟـمـصـفـاة:* ${toKick.length}\n*👤 اﻟـسـفـاح:* @${sender.split('@')[0]}${footer}`;

                    await sock.sendMessage(from, {
                        text: finalBoom,
                        edit: sentMsg.key,
                        mentions: [sender],
                        contextInfo: channelContext
                    });
                })()
            ]);

            await sock.sendMessage(from, { react: { text: "💀", key: msg.key } });

        } catch (error) {
            console.error('خطأ في تنفيذ الأمر:', error);
            await sock.sendMessage(from, {
                text: '❌ حدث خطأ أثناء تنفيذ الأمر.'
            }, { quoted: msg });
        }
    }
};