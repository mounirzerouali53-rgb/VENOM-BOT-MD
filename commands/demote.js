/**

 * نزع صلاحية الأدمن

 */

const { findParticipant } = require('../../utils/jidHelper');

module.exports = {

  name: 'نزع_ادمن',

  aliases: [],

  category: 'admin',

  description: 'نزع صلاحية الأدمن من عضو',

  usage: '.نزع_ادمن @العضو',

  groupOnly: true,

  adminOnly: true,

  botAdminNeeded: true,

  

  async execute(sock, msg, args, extra) {

    try {

      let target;

      const ctx = msg.message?.extendedTextMessage?.contextInfo;

      const mentioned = ctx?.mentionedJid || [];

      

      if (mentioned && mentioned.length > 0) {

        target = mentioned[0];

      } else if (ctx?.participant && ctx.stanzaId && ctx.quotedMessage) {

        target = ctx.participant;

      } else {

        return extra.reply('❌ *قم بمنشن العضو أو الرد على رسالته*');

      }

      

      const freshMetadata = await sock.groupMetadata(extra.from);

      const foundParticipant = findParticipant(freshMetadata.participants, target);

      

      if (!foundParticipant) {

        return extra.reply('❌ *العضو غير موجود في المجموعة*');

      }

      

      if (foundParticipant.admin !== 'admin' && foundParticipant.admin !== 'superadmin') {

        return extra.reply('❌ *هذا العضو ليس أدمن*');

      }

      

      await sock.groupParticipantsUpdate(extra.from, [target], 'demote');

      

      await sock.sendMessage(extra.from, {

        text: `✅ *@${target.split('@')[0]} لم يعد أدمن*`,

        mentions: [target]

      }, { quoted: msg });

      

    } catch (error) {

      await extra.reply(`❌ *حدث خطأ: ${error.message}*`);

    }

  }

};