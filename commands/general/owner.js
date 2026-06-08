/**

 * أمر المالك - إرسال بطاقة الاتصال الخاصة بمالك البوت (vCard)

 */

const config = require('../../config');

module.exports = {

    name: 'المالك',

    aliases: ['المنشئ', 'المطور', 'مالك_البوت'],

    category: 'عام',

    description: 'عرض معلومات الاتصال بمالك البوت',

    usage: '.المالك',

    ownerOnly: false,

    async execute(sock, msg, args, extra) {

        try {

            const chatId = extra.from;

            // قائمة الأسماء والأرقام للمالكين -> تحويل كل رقم إلى vCard

            const ownerNames = Array.isArray(config.ownerName) ? config.ownerName : [config.ownerName];

            const vCards = config.ownerNumber.map((num, index) => {

                const name = ownerNames[index] || ownerNames[0] || 'مالك البوت';

                return {

                    vcard: `

BEGIN:VCARD

VERSION:3.0

FN:${name}

TEL;waid=${num}:${num}

END:VCARD

                    `.trim()

                };

            });

            const displayName = ownerNames[0] || config.ownerName || 'مالك البوت';

            await sock.sendMessage(chatId, {

                contacts: {

                    displayName: displayName,

                    contacts: vCards

                }

            });

            await extra.reply('👑 هذا هو الاتصال بمالك البوت *Owner*.');

        } catch (error) {

            console.error('Owner command error:', error);

            await extra.reply(`❌ حدث خطأ: ${error.message}`);

        }

    }

};