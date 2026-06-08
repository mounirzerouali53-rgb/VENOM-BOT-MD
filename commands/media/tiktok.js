/**

 * TikTok Downloader - تحميل فيديوهات تيك توك

 */

const { ttdl } = require('ruhend-scraper');

const axios = require('axios');

const APIs = require('../../utils/api');

const config = require('../../config');

// Store processed message IDs to prevent duplicates

const processedMessages = new Set();

module.exports = {

  name: 'تيك',

  aliases: ['tt', 'ttdl', 'tiktokdl'],

  category: 'media',

  description: 'تحميل فيديو من تيك توك',

  usage: '.تيك <رابط TikTok>',

  

  async execute(sock, msg, args) {

    try {

      if (processedMessages.has(msg.key.id)) {

        return;

      }

      

      processedMessages.add(msg.key.id);

      

      setTimeout(() => {

        processedMessages.delete(msg.key.id);

      }, 5 * 60 * 1000);

      

      const text = msg.message?.conversation || 

                   msg.message?.extendedTextMessage?.text ||

                   args.join(' ');

      

      if (!text) {

        return await sock.sendMessage(msg.key.remoteJid, { 

          text: '*✘ المرجو إرسال رابط تيك توك لتحميل الفيديو 🎬*' 

        }, { quoted: msg });

      }

      

      const url = text.split(' ').slice(1).join(' ').trim();

      

      if (!url) {

        return await sock.sendMessage(msg.key.remoteJid, { 

          text: '*⚠️ عفواً، قم بإرسال رابط فيديو تيك توك صحيح 📎*' 

        }, { quoted: msg });

      }

      

      const tiktokPatterns = [

        /https?:\/\/(?:www\.)?tiktok\.com\//,

        /https?:\/\/(?:vm\.)?tiktok\.com\//,

        /https?:\/\/(?:vt\.)?tiktok\.com\//,

        /https?:\/\/(?:www\.)?tiktok\.com\/@/,

        /https?:\/\/(?:www\.)?tiktok\.com\/t\//

      ];

      

      const isValidUrl = tiktokPatterns.some(pattern => pattern.test(url));

      

      if (!isValidUrl) {

        return await sock.sendMessage(msg.key.remoteJid, { 

          text: '*❌ الرابط غير صالح! المرجو إرسال رابط فيديو تيك توك صحيح 🔗*' 

        }, { quoted: msg });

      }

      

      await sock.sendMessage(msg.key.remoteJid, {

        react: { text: '⏳', key: msg.key }

      });

      

      try {

        let videoUrl = null;

        let title = null;

        

        try {

          const result = await APIs.getTikTokDownload(url);

          videoUrl = result.videoUrl;

          title = result.title;

        } catch (apiError) {

          console.error(`Siputzx API failed: ${apiError.message}`);

        }

        

        if (!videoUrl) {

          try {

            let downloadData = await ttdl(url);

            if (downloadData && downloadData.data && downloadData.data.length > 0) {

              const mediaData = downloadData.data;

              for (let i = 0; i < Math.min(20, mediaData.length); i++) {

                const media = mediaData[i];

                const mediaUrl = media.url;

                const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || media.type === 'video';

                

                if (isVideo) {

                  await sock.sendMessage(msg.key.remoteJid, {

                    video: { url: mediaUrl },

                    mimetype: 'video/mp4',

                    caption: `*✨ تم التحميل بواسطة ${config.botName.toUpperCase()} ✨*`

                  }, { quoted: msg });

                } else {

                  await sock.sendMessage(msg.key.remoteJid, {

                    image: { url: mediaUrl },

                    caption: `*✨ تم التحميل بواسطة ${config.botName.toUpperCase()} ✨*`

                  }, { quoted: msg });

                }

              }

              return;

            }

          } catch (ttdlError) {

            console.error('ttdl fallback also failed:', ttdlError.message);

          }

        }

        

        if (videoUrl) {

          try {

            const videoResponse = await axios.get(videoUrl, {

              responseType: 'arraybuffer',

              timeout: 60000,

              maxContentLength: 100 * 1024 * 1024,

              headers: {

                'User-Agent': 'Mozilla/5.0',

                'Accept': 'video/mp4,video/*,*/*;q=0.9',

                'Referer': 'https://www.tiktok.com/'

              }

            });

            

            const videoBuffer = Buffer.from(videoResponse.data);

            

            if (videoBuffer.length === 0) {

              throw new Error('Video buffer is empty');

            }

            

            const botName = config.botName.toUpperCase();

            const caption = title ? `*✔️ تم التحميل بواسطة ${botName}*\n\n*📌 العنوان: ${title}*` : `*✔️ تم التحميل بواسطة ${botName}*`;

            

            await sock.sendMessage(msg.key.remoteJid, {

              video: videoBuffer,

              mimetype: 'video/mp4',

              caption: caption

            }, { quoted: msg });

            

            return;

          } catch (downloadError) {

            console.error(`Failed to download video: ${downloadError.message}`);

          }

        }

        

        return await sock.sendMessage(msg.key.remoteJid, { 

          text: '*❌ فشل تحميل الفيديو! المرجو المحاولة برابط آخر ⚠️*' 

        }, { quoted: msg });

        

      } catch (error) {

        console.error('Error in TikTok download:', error);

        await sock.sendMessage(msg.key.remoteJid, { 

          text: '*⚠️ حدث خطأ أثناء تحميل الفيديو، حاول مرة أخرى لاحقاً*' 

        }, { quoted: msg });

      }

    } catch (error) {

      console.error('Error in TikTok command:', error);

      await sock.sendMessage(msg.key.remoteJid, { 

        text: '*❌ حدث خطأ أثناء تنفيذ الطلب، المرجو المحاولة لاحقاً*' 

      }, { quoted: msg });

    }

  }

};