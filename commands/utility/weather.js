/**

 * أمر الطقس - الحصول على معلومات الطقس باستخدام OpenWeather API

 */

const axios = require('axios');

module.exports = {

  name: 'طقس',

  aliases: ['w', 'clima'],

  category: 'utility',

  description: 'الحصول على الطقس لمدينة معينة',

  usage: '.طقس <المدينة>',

  

  async execute(sock, msg, args) {

    try {

      if (args.length === 0) {

        return await sock.sendMessage(msg.key.remoteJid, { 

          text: '❌ *الاستخدام: .طقس <المدينة>*\nمثال: .طقس London' 

        }, { quoted: msg });

      }

      

      const city = args.join(' ');

      const apiKey = '4902c0f2550f58298ad4146a92b65e10';

      

      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);

      const weather = response.data;

      

      const weatherText = `*الطقس في ${weather.name}:* ${weather.weather[0].description}. *درجة الحرارة:* ${weather.main.temp}°C.`;

      

      await sock.sendMessage(msg.key.remoteJid, { text: weatherText }, { quoted: msg });

      

    } catch (error) {

      console.error('خطأ في جلب الطقس:', error);

      await sock.sendMessage(msg.key.remoteJid, { text: '❌ *عذراً، لم أتمكن من جلب بيانات الطقس الآن.*' }, { quoted: msg });

    }

  }

};