/**

 * Antilink Command - نسخة سريعة مع طرد دقيق

 */

const database = require('../../database');

const fs = require('fs');

const path = require('path');

// ملف لتخزين المخالفات

const WARNINGS_FILE = path.join(__dirname, '../../database/warnings.json');

// تحميل المخالفات

function loadWarnings() {

    try {

        if (!fs.existsSync(WARNINGS_FILE)) return {};

        return JSON.parse(fs.readFileSync(WARNINGS_FILE));

    } catch {

        return {};

    }

}

// حفظ المخالفات

function saveWarnings(data) {

    try {

        fs.writeFileSync(WARNINGS_FILE, JSON.stringify(data, null, 2));

    } catch (error) {

        console.error('خطأ في حفظ المخالفات:', error);

    }

}

// أنماط الروابط - سريعة جداً

const LINK_PATTERNS = [

    /chat\.whatsapp\.com\/[^\s]+/gi,

    /https?:\/\/[^\s]+/gi,

    /www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/gi,

    /t\.me\/[^\s]+/gi,

    /wa\.me\/[^\s]+/gi,

    /[a-zA-Z0-9-]+\.(com|net|org|me|io)[^\s]*/gi

];

// ذاكرة مؤقتة للرسائل المحذوفة حديثاً

const recentDeletions = new Map();

// تنظيف الذاكرة كل دقيقة

setInterval(() => {

    const now = Date.now();

    for (const [key, time] of recentDeletions.entries()) {

        if (now - time > 60000) {

            recentDeletions.delete(key);

        }

    }

}, 60000);

