/**

 * حذف رسالة

 */

module.exports = {

  name: 'حذف',

  aliases: [],

  description: 'حذف رسالة بالرد عليها',

  usage: '.حذف (قم بالرد على الرسالة)',

  category: 'admin',

  groupOnly: true,

  adminOnly: true,

  botAdminNeeded: true,

  

  async execute(sock, msg, args, extra) {

    try {

      const ctx = msg.message?.extendedTextMessage?.contextInfo;

      

      if (!ctx?.stanzaId || !ctx?.participant) {

        return extra.reply('❌ *قم بالرد على الرسالة التي تريد حذفها*');

      }

      

      const deleteKey = { 

        remoteJid: extra.from, 

        id: ctx.stanzaId, 

        participant: ctx.participant 

      };

      

      await sock.sendMessage(extra.from, { delete: deleteKey });

      return extra.reply('✅ *تم حذف الرسالة بنجاح*');

      

    } catch (error) {

      console.error('حذف error:', error);

      await extra.reply('❌ *فشل حذف الرسالة*');

    }

  }

};