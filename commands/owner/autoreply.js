/**
 * Auto Reply Command - رد تلقائي عام على منشن البوت أو كلمة بوت/bot
 * يعمل في جميع الدردشات والمجموعات في وقت واحد
 */   
const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const AUTOREPLY_CONFIG_PATH = path.join(__dirname, '../../data/autoreply.json');

// تحميل إعدادات الرد التلقائي
function loadConfig() {
    try {
        if (!fs.existsSync(AUTOREPLY_CONFIG_PATH)) {
            const defaultConfig = {
                enabled: false,
                type: 'text',
                content: 'أنا هنا! كيف يمكنني مساعدتك؟',
                stickerPath: null,
                audioPath: null
            };
            fs.writeFileSync(AUTOREPLY_CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
            return defaultConfig;
        }
        return JSON.parse(fs.readFileSync(AUTOREPLY_CONFIG_PATH, 'utf8'));
    } catch {
        return {
            enabled: false,
            type: 'text',
            content: 'أنا هنا! كيف يمكنني مساعدتك؟',
            stickerPath: null,
            audioPath: null
        };
    }
}

// حفظ الإعدادات
function saveConfig(config) {
    try {
        fs.writeFileSync(AUTOREPLY_CONFIG_PATH, JSON.stringify(config, null, 2));
        return true;
    } catch (error) {
        console.error('خطأ في حفظ إعدادات الرد التلقائي:', error);
        return false;
    }
}

// دالة لتحميل الميديا بالطريقة الصحيحة لـ Baileys
async function downloadMedia(sock, quotedMessage, msg) {
    try {
        // بناء targetMessage بنفس الطريقة المستخدمة في أمر الملصق
        const targetMessage = {
            key: {
                remoteJid: msg.key?.remoteJid,
                id: msg.message?.extendedTextMessage?.contextInfo?.stanzaId,
                participant: msg.message?.extendedTextMessage?.contextInfo?.participant
            },
            message: quotedMessage
        };
        
        const mediaBuffer = await downloadMediaMessage(
            targetMessage,
            'buffer',
            {},
            { logger: undefined, reuploadRequest: sock.updateMediaMessage }
        );
        
        return mediaBuffer;
    } catch (error) {
        console.error('Download error:', error);
        return null;
    }
}

module.exports = {
    name: 'رد_تلقائي',
    aliases: ['autoreply', 'تلقائي', 'autor'],
    category: 'owner',
    description: 'تفعيل/تعطيل الرد التلقائي العام على منشن البوت أو كلمة بوت/bot',
    usage: `.رد_تلقائي [تشغيل/ايقاف/نوع/تعيين]`,
    ownerOnly: true,

    async execute(sock, msg, args, extra) {
        try {
            const config = loadConfig();
            
            if (!args[0]) {
                const status = config.enabled ? '✅ مفعل' : '❌ معطل';
                const typeNames = {
                    text: '📝 رسالة نصية',
                    sticker: '🎨 ملصق (ستيكر)',
                    audio: '🎵 مقطع صوتي'
                };
                
                let preview = '';
                if (config.type === 'text' && config.content) {
                    preview = `\n📄 *المحتوى:* ${config.content.substring(0, 50)}${config.content.length > 50 ? '...' : ''}`;
                } else if (config.type === 'sticker' && config.stickerPath) {
                    preview = `\n🎨 *الملصق:* ${path.basename(config.stickerPath)}`;
                } else if (config.type === 'audio' && config.audioPath) {
                    preview = `\n🎵 *الصوت:* ${path.basename(config.audioPath)}`;
                }
                
                return extra.reply(
                    `╔═══〔 🤖 *الرد التلقائي العام* 〕═══╗\n\n` +
                    `📊 *الحالة:* ${status}\n` +
                    `🎭 *نوع الرد:* ${typeNames[config.type] || '📝 نصي'}${preview}\n\n` +
                    `📖 *الأوامر:*\n` +
                    `  • .رد_تلقائي تشغيل\n` +
                    `  • .رد_تلقائي ايقاف\n` +
                    `  • .رد_تلقائي نوع نص\n` +
                    `  • .رد_تلقائي نوع ملصق\n` +
                    `  • .رد_تلقائي نوع صوت\n` +
                    `  • .رد_تلقائي تعيين <النص>\n` +
                    `  • .رد_تلقائي تعيين (مع رد على ملصق/صوت)\n\n` +
                    `🤖 *يتم الرد عند:*\n` +
                    `  • منشن البوت (@${sock.user.id?.split(':')[0] || 'البوت'})\n` +
                    `  • كلمة "بوت" أو "bot"\n` +
                    `╚════════════════════╝`
                );
            }
            
            const opt = args[0].toLowerCase();
            
            // تشغيل
            if (opt === 'تشغيل' || opt === 'تفعيل') {
                if (config.enabled) {
                    return extra.reply('⚠️ *الرد التلقائي شغّال بالفعل~ mamasita نشيطة 💅*');
                }
                config.enabled = true;
                saveConfig(config);
                return extra.reply('✅ *mamasita فعّلت الرد التلقائي 🌸 العام*\nسيرد البوت عند منشن أو كتابة "بوت" في أي دردشة');
            }
            
            // إيقاف
            if (opt === 'ايقاف' || opt === 'تعطيل') {
                if (!config.enabled) {
                    return extra.reply('⚠️ *الرد التلقائي معطل بالفعل*');
                }
                config.enabled = false;
                saveConfig(config);
                return extra.reply('❌ *mamasita أوقفت الرد التلقائي 😢 العام*');
            }
            
            // تغيير نوع الرد
            if (opt === 'نوع') {
                if (!args[1]) {
                    return extra.reply('⚠️ *اختر نوع الرد:*\n  • نص\n  • ملصق\n  • صوت');
                }
                
                const type = args[1].toLowerCase();
                
                if (type === 'نص' || type === 'text') {
                    config.type = 'text';
                    if (!config.content) config.content = 'أنا هنا! كيف يمكنني مساعدتك؟';
                    saveConfig(config);
                    return extra.reply('✅ *تم تغيير نوع الرد إلى: رسالة نصية*\nاستخدم `.رد_تلقائي تعيين <النص>` لتغيير المحتوى');
                }
                
                if (type === 'ملصق' || type === 'sticker') {
                    config.type = 'sticker';
                    saveConfig(config);
                    return extra.reply(
                        '✅ *تم تغيير نوع الرد إلى: ملصق (ستيكر)*\n\n' +
                        '📤 *لتعيين الملصق:*\n' +
                        '  • قم بالرد على رسالة تحتوي على ملصق\n' +
                        '  • ثم اكتب: `.رد_تلقائي تعيين`'
                    );
                }
                
                if (type === 'صوت' || type === 'audio') {
                    config.type = 'audio';
                    saveConfig(config);
                    return extra.reply(
                        '✅ *تم تغيير نوع الرد إلى: مقطع صوتي*\n\n' +
                        '📤 *لتعيين المقطع الصوتي:*\n' +
                        '  • قم بالرد على رسالة تحتوي على صوت (ogg/mp3)\n' +
                        '  • ثم اكتب: `.رد_تلقائي تعيين`'
                    );
                }
                
                return extra.reply('❌ *نوع غير صالح. اختر: نص / ملصق / صوت*');
            }
            
            // تعيين المحتوى
            if (opt === 'تعيين' || opt === 'set') {
                // تعيين نص
                if (args.length > 1) {
                    const newContent = args.slice(1).join(' ');
                    config.content = newContent;
                    config.type = 'text';
                    saveConfig(config);
                    return extra.reply(`✅ *تم تعيين الرد النصي:*\n\n"${newContent}"`);
                }
                
                // الرد على رسالة
                const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                
                if (!quotedMsg) {
                    return extra.reply(
                        '⚠️ *لتعيين الرد التلقائي:*\n\n' +
                        '🔹 *لتعيين نص:*\n  `.رد_تلقائي تعيين النص الذي تريده`\n\n' +
                        '🔹 *لتعيين ملصق:*\n  • قم بالرد على ملصق\n  • ثم اكتب: `.رد_تلقائي تعيين`\n\n' +
                        '🔹 *لتعيين مقطع صوتي:*\n  • قم بالرد على مقطع صوتي\n  • ثم اكتب: `.رد_تلقائي تعيين`'
                    );
                }
                
                // تحميل الملصق
                if (quotedMsg.stickerMessage) {
                    const stickerBuffer = await downloadMedia(sock, quotedMsg, msg);
                    
                    if (stickerBuffer) {
                        const stickerDir = path.join(__dirname, '../../temp');
                        if (!fs.existsSync(stickerDir)) fs.mkdirSync(stickerDir, { recursive: true });
                        
                        const stickerPath = path.join(stickerDir, `autoreply_sticker.webp`);
                        fs.writeFileSync(stickerPath, stickerBuffer);
                        
                        config.type = 'sticker';
                        config.stickerPath = stickerPath;
                        config.content = null;
                        saveConfig(config);
                        
                        return extra.reply('✅ *تم تعيين الرد التلقائي كملصق (ستيكر)*');
                    }
                    return extra.reply('❌ *فشل في تحميل الملصق*');
                }
                
                // تحميل الصوت
                if (quotedMsg.audioMessage) {
                    const audioBuffer = await downloadMedia(sock, quotedMsg, msg);
                    
                    if (audioBuffer) {
                        const audioDir = path.join(__dirname, '../../temp');
                        if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
                        
                        const audioPath = path.join(audioDir, `autoreply_audio.ogg`);
                        fs.writeFileSync(audioPath, audioBuffer);
                        
                        config.type = 'audio';
                        config.audioPath = audioPath;
                        config.content = null;
                        saveConfig(config);
                        
                        return extra.reply('✅ *تم تعيين الرد التلقائي كمقطع صوتي*');
                    }
                    return extra.reply('❌ *فشل في تحميل المقطع الصوتي*');
                }
                
                return extra.reply('⚠️ *قم بالرد على ملصق أو مقطع صوتي لتعيينه كرد تلقائي*\nأو استخدم `.رد_تلقائي تعيين <النص>` لتعيين رد نصي');
            }
            
            // عرض الحالة
            if (opt === 'حالة' || opt === 'status') {
                const status = config.enabled ? '✅ مفعل' : '❌ معطل';
                const typeNames = {
                    text: '📝 رسالة نصية',
                    sticker: '🎨 ملصق',
                    audio: '🎵 مقطع صوتي'
                };
                return extra.reply(
                    `🤖 *الرد التلقائي العام*\n\n` +
                    `📊 الحالة: ${status}\n` +
                    `🎭 نوع الرد: ${typeNames[config.type] || 'نصي'}\n` +
                    `🌍 يعمل في: جميع الدردشات والمجموعات`
                );
            }
            
            return extra.reply('❌ *خيار غير صالح. استخدم: تشغيل / ايقاف / نوع / تعيين / حالة');
            
        } catch (error) {
            console.error('خطأ في رد_تلقائي:', error);
            await extra.reply(`❌ *خطأ:* ${error.message}`);
        }
    },

    // ===============================
    // دالة فحص الرسائل للرد التلقائي (تُستدعى من message handler)
    // ===============================
    async checkAutoReply(sock, msg) {
        try {
            // تحميل الإعدادات
            const config = loadConfig();
            
            // إذا كان الرد التلقائي معطلاً
            if (!config.enabled) return false;
            
            // تجاهل رسائل البوت نفسه
            if (msg.key.fromMe) return false;
            
            const from = msg.key.remoteJid;
            
            // تجاهل رسائل النظام
            if (from?.includes('@broadcast') || from?.includes('status.broadcast')) return false;
            
            // استخراج النص من الرسالة
            const content = msg.message?.ephemeralMessage?.message || msg.message;
            let body = content.conversation ||
                      content.extendedTextMessage?.text ||
                      content.imageMessage?.caption ||
                      content.videoMessage?.caption ||
                      '';
            
            body = body.toLowerCase().trim();
            
            // الحصول على رقم البوت
            const botNumber = sock.user.id?.split(':')[0] || '';
            
            // التحقق من وجود منشن للبوت
            const contextInfo = content.extendedTextMessage?.contextInfo || msg.message?.contextInfo;
            const mentionedJids = contextInfo?.mentionedJid || [];
            const isMentioned = mentionedJids.some(jid => jid.includes(botNumber) || jid === sock.user.id);
            
            // التحقق من كلمة "بوت" أو "bot"
            const botWords = ['بوت', 'bot', 'بوتي'];
            const hasBotWord = botWords.some(word => body === word || body.startsWith(word + ' ') || body.endsWith(' ' + word) || body.includes(' ' + word + ' '));
            
            // التحقق من منشن غير مباشر (مثل @رقم البوت في النص)
            const hasMentionInText = body.includes(`@${botNumber}`);
            
            // إذا لم يتم استيفاء أي شرط
            if (!isMentioned && !hasBotWord && !hasMentionInText) return false;
            
            console.log(`[AutoReply] mamasita فعّلت الرد التلقائي 🌸 من ${from} - النوع: ${config.type}`);
            
            // الرد حسب نوع الإعداد
            try {
                if (config.type === 'text' && config.content) {
                    await sock.sendMessage(from, {
                        text: config.content,
                        mentions: [msg.key.participant || msg.key.remoteJid]
                    }, { quoted: msg });
                }
                else if (config.type === 'sticker' && config.stickerPath && fs.existsSync(config.stickerPath)) {
                    const stickerBuffer = fs.readFileSync(config.stickerPath);
                    await sock.sendMessage(from, {
                        sticker: stickerBuffer
                    }, { quoted: msg });
                }
                else if (config.type === 'audio' && config.audioPath && fs.existsSync(config.audioPath)) {
                    const audioBuffer = fs.readFileSync(config.audioPath);
                    await sock.sendMessage(from, {
                        audio: audioBuffer,
                        mimetype: 'audio/ogg; codecs=opus'
                    }, { quoted: msg });
                }
                else {
                    // fallback للرسالة النصية
                    await sock.sendMessage(from, {
                        text: 'أنا هنا! كيف يمكنني مساعدتك؟ 🤖'
                    }, { quoted: msg });
                }
                
                return true;
                
            } catch (sendError) {
                console.error('[AutoReply] خطأ في الإرسال:', sendError);
                return false;
            }
            
        } catch (error) {
            console.error('[AutoReply] خطأ عام:', error);
            return false;
        }
    }
};