module.exports = {

    name: 'منع_روابط',

    aliases: ['antilink', 'حماية', 'منع الروابط'],

    category: 'admin',

    description: 'حماية المجموعة من الروابط',

    usage: '.منع_روابط <تشغيل/ايقاف/تعيين/عرض/مسح>',

    groupOnly: true,

    adminOnly: true,

    botAdminNeeded: true,

    async execute(sock, msg, args, extra) {

        try {

            const chatId = extra.from;

            if (!args[0]) {

                const settings = database.getGroupSettings(chatId);

                const status = settings.antilink ? '✅ مفعل' : '❌ معطل';

                const action = settings.antilinkAction === 'kick' ? 'طرد' : 'حذف';

                const maxWarnings = settings.maxWarnings || 3;

                

                return extra.reply(

                    `╔═══〔 🔗 *حماية الروابط* 〕═══╗\n\n` +

                    `📊 *الحالة:* ${status}\n` +

                    `⚡ *الإجراء:* ${action}\n` +

                    `⚠️ *الحد الأقصى:* ${maxWarnings} مخالفات\n\n` +

                    `📖 *أوامر التحكم:*\n` +
                    `  • .منع_روابط تشغيل\n` +
                    `  • .منع_روابط ايقاف\n` +
                    `  • .منع_روابط تعيين حذف\n` +
                    `  • .منع_روابط تعيين طرد\n` +
                    `  • .منع_روابط تعيين حد 3\n` +
                    `  • .منع_روابط مسح @مستخدم\n` +
                    `  • .منع_روابط عرض\n` +
                    `╚════════════════════╝`

                );

            }

            const opt = args[0].toLowerCase();

            // تشغيل منع الروابط

            if (opt === 'تشغيل' || opt === 'تفعيل') {

                const settings = database.getGroupSettings(chatId);

                if (settings.antilink) {

                    return extra.reply('⚠️ *منع الروابط مفعل بالفعل*');

                }

                database.updateGroupSettings(chatId, { 

                    antilink: true,

                    antilinkAction: settings.antilinkAction || 'delete',

                    maxWarnings: settings.maxWarnings || 3

                });

                return extra.reply('✅ *تم تفعيل منع الروابط*');

            }

            // إيقاف منع الروابط

            if (opt === 'ايقاف' || opt === 'تعطيل') {

                database.updateGroupSettings(chatId, { antilink: false });

                return extra.reply('❌ *تم تعطيل منع الروابط*');

            }

            // تعيين الإجراء

            if (opt === 'تعيين') {

                if (args.length < 2) {

                    return extra.reply('⚠️ *اختر: حذف / طرد / حد*\nمثال: .منع_روابط تعيين حذف');

                }

                const setAction = args[1].toLowerCase();

                if (setAction === 'حذف') {

                    database.updateGroupSettings(chatId, { 

                        antilinkAction: 'delete',

                        antilink: true

                    });

                    return extra.reply('✅ *تم تعيين الإجراء إلى: حذف الرسالة فقط*');

                }

                if (setAction === 'طرد') {

                    database.updateGroupSettings(chatId, { 

                        antilinkAction: 'kick',

                        antilink: true

                    });

                    return extra.reply('✅ *تم تعيين الإجراء إلى: طرد العضو*');

                }

                if (setAction === 'حد') {

                    if (args.length < 3) {

                        return extra.reply('⚠️ *اكتب عدد المخالفات المسموحة*\nمثال: .منع_روابط تعيين حد 3');

                    }

                    const limit = parseInt(args[2]);

                    if (isNaN(limit) || limit < 1 || limit > 10) {

                        return extra.reply('❌ *الحد يجب أن يكون بين 1 و 10*');

                    }

                    database.updateGroupSettings(chatId, { 

                        maxWarnings: limit,

                        antilink: true

                    });

                    return extra.reply(`✅ *تم تعيين حد المخالفات إلى: ${limit}*`);

                }

                return extra.reply('❌ *خيار غير صالح. اختر: حذف / طرد / حد*');

            }

            // مسح مخالفات عضو

            if (opt === 'مسح' || opt === 'حذف_مخالفات') {

                const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

                if (!mentioned || mentioned.length === 0) {

                    return extra.reply('⚠️ *منشن العضو المطلوب*\nمثال: .منع_روابط مسح @مستخدم');

                }

                const target = mentioned[0];

                const warnings = loadWarnings();

                

                if (warnings[chatId]?.[target]) {

                    delete warnings[chatId][target];

                    saveWarnings(warnings);

                    return extra.reply(`✅ *تم مسح مخالفات @${target.split('@')[0]}*`);

                } else {

                    return extra.reply(`ℹ️ *لا توجد مخالفات لهذا العضو*`);

                }

            }

            // عرض الإعدادات

            if (opt === 'عرض') {

                const settings = database.getGroupSettings(chatId);

                const status = settings.antilink ? '✅ مفعل' : '❌ معطل';

                const action = settings.antilinkAction === 'kick' ? 'طرد' : 'حذف';

                const maxWarnings = settings.maxWarnings || 3;

                

                // عرض المخالفات الحالية

                const warnings = loadWarnings();

                const groupWarnings = warnings[chatId] || {};

                const warningsList = Object.entries(groupWarnings)

                    .map(([jid, count]) => `• @${jid.split('@')[0]}: ${count} مخالفات`)

                    .join('\n') || '• لا توجد مخالفات';

                return extra.reply(

                    `╔═══〔 📊 *إعدادات الحماية* 〕═══╗\n\n` +
                    `🔗 *الحالة:* ${status}\n` +
                    `⚡ *الإجراء:* ${action}\n` +
                    `⚠️ *الحد الأقصى:* ${maxWarnings}\n\n` +
                    `📋 *المخالفات الحالية:*\n${warningsList}\n` +
                  `╚════════════════════╝`

                );

            }

            return extra.reply('📖 *استعمل .منع_روابط لعرض الإعدادات*');

        } catch (error) {

            console.error('خطأ في منع_روابط:', error);

            await extra.reply(`❌ *خطأ:* ${error.message}`);

        }

    },

    // ===============================

    // دالة فحص الروابط - سريعة مع طرد دقيق

    // ===============================

    async checkMessage(sock, msg, groupMetadata) {

        try {

            const from = msg.key.remoteJid;

            if (!from.endsWith('@g.us')) return;

            const settings = database.getGroupSettings(from);

            if (!settings.antilink) return;

            const sender = msg.key.participant || msg.key.remoteJid;

            

            // التحقق من المشرفين بسرعة

            if (groupMetadata?.participants) {

                const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;

                if (isAdmin) return;

            }

            // استخراج النص بسرعة

            const content = msg.message?.ephemeralMessage?.message || msg.message;

            const body = content.conversation ||

                        content.extendedTextMessage?.text ||

                        content.imageMessage?.caption ||

                        content.videoMessage?.caption ||

                        '';

            if (!body) return;

            // فحص الروابط - سريع

            let hasLink = false;

            for (const pattern of LINK_PATTERNS) {

                if (pattern.test(body)) {

                    hasLink = true;

                    break;

                }

            }

            if (!hasLink) return;

            // منع الحذف المتكرر لنفس الرسالة

            const msgId = msg.key.id;

            if (recentDeletions.has(msgId)) return;

            recentDeletions.set(msgId, Date.now());

            // 🟢 حذف فوري للرسالة

            await sock.sendMessage(from, { delete: msg.key }).catch(() => {});

            // إذا كان الإجراء "طرد"

            if (settings.antilinkAction === 'kick') {

                // تحميل المخالفات

                const warnings = loadWarnings();

                if (!warnings[from]) warnings[from] = {};

                if (!warnings[from][sender]) warnings[from][sender] = 0;

                

                // زيادة عدد المخالفات

                warnings[from][sender] += 1;

                const currentWarnings = warnings[from][sender];

                const maxWarnings = settings.maxWarnings || 3;

                

                // حفظ المخالفات (مرة واحدة فقط)

                saveWarnings(warnings);

                

                // التحقق من البوت مشرف

                const botIsAdmin = groupMetadata?.participants?.find(p => p.id === sock.user.id)?.admin;

                

                if (currentWarnings >= maxWarnings) {

                    // ✅ طرد العضو عند الوصول للحد الأقصى

                    if (botIsAdmin) {

                        await sock.groupParticipantsUpdate(from, [sender], 'remove').catch(() => {});

                        await sock.sendMessage(from, {

                            text: `👢 *تم طرد @${sender.split('@')[0]}*\n⚠️ السبب: تجاوز ${maxWarnings} مخالفات روابط`,

                            mentions: [sender]

                        }).catch(() => {});

                        

                        // حذف مخالفات العضو بعد الطرد

                        delete warnings[from][sender];

                        saveWarnings(warnings);

                    }

                } else {

                    // إرسال تحذير فقط

                    const remaining = maxWarnings - currentWarnings;

                    await sock.sendMessage(from, {

                        text: `⚠️ @${sender.split('@')[0]} ممنوع إرسال الروابط!\n\n` +
                              `📊 *المخالفة:* ${currentWarnings}/${maxWarnings}\n` +
                              `🔄 *متبقي:* ${remaining} مخالفة قبل الطرد`,
                        mentions: [sender]

                    }).catch(() => {});

                }

            } else {

                // الإجراء "حذف" فقط - بدون مخالفات

                await sock.sendMessage(from, {

                    text: `⚠️ @${sender.split('@')[0]} ممنوع إرسال الروابط`,

                    mentions: [sender]

                }).catch(() => {});

            }

        } catch (error) {

            console.error('خطأ في checkMessage:', error);

        }

    }

};