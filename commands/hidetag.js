/**

 * أمر اخفاء_الإشارة

 * الإشارة لكل أعضاء الجروب بصمت بدون عرض الأسماء

 * يدعم النصوص، الصور، الفيديوهات، والملصقات

 */

const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {

  name: 'اخفاء_الإشارة',

  aliases: ['مخفي'],

  description: 'الإشارة لكل أعضاء الجروب بصمت',

  usage: '.إشارة <رسالة> (أو الرد على ميديا)',

  category: 'إدارة',

  groupOnly: true,
ownerOnly:true,

  

  async execute(sock, msg, args, extra) {

    try {

      const groupMetadata = await sock.groupMetadata(extra.from);

      const participants = groupMetadata.participants || [];

      const mentions = participants.map((p) => p.id || p.lid).filter(Boolean);

      

      // التحقق واش الرسالة رد على ميديا

      const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;

      let targetMessage = msg;

      

      if (ctxInfo?.quotedMessage) {

        // بناء الرسالة المستهدفة للتحميل

        targetMessage = {

          key: {

            remoteJid: extra.from,

            id: ctxInfo.stanzaId,

            participant: ctxInfo.participant,

          },

          message: ctxInfo.quotedMessage,

        };

      }

      

      // التحقق من نوع الميديا

      const mediaMessage = 

        targetMessage.message?.imageMessage ||

        targetMessage.message?.videoMessage ||

        targetMessage.message?.stickerMessage;

      

      if (mediaMessage) {

        // تحميل وإعادة إرسال الميديا مع الإشارات

        try {

          const mediaBuffer = await downloadMediaMessage(

            targetMessage,

            'buffer',

            {},

            { logger: undefined, reuploadRequest: sock.updateMediaMessage }

          );

          

          if (targetMessage.message?.imageMessage) {

            const text = args.join(' ') || targetMessage.message.imageMessage.caption || '';

            await sock.sendMessage(extra.from, {

              image: mediaBuffer,

              caption: text,

              mentions

            }, { quoted: msg });

          } else if (targetMessage.message?.videoMessage) {

            const text = args.join(' ') || targetMessage.message.videoMessage.caption || '';

            await sock.sendMessage(extra.from, {

              video: mediaBuffer,

              caption: text,

              mentions

            }, { quoted: msg });

          } else if (targetMessage.message?.stickerMessage) {

            await sock.sendMessage(extra.from, {

              sticker: mediaBuffer,

              mentions

            }, { quoted: msg });

            

            // إذا كان هناك نص، إرساله بشكل منفصل

            const text = args.join(' ');

            if (text) {

              await sock.sendMessage(extra.from, { text, mentions }, { quoted: msg });

            }

          }

        } catch (mediaError) {

          console.error('خطأ في تحميل الميديا لأمر اخفاء_الإشارة:', mediaError);

          // الرجوع إلى نص مع الإشارات

          const text = args.join(' ') || ' ';

          await sock.sendMessage(extra.from, { text, mentions }, { quoted: msg });

        }

      } else {

        // التحقق إذا كان الرد على رسالة - إرسال محتوى الرسالة مباشرة

        if (ctxInfo?.quotedMessage) {

          // استخراج نص الرسالة المقتبسة

          const quotedText = ctxInfo.quotedMessage.conversation || 

                           ctxInfo.quotedMessage.extendedTextMessage?.text || 

                           args.join(' ') || ' ';

          

          await sock.sendMessage(extra.from, { text: quotedText, mentions }, { quoted: msg });

        } else {

          // رسالة نصية عادية

          const text = args.join(' ') || ' ';

          await sock.sendMessage(extra.from, { text, mentions }, { quoted: msg });

        }

      }

    } catch (error) {

      console.error('خطأ في أمر اخفاء_الإشارة:', error);

      await extra.reply('❌ فشل في الإشارة للأعضاء.');

    }

  },

};