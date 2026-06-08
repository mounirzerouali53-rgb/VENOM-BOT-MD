/**
 * أمر "تست" - إرسال فيديو PTV + خاصية التحديث (اضف)
 * الهيكل: VENOM Style
 */

const path = require('path');
const fs = require('fs');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// إطار VENOM الاحترافي للنصوص
const FRAME = `╭━━━━━━━━━━━━━━━━━━━━━━╮\n┃  ⚔️   قَائِدُ الـتَّـارِيـخْ   ⚔️  ┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n⚡︎────────────────────⚡︎\n  │ `;
const FRAME_END = `\n⚡︎────────────────────⚡︎\n╭━━━━━━━━━━━━━━━━━━━━━━╮\n┃   ✠  أَدُولْفْ هِيتْلَرْ  ✠   ┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯`;

module.exports = {
    name: 'تست',
    aliases: ['test'],
    category: 'اختبار',
    description: 'يرسل فيديو PTV أو يضيف فيديو جديد إذا تم الرد بـ ".تست اضف"',
    usage: '.تست | .تست اضف (عند الرد على فيديو)',
    ownerOnly: false,

    async execute(sock, msg, args, extra) {
        try {
            const chatId = extra.from;
            const videoPath = path.join(__dirname, '../../utils/note.mp4');

            // --- خاصية إضافة فيديو جديد ---
            if (args[0] === 'اضف') {
                const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
                const videoMessage = quotedMsg?.videoMessage;

                if (!videoMessage) {
                    return await extra.reply('❌ عفاك رد على فيديو وكتب ".تست اضف" باش يتبدل الفيديو القديم.');
                }

                await extra.reply('⏳ جاري تحميل وتحديث الفيديو... صبر شوية.');

                // تحميل الفيديو من سيرفرات واتساب
                const stream = await downloadContentFromMessage(videoMessage, 'video');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                // حفظ الفيديو فالمسار المحدد (كيمسح القديم ويحط الجديد بنفس السمية)
                fs.writeFileSync(videoPath, buffer);

                return await extra.reply('✅ تم تحديث فيديو الـ PTV بنجاح! جرب دابا ".تست"');
            }

            // --- خاصية إرسال الفيديو (الأساسية) ---
            if (!fs.existsSync(videoPath)) {
                throw new Error('ملف الفيديو غير موجود. صيفط فيديو ورد عليه بـ ".تست اضف" أولا.');
            }

            // 1️⃣ إرسال الفيديو كـ PTV
            await sock.sendMessage(chatId, {
                video: { url: videoPath },
                mimetype: 'video/mp4',
                ptv: true,
            });

            // 2️⃣ إرسال النص المزخرف
            const messageText = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃  ⚔️   فَلْسَفَةُ الـقُـوَّة   ⚔️  ┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
⚡︎────────────────────⚡︎
  │ 
  │  🦅 " لَقَدْ كَانَ بِمَقْدُورِي أَنْ 
  │  أُبِيدَ كُلَّ أَعْدَائِي.. لَكِنِّي 
  │  تَرَكْتُ بَعْضاً مِنْهُمْ لِتَعْرِفُوا 
  │  لِمَاذَا كُنْتُ أُبِيدُهُمْ. "
  │ 
⚡︎────────────────────⚡︎
╭━━━━━━━━━━━━━━━━━━━━━━╮
┃   ✠  أَدُولْفْ هِيتْلَرْ  ✠   ┃
╰━━━━━━━━━━━━━━━━━━━━━━╯
`;
            await sock.sendMessage(chatId, {
                text: messageText
            });

        } catch (error) {
            console.error('Error in "تست" command:', error);
            await extra.reply(`❌ حدث خطأ: ${error.message}`);
        }
    }
};
