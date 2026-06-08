/**

 * أمر الإشارة_للجميع - الإشارة لكل أعضاء الجروب

 */

module.exports = {

    name: 'الإشارة_للجميع',

    aliases: ['الإشارة_لكل', 'الجميع'],

    category: 'إدارة',

    description: 'الإشارة لكل أعضاء الجروب',

    usage: '.الإشارة_للجميع <الرسالة>',

    groupOnly: true,

    ownerOnly: true,    

    async execute(sock, msg, args, extra) {

      try {

        const message = args.join(' ') || 'إلى الجميع!';

        

        const participants = extra.groupMetadata.participants.map(p => p.id);

        

        let text = `📢 *إعلان الجروب*\n\n`;

        text += `${message}\n\n`;

        text += `👥 الأعضاء المشار إليهم:\n`;

        

        participants.forEach((participant, index) => {

          text += `${index + 1}. @${participant.split('@')[0]}\n`;

        });

        

        await sock.sendMessage(extra.from, {

          text,

          mentions: participants

        }, { quoted: msg });

        

      } catch (error) {

        await extra.reply(`*❌ خطأ: ${error.message}*`);

      }

    }

};