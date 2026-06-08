/**

 * أمر كشف الرسائل ذات العرض لمرة واحدة - ViewOnce

 */

const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {

  name: 'كشف',

  aliases: ['viewonce', 'readvo', 'read', 'vv', 'readviewonce'],

  category: 'general',

  description: 'كشف الرسائل ذات العرض لمرة واحدة (صور، فيديو، صوت)',

  usage: '.كشف (رد على الرسالة)',

  

  async execute(sock, msg, args) {

    try {

      const chatId = msg.key.remoteJid;

      const ctx = msg.message?.extendedTextMessage?.contextInfo

        || msg.message?.imageMessage?.contextInfo

        || msg.message?.videoMessage?.contextInfo

        || msg.message?.buttonsResponseMessage?.contextInfo

        || msg.message?.listResponseMessage?.contextInfo;

      if (!ctx?.quotedMessage || !ctx?.stanzaId) {

        return await sock.sendMessage(

          chatId,

          { text: '🗑️ *رد على رسالة ذات العرض لمرة واحدة لكشفها.*' },

          { quoted: msg }

        );

      }

      const quotedMsg = ctx.quotedMessage;

      const hasViewOnce =

        !!quotedMsg.viewOnceMessageV2 ||

        !!quotedMsg.viewOnceMessageV2Extension ||

        !!quotedMsg.viewOnceMessage ||

        !!quotedMsg.viewOnce ||

        !!quotedMsg?.imageMessage?.viewOnce ||

        !!quotedMsg?.videoMessage?.viewOnce ||

        !!quotedMsg?.audioMessage?.viewOnce;

      if (!hasViewOnce) {

        return await sock.sendMessage(

          chatId,

          { text: '❌ *هذه ليست رسالة ذات عرض لمرة واحدة!*' },

          { quoted: msg }

        );

      }

      let actualMsg = null;

      let mtype = null;

      if (quotedMsg.viewOnceMessageV2Extension?.message) {

        actualMsg = quotedMsg.viewOnceMessageV2Extension.message;

        mtype = Object.keys(actualMsg)[0];

      } else if (quotedMsg.viewOnceMessageV2?.message) {

        actualMsg = quotedMsg.viewOnceMessageV2.message;

        mtype = Object.keys(actualMsg)[0];

      } else if (quotedMsg.viewOnceMessage?.message) {

        actualMsg = quotedMsg.viewOnceMessage.message;

        mtype = Object.keys(actualMsg)[0];

      } else if (quotedMsg.imageMessage?.viewOnce) {

        actualMsg = { imageMessage: quotedMsg.imageMessage };

        mtype = 'imageMessage';

      } else if (quotedMsg.videoMessage?.viewOnce) {

        actualMsg = { videoMessage: quotedMsg.videoMessage };

        mtype = 'videoMessage';

      } else if (quotedMsg.audioMessage?.viewOnce) {

        actualMsg = { audioMessage: quotedMsg.audioMessage };

        mtype = 'audioMessage';

      }

      if (!actualMsg || !mtype) {

        return await sock.sendMessage(

          chatId,

          { text: '❌ *نوع رسالة العرض لمرة واحدة غير مدعوم!*' },

          { quoted: msg }

        );

      }

      const downloadType =

        mtype === 'imageMessage'

          ? 'image'

          : mtype === 'videoMessage'

          ? 'video'

          : 'audio';

      const mediaStream = await downloadContentFromMessage(

        actualMsg[mtype],

        downloadType

      );

      let buffer = Buffer.from([]);

      for await (const chunk of mediaStream) {

        buffer = Buffer.concat([buffer, chunk]);

      }

      const caption = actualMsg[mtype]?.caption || '';

      if (/video/.test(mtype)) {

        await sock.sendMessage(

          chatId,

          {

            video: buffer,

            caption,

            mimetype: 'video/mp4'

          },

          { quoted: msg }

        );

      } else if (/image/.test(mtype)) {

        await sock.sendMessage(

          chatId,

          {

            image: buffer,

            caption,

            mimetype: 'image/jpeg'

          },

          { quoted: msg }

        );

      } else if (/audio/.test(mtype)) {

        await sock.sendMessage(

          chatId,

          {

            audio: buffer,

            ptt: true,

            mimetype: 'audio/ogg; codecs=opus'

          },

          { quoted: msg }

        );

      }

    } catch (error) {

      console.error('خطأ في أمر كشف الرسائل ذات العرض لمرة واحدة:', error);

      await sock.sendMessage(

        msg.key.remoteJid,

        {

          text: '❌ *حدث خطأ أثناء معالجة رسالة ذات عرض لمرة واحدة.*\n\n' + (error.message || '')

        },

        { quoted: msg }

      );

    }

  }

};