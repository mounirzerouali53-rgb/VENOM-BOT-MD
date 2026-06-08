/**
 * أمر تجربة الأزرار - نسخة generateWAMessageFromContent
 * الاستخدام: .buttons
 */

const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys');

module.exports = {
  name: 'buttons',
  aliases: ['btns', 'azrar'],
  description: 'تجربة أزرار تفاعلية',
  usage: '.buttons',
  ownerOnly: false,
  groupOnly: false,
  adminOnly: false,

  async execute(sock, msg, args, { from, reply, react }) {
    try {
      await react('⏳');

      // بناء الرسالة يدوياً عبر proto
      const interactiveMsg = generateWAMessageFromContent(from, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadataVersion: 2,
              deviceListMetadata: {}
            },
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({
                text: '🎛️ *اختر خياراً من الأزرار أدناه:*\n\nهذه تجربة لنظام الأزرار التفاعلية!'
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: '✨ بوت الأزرار التجريبي'
              }),
              header: proto.Message.InteractiveMessage.Header.create({
                hasMediaAttachment: false
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: [
                  {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({ display_text: '🟢 الخيار الأول', id: 'btn_one' })
                  },
                  {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({ display_text: '🔵 الخيار الثاني', id: 'btn_two' })
                  },
                  {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({ display_text: '🔴 الخيار الثالث', id: 'btn_three' })
                  }
                ]
              })
            })
          }
        }
      }, { quoted: msg, userJid: sock.user.id });

      await sock.relayMessage(from, interactiveMsg.message, {
        messageId: interactiveMsg.key.id
      });

      await react('✅');

    } catch (error) {
      console.error('[Buttons Command Error]:', error);
      await reply(
        '❌ *فشل إرسال الأزرار*\n\n' +
        `السبب: ${error.message}\n\n` +
        '💡 تأكد أن إصدار Baileys محدث:\n`npm update @whiskeysockets/baileys`'
      );
    }
  }
};
