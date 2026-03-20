/**

 * أمر تحميل اغنية من يوتيوب

 */

const yts = require('yt-search');

const fs = require('fs');

const path = require('path');

const axios = require('axios');

const APIs = require('../../utils/api');

const { toAudio } = require('../../utils/converter');

module.exports = {

  name: 'اغنية',

  aliases: ['موسيقى','اغنيه','song','play','music','yta'],

  category: 'media',

  description: 'تحميل اغنية من يوتيوب',

  usage: '.اغنية <اسم الاغنية او الرابط>',

  

  async execute(sock, msg, args) {

    try {

      const text = args.join(' ');

      const chatId = msg.key.remoteJid;

      

      if (!text) {

        return await sock.sendMessage(chatId, { 

          text: '❌ *اكتب اسم الاغنية او رابط يوتيوب.*' 

        }, { quoted: msg });

      }

      

      let video;

      

      if (text.includes('youtube.com') || text.includes('youtu.be')) {

        video = { url: text };

      } else {

        const search = await yts(text);

        if (!search || !search.videos.length) {

          return await sock.sendMessage(chatId, { 

            text: '❌ *لم يتم العثور على نتائج.*' 

          }, { quoted: msg });

        }

        video = search.videos[0];

      }

      

      await sock.sendMessage(chatId, {

        image: { url: video.thumbnail },

        caption: `🎵 *جاري تحميل: ${video.title}*`

      }, { quoted: msg });

      

      let audioData;

      let audioBuffer;

      let downloadSuccess = false;

      

      const apiMethods = [

        { method: () => APIs.getEliteProTechDownloadByUrl(video.url) },

        { method: () => APIs.getYupraDownloadByUrl(video.url) },

        { method: () => APIs.getOkatsuDownloadByUrl(video.url) },

        { method: () => APIs.getIzumiDownloadByUrl(video.url) }

      ];

      

      for (const apiMethod of apiMethods) {

        try {

          audioData = await apiMethod.method();

          const audioUrl = audioData.download || audioData.dl || audioData.url;

          

          if (!audioUrl) continue;

          

          const audioResponse = await axios.get(audioUrl, {

            responseType: 'arraybuffer',

            timeout: 90000

          });

          

          audioBuffer = Buffer.from(audioResponse.data);

          

          if (audioBuffer && audioBuffer.length > 0) {

            downloadSuccess = true;

            break;

          }

          

        } catch {}

      }

      

      if (!downloadSuccess || !audioBuffer) {

        throw new Error();

      }

      let finalBuffer = await toAudio(audioBuffer, 'm4a');

      await sock.sendMessage(chatId, {

        audio: finalBuffer,

        mimetype: 'audio/mpeg',

        fileName: `${(audioData.title || video.title || 'song').replace(/[^\w\s-]/g, '')}.mp3`,

        ptt: false

      }, { quoted: msg });

    } catch (err) {

      console.error('Song command error:', err);

      await sock.sendMessage(msg.key.remoteJid, { 

        text: '❌ *فشل تحميل الاغنية.*' 

      }, { quoted: msg });

    }

  }

};
