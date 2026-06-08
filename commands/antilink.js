const database = require('../../database');
const config = require('../../config');
const { sendInteractiveMessage } = require('gifted-btns');

// قائمة المواقع المسموحة
const allowedDomains = [
    'youtube.com', 'youtu.be', 'instagram.com', 'facebook.com', 
    'tiktok.com', 'twitter.com', 'x.com', 'telegram.org', 
    'whatsapp.com', 'wa.me', 'google.com', 'drive.google.com'
];

// دالة التحقق من وجود رابط
const containsLink = (text) => {
    if (!text) return null;
    const groupLinkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
    if (groupLinkRegex.test(text)) return 'group_link';
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const matches = text.match(urlRegex);
    if (matches) {
        for (const url of matches) {
            const isAllowed = allowedDomains.some(domain => 
                url.toLowerCase().includes(domain.toLowerCase())
            );
            if (!isAllowed) return url;
        }
    }
    return null;
};

// دالة فحص الرسائل (تُستدعى من handleMessage)
const checkAntilink = async (sock, msg) => {
    try {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;
        if (msg.key.fromMe) return;
        
        const groupSettings = database.getGroupSettings(from);
        if (!groupSettings.antilink) return;

        const sender = msg.key.participant || msg.key.remoteJid;
        const groupMetadata = await sock.groupMetadata(from);
        const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
        if (admins.includes(sender)) return;
        
        const content = msg.message?.ephemeralMessage?.message || msg.message;
        let text = '';
        if (content?.conversation) text = content.conversation;
        else if (content?.extendedTextMessage?.text) text = content.extendedTextMessage.text;
        else if (content?.imageMessage?.caption) text = content.imageMessage.caption;
        else if (content?.videoMessage?.caption) text = content.videoMessage.caption;
        
        const link = containsLink(text);
        if (!link) return;
        
        const senderNumber = sender.split('@')[0];
        const warnings = database.getWarnings(from, senderNumber);
        const action = groupSettings.antilinkAction || 'delete';
        const maxWarnings = parseInt(groupSettings.maxWarnings) || 3;
        
        if (action === 'kick') {
            const { isBotAdmin } = require('../../handler');
            const botIsAdmin = await isBotAdmin(sock, from);
            if (botIsAdmin) {
                await sock.sendMessage(from, { delete: msg.key });
                await sock.groupParticipantsUpdate(from, [sender], 'remove');
                await sock.sendMessage(from, {
                    text: `🚫 *تم طرد العضو* 🚫\n@${senderNumber} بسبب نشر رابط: ${link === 'group_link' ? 'رابط مجموعة' : link.substring(0, 30)}`,
                    mentions: [sender]
                });
                database.clearWarnings(from, senderNumber);
            } else {
                await sock.sendMessage(from, { delete: msg.key });
            }
        } else {
            database.addWarning(from, senderNumber, `رابط ممنوع: ${link === 'group_link' ? 'رابط مجموعة' : link}`);
            const newCount = database.getWarnings(from, senderNumber).count;
            await sock.sendMessage(from, { delete: msg.key });
            if (newCount >= maxWarnings) {
                const { isBotAdmin } = require('../../handler');
                const botIsAdmin = await isBotAdmin(sock, from);
                if (botIsAdmin) {
                    await sock.groupParticipantsUpdate(from, [sender], 'remove');
                    await sock.sendMessage(from, {
                        text: `🚫 *تم طرد العضو* 🚫\n@${senderNumber} تجاوز ${maxWarnings} تحذيرات (نشر روابط)`,
                        mentions: [sender]
                    });
                    database.clearWarnings(from, senderNumber);
                }
            } else {
                const remaining = maxWarnings - newCount;
                await sock.sendMessage(from, {
                    text: `⚠️ *تحذير ${newCount}/${maxWarnings}* ⚠️\n@${senderNumber} ممنوع نشر الروابط\nتبقى ${remaining} تحذير`,
                    mentions: [sender]
                });
            }
        }
    } catch (e) {}
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// الأمر الرئيسي
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
module.exports = {
    name: 'منع_روابط',
    aliases: ['antilink', 'حماية', 'antilink2', 'رابط'],
    category: 'admin',
    description: '🔗 حماية المجموعة من الروابط',
    usage: '.منع_روابط',
    groupOnly: true,
    adminOnly: true,
    botAdminNeeded: false,

    async execute(sock, msg, args, extra) {
        const { from, reply, sender } = extra;
        const groupSettings = database.getGroupSettings(from);

        // ━━━ بدون args: عرض القائمة الرئيسية التفاعلية ━━━
        if (!args[0]) {
            const isEnabled = groupSettings.antilink;
            const action = groupSettings.antilinkAction === 'kick' ? '🚫 طرد فوري' : `🗑️ حذف + تحذير`;
            const maxW = groupSettings.maxWarnings || 3;

            const statusText =
                `╭━━━〔 🔗 *منع الروابط* 〕━━━╮\n` +
                `┃ 📊 الحالة: ${isEnabled ? '✅ مفعل' : '❌ معطل'}\n` +
                `┃ ⚡ الإجراء: ${action}\n` +
                `┃ ⚠️ حد التحذيرات: ${maxW}\n` +
                `┃ 🌐 المسموح: ${allowedDomains.length} موقع\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                `👇 *اختر الإجراء من القائمة أدناه*`;

            await sendInteractiveMessage(sock, from, {
                text: statusText,
                footer: '🔗 نظام منع الروابط',
                interactiveButtons: [
                    {
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                            title: '⚙️ إدارة منع الروابط',
                            sections: [
                                {
                                    title: '🔘 التفعيل والتعطيل',
                                    rows: [
                                        {
                                            header: '✅',
                                            title: 'تفعيل منع الروابط',
                                            description: 'تشغيل الحماية من الروابط',
                                            id: 'antilink_enable'
                                        },
                                        {
                                            header: '❌',
                                            title: 'تعطيل منع الروابط',
                                            description: 'إيقاف الحماية من الروابط',
                                            id: 'antilink_disable'
                                        }
                                    ]
                                },
                                {
                                    title: '⚡ الإجراء عند المخالفة',
                                    rows: [
                                        {
                                            header: '🗑️',
                                            title: 'حذف + تحذير (3 مرات)',
                                            description: 'حذف الرسالة وتحذير بعد 3 مخالفات',
                                            id: 'antilink_set_delete_3'
                                        },
                                        {
                                            header: '🗑️',
                                            title: 'حذف + تحذير (5 مرات)',
                                            description: 'حذف الرسالة وتحذير بعد 5 مخالفات',
                                            id: 'antilink_set_delete_5'
                                        },
                                        {
                                            header: '🚫',
                                            title: 'طرد فوري',
                                            description: 'طرد العضو فور نشر رابط ممنوع',
                                            id: 'antilink_set_kick'
                                        }
                                    ]
                                },
                                {
                                    title: '📋 معلومات إضافية',
                                    rows: [
                                        {
                                            header: '📊',
                                            title: 'عرض الحالة التفصيلية',
                                            description: 'إحصائيات المخالفين والتحذيرات',
                                            id: 'antilink_status'
                                        },
                                        {
                                            header: '🌐',
                                            title: 'قائمة المواقع المسموحة',
                                            description: `${allowedDomains.length} موقع مسموح حالياً`,
                                            id: 'antilink_list'
                                        }
                                    ]
                                }
                            ]
                        })
                    },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📖 دليل الاستخدام',
                            url: 'https://whatsapp.com/channel/0029VbD5Wf1JUM2VtknMSj0R'
                        })
                    }
                ]
            }, { quoted: msg });
            return;
        }

        const opt = args[0].toLowerCase();

        // تفعيل
        if (opt === 'تفعيل' || opt === 'تشغيل') {
            if (groupSettings.antilink) return reply('⚠️ *منع الروابط مفعل بالفعل*');
            database.updateGroupSettings(from, {
                antilink: true,
                antilinkAction: groupSettings.antilinkAction || 'delete',
                maxWarnings: groupSettings.maxWarnings || 3
            });
            return reply('✅ *تم تفعيل منع الروابط*');
        }

        // تعطيل
        if (opt === 'تعطيل' || opt === 'ايقاف') {
            if (!groupSettings.antilink) return reply('⚠️ *منع الروابط معطل بالفعل*');
            database.updateGroupSettings(from, { antilink: false });
            return reply('❌ *تم تعطيل منع الروابط*');
        }

        // تعيين
        if (opt === 'تعيين') {
            if (args.length < 2) return reply('⚠️ *الخيارات: حذف [عدد] / طرد / سماح / منع*\nمثال: .منع_روابط تعيين حذف 3');
            const setType = args[1].toLowerCase();

            if (setType === 'حذف') {
                const maxWarnings = parseInt(args[2]) || 3;
                database.updateGroupSettings(from, { antilinkAction: 'delete', maxWarnings, antilink: true });
                return reply(`🗑️ *تم التعيين*\nالإجراء: حذف + تحذير\nالحد: ${maxWarnings} مرات`);
            }
            if (setType === 'طرد') {
                database.updateGroupSettings(from, { antilinkAction: 'kick', antilink: true });
                return reply(`🚫 *تم التعيين*\nالإجراء: طرد فوري`);
            }
            if (setType === 'سماح' && args[2]) {
                const domain = args[2].toLowerCase();
                if (!allowedDomains.includes(domain)) {
                    allowedDomains.push(domain);
                    return reply(`✅ *تم إضافة الموقع*\n${domain}`);
                }
                return reply(`⚠️ *الموقع موجود بالفعل*\n${domain}`);
            }
            if (setType === 'منع' && args[2]) {
                const domain = args[2].toLowerCase();
                const index = allowedDomains.indexOf(domain);
                if (index !== -1) {
                    allowedDomains.splice(index, 1);
                    return reply(`❌ *تم حذف الموقع من المسموحين*\n${domain}`);
                }
                return reply(`⚠️ *الموقع غير موجود*\n${domain}`);
            }
            return reply('⚠️ *اختر: حذف / طرد / سماح / منع*');
        }

        // حالة
        if (opt === 'حالة' || opt === 'status') {
            const isEnabled = groupSettings.antilink;
            const action = groupSettings.antilinkAction || 'delete';
            const maxWarnings = groupSettings.maxWarnings || 3;
            return reply(
                `📊 *حالة منع الروابط*\n\n` +
                `┌─⪻ *AntiLink* ⪼─┐\n` +
                `│ الحالة: ${isEnabled ? '✅ مفعل' : '❌ معطل'}\n` +
                `│ الإجراء: ${action === 'kick' ? '🚫 طرد فوري' : `🗑️ حذف (${maxWarnings})`}\n` +
                `│ المسموح: ${allowedDomains.length} موقع\n` +
                `└─────────────────`
            );
        }

        // مسح تحذيرات
        if (opt === 'مسح' && args[1]) {
            const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            if (mention) {
                const userId = mention.split('@')[0];
                database.clearWarnings(from, userId);
                return reply(`✅ *تم مسح تحذيرات* @${userId}`, { mentions: [mention] });
            }
            return reply('⚠️ *قم بمنشن العضو*\nمثال: .منع_روابط مسح @مستخدم');
        }

        // قائمة
        if (opt === 'قائمة' || opt === 'list') {
            const domainList = allowedDomains.slice(0, 15).join('، ');
            return reply(
                `🌐 *المواقع المسموحة*\n\n${domainList}` +
                `${allowedDomains.length > 15 ? `\n...و ${allowedDomains.length - 15} موقع آخر` : ''}\n\n` +
                `📊 الإجمالي: ${allowedDomains.length} موقع`
            );
        }

        return reply('❌ *أمر غير معروف*\nاستخدم .منع_روابط للمساعدة');
    }
};

module.exports.checkAntilink = checkAntilink;
