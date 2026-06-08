const database = require('../../database');
const fs = require('fs');
const path = require('path');

// مسار ملف الكلمات المحظورة
const badWordsPath = path.join(__dirname, 'badwords.json');

// تحميل الكلمات من الملف
const loadBadWords = () => {
    try {
        const data = fs.readFileSync(badWordsPath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error('خطأ في تحميل badwords.json:', e);
        return [];
    }
};

// حفظ الكلمات في الملف
const saveBadWords = (words) => {
    try {
        fs.writeFileSync(badWordsPath, JSON.stringify(words, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('خطأ في حفظ badwords.json:', e);
        return false;
    }
};

// دالة التحقق من وجود كلمة فاحشة (كلمة منفصلة فقط)
const containsBadWord = (text) => {
    if (!text) return null;
    const badWords = loadBadWords();
    const lower = text.toLowerCase();

    for (const word of badWords) {
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // \b لا تعمل مع العربية، نستخدم فراغات أو بداية/نهاية النص
        const regex = new RegExp(`(^|[\\s،,\\.!؟?])${escaped}([\\s،,\\.!؟?]|$)`, 'i');
        if (regex.test(lower)) {
            return word;
        }
    }
    return null;
};

// دالة فحص الرسائل (تُستدعى من handleMessage)
const checkBadWords = async (sock, msg) => {
    try {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;
        if (msg.key.fromMe) return;

        const groupSettings = database.getGroupSettings(from);
        if (!groupSettings.badwordFilter) return;

        const content = msg.message?.ephemeralMessage?.message || msg.message;
        let text = '';

        if (content?.conversation) text = content.conversation;
        else if (content?.extendedTextMessage?.text) text = content.extendedTextMessage.text;
        else if (content?.imageMessage?.caption) text = content.imageMessage.caption;
        else if (content?.videoMessage?.caption) text = content.videoMessage.caption;

        const badWord = containsBadWord(text);
        if (!badWord) return;

        const sender = msg.key.participant || msg.key.remoteJid;
        const senderNumber = sender.split('@')[0];

        // جلب التحذيرات
        database.addWarning(from, senderNumber, `كلمة ممنوعة: ${badWord}`);
        const newCount = database.getWarnings(from, senderNumber).count;
        const maxWarnings = groupSettings.badwordMaxWarnings || 3;
        const action = groupSettings.badwordAction || 'warn';

        // حذف الرسالة
        await sock.sendMessage(from, { delete: msg.key });

        const { isBotAdmin } = require('../../handler');
        const botIsAdmin = await isBotAdmin(sock, from);

        if (action === 'kick' && botIsAdmin) {
            await sock.groupParticipantsUpdate(from, [sender], 'remove');
            await sock.sendMessage(from, {
                text: `🚫 *تم طرد العضو* 🚫\n@${senderNumber} بسبب: ${badWord}`,
                mentions: [sender]
            });
            database.clearWarnings(from, senderNumber);
        } else if (newCount >= maxWarnings && botIsAdmin) {
            await sock.groupParticipantsUpdate(from, [sender], 'remove');
            await sock.sendMessage(from, {
                text: `🚫 *تم طرد العضو* 🚫\n@${senderNumber} تجاوز ${maxWarnings} تحذيرات`,
                mentions: [sender]
            });
            database.clearWarnings(from, senderNumber);
        } else {
            const remaining = maxWarnings - newCount;
            await sock.sendMessage(from, {
                text: `⚠️ *تحذير ${newCount}/${maxWarnings}* ⚠️\n@${senderNumber} ممنوع: ${badWord}\nتبقى ${remaining} تحذير`,
                mentions: [sender]
            });
        }

    } catch (e) {
        console.error('خطأ في checkBadWords:', e);
    }
};

// الأمر الرئيسي
module.exports = {
    name: 'منع_فاحش',
    aliases: ['badwords', 'فلتر', 'badword', 'كلمات_فاحشة'],
    category: 'admin',
    description: 'منع الكلام الفاحش في المجموعة',
    usage: '.منع_فاحش <تفعيل/تعطيل/تعيين/حالة/مسح/اضف/قائمة>',
    groupOnly: true,
    adminOnly: true,
    botAdminNeeded: false,

    async execute(sock, msg, args, extra) {
        const { from, reply } = extra;
        const groupSettings = database.getGroupSettings(from);
        const badWords = loadBadWords();

        // بدون أوامر — عرض المساعدة
        if (!args[0]) {
            const status = groupSettings.badwordFilter ? '✅ مفعل' : '❌ معطل';
            const action = groupSettings.badwordAction === 'kick'
                ? 'طرد فوري'
                : `تحذير (${groupSettings.badwordMaxWarnings || 3})`;

            return reply(
                `╔═══〔 🔞 *منع الكلام الفاحش* 〕═══╗\n\n` +
                `📊 *الحالة:* ${status}\n` +
                `⚡ *الإجراء:* ${action}\n` +
                `📖 *الكلمات المحظورة:* ${badWords.length}\n\n` +
                `📖 *أوامر التحكم:*\n` +
                `  • .منع_فاحش تفعيل\n` +
                `  • .منع_فاحش تعطيل\n` +
                `  • .منع_فاحش تعيين تحذير 3\n` +
                `  • .منع_فاحش تعيين طرد\n` +
                `  • .منع_فاحش حالة\n` +
                `  • .منع_فاحش مسح @مستخدم\n` +
                `  • .منع_فاحش اضف <كلمة>\n` +
                `  • .منع_فاحش قائمة\n` +
                `╚════════════════════╝`
            );
        }

        const opt = args[0];

        // ── تفعيل ──
        if (opt === 'تفعيل' || opt === 'تشغيل') {
            if (groupSettings.badwordFilter) return reply('⚠️ *الفلتر مفعل بالفعل*');
            database.updateGroupSettings(from, { badwordFilter: true });
            return reply('✅ *تم تفعيل فلتر الكلام الفاحش*');
        }

        // ── تعطيل ──
        if (opt === 'تعطيل' || opt === 'ايقاف') {
            if (!groupSettings.badwordFilter) return reply('⚠️ *الفلتر معطل بالفعل*');
            database.updateGroupSettings(from, { badwordFilter: false });
            return reply('❌ *تم تعطيل فلتر الكلام الفاحش*');
        }

        // ── تعيين ──
        if (opt === 'تعيين') {
            if (args.length < 2) {
                return reply('⚠️ *الخيارات: تحذير [عدد] / طرد*\nمثال: .منع_فاحش تعيين تحذير 3');
            }
            const setType = args[1];

            if (setType === 'تحذير') {
                const maxWarnings = parseInt(args[2]) || 3;
                database.updateGroupSettings(from, {
                    badwordAction: 'warn',
                    badwordMaxWarnings: maxWarnings,
                    badwordFilter: true
                });
                return reply(`⚠️ *تم التعيين*\nالإجراء: تحذير\nالحد الأقصى: ${maxWarnings} مرات`);
            }

            if (setType === 'طرد') {
                database.updateGroupSettings(from, {
                    badwordAction: 'kick',
                    badwordFilter: true
                });
                return reply(`🚫 *تم التعيين*\nالإجراء: طرد فوري`);
            }

            return reply('⚠️ *اختر: تحذير أو طرد*');
        }

        // ── حالة ──
        if (opt === 'حالة' || opt === 'status') {
            const isEnabled = groupSettings.badwordFilter;
            const action = groupSettings.badwordAction || 'warn';
            const maxWarnings = groupSettings.badwordMaxWarnings || 3;

            return reply(
                `📊 *حالة فلتر الكلام الفاحش*\n\n` +
                `┌─⪻ *BadWords* ⪼─┐\n` +
                `│ الحالة: ${isEnabled ? '✅ مفعل' : '❌ معطل'}\n` +
                `│ الإجراء: ${action === 'kick' ? '🚫 طرد فوري' : `⚠️ تحذير (${maxWarnings})`}\n` +
                `│ الكلمات: ${badWords.length}\n` +
                `└─────────────────`
            );
        }

        // ── مسح تحذيرات عضو ──
        if (opt === 'مسح') {
            const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            if (!mention) return reply('⚠️ *قم بمنشن العضو*\nمثال: .منع_فاحش مسح @مستخدم');
            const userId = mention.split('@')[0];
            database.clearWarnings(from, userId);
            return reply(`✅ *تم مسح تحذيرات* @${userId}`, { mentions: [mention] });
        }

        // ── إضافة كلمة جديدة ──
        if (opt === 'اضف' || opt === 'أضف' || opt === 'add') {
            if (!args[1]) {
                return reply('⚠️ *اكتب الكلمة التي تريد إضافتها*\nمثال: .منع_فاحش اضف كلمة');
            }

            const newWord = args.slice(1).join(' ').trim().toLowerCase();

            if (badWords.map(w => w.toLowerCase()).includes(newWord)) {
                return reply(`⚠️ *الكلمة موجودة بالفعل:* ${newWord}`);
            }

            badWords.push(newWord);
            const saved = saveBadWords(badWords);

            if (saved) {
                return reply(`✅ *تمت إضافة الكلمة بنجاح*\n📝 الكلمة: ${newWord}\n📊 المجموع: ${badWords.length} كلمة`);
            } else {
                return reply('❌ *حدث خطأ أثناء الحفظ، تأكد من صلاحيات الملف*');
            }
        }

        // ── قائمة الكلمات ──
        if (opt === 'قائمة' || opt === 'list') {
            const wordList = badWords.slice(0, 15).join('، ');
            return reply(
                `📖 *قائمة الكلمات المحظورة*\n\n` +
                `${wordList}${badWords.length > 15 ? `\n\n...و ${badWords.length - 15} كلمة أخرى` : ''}\n\n` +
                `📊 *الإجمالي:* ${badWords.length} كلمة`
            );
        }

        return reply('❌ *أمر غير معروف*\nاستخدم .منع_فاحش للمساعدة');
    }
};

// تصدير دالة الفحص للاستدعاء في handler
module.exports.checkBadWords = checkBadWords;
