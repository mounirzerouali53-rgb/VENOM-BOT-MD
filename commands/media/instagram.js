/**

 * أمر تحميل من إنستغرام

 */

const { igdl } = require('ruhend-scraper');

const config = require('../../config');

const processedMessages = new Set();

function extractUniqueMedia(mediaData) {

  const uniqueMedia = [];

  const seenUrls = new Set();

  

  for (const media of mediaData) {

    if (!media.url) continue;

    if (!seenUrls.has(media.url)) {

      seenUrls.add(media.url);

      uniqueMedia.push(media);

    }

  }

  return uniqueMedia;

}

module.exports = {

  name: 'انستا',

  aliases: ['ig','instagram','insta','igdl','reels'],

  category: 'media',

  description: 'تحميل الصور و الفيديوهات من انستغرام',

  usage: '.انستا <رابط>',

  

  async execute(sock, msg, args, extra) {

    try {

      const chatId = extra.from;

      if (processedMessages.has(msg.key.id)) return;

      processedMessages.add(msg.key.id);

      setTimeout(() => {

        processedMessages.delete(msg.key.id);

      }, 5 * 60 * 1000);

      const text = msg.message?.conversation || 

                   msg.message?.extendedTextMessage?.text ||

                   args.join(' ');

      

      if (!text) {

        return extra.reply('❌ *أرسل رابط منشور من إنستغرام.*');

      }

      const instagramPatterns = [

        /https?:\/\/(?:www\.)?instagram\.com\//,

        /https?:\/\/(?:www\.)?instagr\.am\//

      ];

      

      const isValidUrl = instagramPatterns.some(pattern => pattern.test(text));

      

      if (!isValidUrl) {

        return extra.reply('❌ *الرابط غير صالح.*');

      }

      await sock.sendMessage(chatId, {

        react: { text: '📥', key: msg.key }

      });

      const downloadData = await igdl(text);

      

      if (!downloadData || !downloadData.data || downloadData.data.length === 0) {

        return extra.reply('❌ *لم يتم العثور على وسائط.*');

      }

      const uniqueMedia = extractUniqueMedia(downloadData.data);

      const mediaToDownload = uniqueMedia.slice(0, 20);

      if (mediaToDownload.length === 0) {

        return extra.reply('❌ *فشل في تحميل الوسائط.*');

      }

      for (let i = 0; i < mediaToDownload.length; i++) {

        try {

          const media = mediaToDownload[i];

          const mediaUrl = media.url;

          

          const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || 

                          media.type === 'video' || 

                          text.includes('/reel/') || 

                          text.includes('/tv/');

          

          if (isVideo) {

            await sock.sendMessage(chatId, {

              video: { url: mediaUrl },

              mimetype: 'video/mp4',

              caption: `*تم التحميل بواسطة ${config.botName}*`

            }, { quoted: msg });

          } else {

            await sock.sendMessage(chatId, {

              image: { url: mediaUrl },

              caption: `*تم التحميل بواسطة ${config.botName}*`

            }, { quoted: msg });

          }

          

          if (i < mediaToDownload.length - 1) {

            await new Promise(resolve => setTimeout(resolve, 1000));

          }

          

        } catch {}

      }

    } catch (error) {

      console.error('Instagram command error:', error);

      await extra.reply('❌ *حدث خطأ أثناء التحميل.*');

    }

  }

};