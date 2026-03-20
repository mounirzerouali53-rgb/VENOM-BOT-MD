/**

 * صنع - تحويل النص لستيكر متحرك

 */

const { spawn } = require('child_process');

const { writeExifVid } = require('../../utils/exif');

module.exports = {

  name: 'صنع',

  aliases: ['تيك'],

  category: 'عام',

  description: 'تحويل النص لستيكر متحرك',

  usage: '.صنع <نص>',

  async execute(sock, msg, args, extra) {

    try {

      if (!args[0]) return extra.reply('*❌ دخل النص! مثال: .صنع سلام*');

      const text = args.join(' ');

      if (text.length > 50) return extra.reply('*❌ النص طويل! الحد 50 حرف*');

      try {

        const mp4Buffer = await renderBlinkingVideo(text);

        const webpBuffer = await writeExifVid(mp4Buffer, { packname: 'Knight Bot' });

        await sock.sendMessage(extra.from, { sticker: webpBuffer }, { quoted: msg });

      } catch {

        extra.reply('*❌ فشل إنشاء الستيكير*');

      }

    } catch {

      extra.reply('*❌ خطأ أثناء إنشاء الستيكير*');

    }

  }

};

function renderBlinkingVideo(text) {

  return new Promise((resolve, reject) => {

    const font = process.platform === 'win32'

      ? 'C:/Windows/Fonts/arialbd.ttf'

      : '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

    const safeText = text.replace(/\\/g,'\\\\').replace(/'/g,"\\'");

    const dur = 1.8;

    const cycle = 0.3;

    const red = `drawtext=fontfile='${font}':text='${safeText}':fontcolor=red:borderw=2:bordercolor=black@0.6:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='lt(mod(t\\,${cycle})\\,0.1)'`;

    const blue = `drawtext=fontfile='${font}':text='${safeText}':fontcolor=blue:borderw=2:bordercolor=black@0.6:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(mod(t\\,${cycle})\\,0.1\\,0.2)'`;

    const green = `drawtext=fontfile='${font}':text='${safeText}':fontcolor=green:borderw=2:bordercolor=black@0.6:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2:enable='gte(mod(t\\,${cycle})\\,0.2)'`;

    const args = [

      '-y', '-f','lavfi','-i',`color=c=black:s=512x512:d=${dur}:r=20`,

      '-vf', `${red},${blue},${green}`,

      '-c:v','libx264','-pix_fmt','yuv420p',

      '-movflags','+faststart+frag_keyframe+empty_moov',

      '-t', dur.toString(), '-f','mp4','pipe:1'

    ];

    const ff = spawn('ffmpeg', args);

    const chunks = []; const errors = [];

    ff.stdout.on('data', d => chunks.push(d));

    ff.stderr.on('data', e => errors.push(e));

    ff.on('error', reject);

    ff.on('close', code => code === 0 ? resolve(Buffer.concat(chunks)) : reject(new Error(Buffer.concat(errors).toString())));

  });

}