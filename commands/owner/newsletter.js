/**

 * أمر نشرة_إخبارية - الحصول على معلومات قناة واتساب

 */

/**

 * استخراج كود الدعوة من رابط قناة واتساب

 * @param {string} link - رابط القناة

 * @returns {string|null} - كود الدعوة أو null إذا غير صالح

 */

function getChannelInviteCode(link) {

  try {

    let cleanLink = link.trim();

    cleanLink = cleanLink.split('?')[0].split('#')[0];

    try {

      const url = new URL(cleanLink);

      const parts = url.pathname.split('/').filter(Boolean);

      const code = parts[parts.length - 1];

      if (code && code.length > 0) return code;

    } catch {}

    const patterns = [

      /(?:whatsapp\.com|wa\.me)\/channel\/([A-Za-z0-9]+)/i,

      /\/channel\/([A-Za-z0-9]+)/i,

      /channel\/([A-Za-z0-9]+)/i

    ];

    for (const pattern of patterns) {

      const match = cleanLink.match(pattern);

      if (match && match[1]) return match[1];

    }

    if (/^[A-Za-z0-9]+$/.test(cleanLink)) return cleanLink;

    return null;

  } catch (error) {

    console.error('*خطأ استخراج كود الدعوة:*', error);

    return null;

  }

}

module.exports = {

  name: 'نشرة_إخبارية',

  aliases: ['nl', 'قناة', 'معلومات_القناة'],

  category: 'المالك',

  description: 'الحصول على معلومات قناة واتساب من رابط القناة',

  usage: '.نشرة_إخبارية <رابط القناة>',

  ownerOnly: true,

  

  async execute(sock, msg, args, extra) {

    try {

      const chatId = extra.from;

      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || args.join(' ');

      

      if (!text || text.trim().length === 0) {

        return extra.reply('*❌ رجاءً ضع رابط قناة واتساب!*\n*مثال: .نشرة_إخبارية https://whatsapp.com/channel/0029VaAbCdEfGhIJkL*');

      }

      

      let link = text.replace(/^\.(newsletter|nl|channel|channelinfo)\s+/i, '').trim() || args.join(' ').trim();

      if (!link || link.length === 0) {

        return extra.reply('*❌ رجاءً ضع رابط قناة واتساب صالح!*');

      }

      

      const inviteCode = getChannelInviteCode(link);

      if (!inviteCode) {

        return extra.reply('*❌ لم أستطع استخراج كود الدعوة من الرابط!*\n*رجاءً ضع رابط قناة صالح أو الكود مباشرة.*');

      }

      link = inviteCode;

      

      try {

        const meta = await sock.newsletterMetadata('invite', link);

        if (!meta) throw new Error('Newsletter not found');

        

        let infoText = `${meta.id || 'N/A'}\n`;

        if (meta.description) infoText += `📝 *الوصف:* ${meta.description}\n`;

        if (meta.invite) infoText += `🔗 *كود الدعوة:* \`${meta.invite}\`\n`;

        if (meta.subscriberCount !== undefined) infoText += `👥 *عدد المشتركين:* ${meta.subscriberCount.toLocaleString()}\n`;

        if (meta.creationTime) {

          const date = new Date(meta.creationTime * 1000);

          infoText += `📅 *تاريخ الإنشاء:* ${date.toLocaleDateString()}\n`;

        }

        if (meta.image) {

          await sock.sendMessage(chatId, {

            image: { url: meta.image },

            caption: infoText

          }, { quoted: msg });

        } else {

          await sock.sendMessage(chatId, { text: infoText }, { quoted: msg });

        }

      } catch (error) {

        console.error('*خطأ أمر النشرة الإخبارية:*', error);

        if (error.message.includes('Invalid channel link')) {

          await extra.reply('*❌ رابط القناة غير صالح!*\n*رجاءً ضع رابط قناة واتساب صالح.*');

        } else if (error.message.includes('Newsletter not found')) {

          await extra.reply('*❌ لم يتم العثور على النشرة!*\n*قد يكون الرابط خاطئ أو القناة غير موجودة.*');

        } else if (error.message.includes('newsletterMetadata')) {

          await extra.reply('*❌ ميزة النشرة غير متوفرة!*\n*تأكد من استخدام Baileys v7.0.0-rc أو أعلى.*');

        } else {

          await extra.reply(`*❌ فشل الحصول على معلومات النشرة: ${error.message}*`);

        }

      }

    } catch (error) {

      console.error('*خطأ أمر النشرة الإخبارية:*', error);

      await extra.reply(`*❌ حدث خطأ: ${error.message}*`);

    }

  }

};