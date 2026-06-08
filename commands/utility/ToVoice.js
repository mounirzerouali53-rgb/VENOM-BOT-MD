const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const { exec } = require('child_process');

const fs = require('fs');

const path = require('path');

module.exports = {

    name: "صوت",

    aliases: ["toaudio", "للصوت"],

    category: "media",

    description: "تحويل الفيديو إلى صوت",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted || !quoted.videoMessage) {

                return await sock.sendMessage(from, {

                    text: '❌ رد على فيديو لتحويله إلى صوت'

                }, { quoted: msg });

            }

            const tempDir = path.join(__dirname, '../../temp');

            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const timestamp = Date.now();

            const videoPath = path.join(tempDir, `${timestamp}.mp4`);

            const audioPath = path.join(tempDir, `${timestamp}.opus`);

            const stream = await downloadContentFromMessage(quoted.videoMessage, 'video');

            const chunks = [];

            for await (const chunk of stream) chunks.push(chunk);

            fs.writeFileSync(videoPath, Buffer.concat(chunks));

            await sock.sendMessage(from, {

                text: '*🎧 جاري استخراج الصوت...*'

            }, { quoted: msg });

            exec(`ffmpeg -i "${videoPath}" -vn -c:a libopus "${audioPath}"`, async (err) => {

                if (err || !fs.existsSync(audioPath)) {

                    fs.unlinkSync(videoPath);

                    return await sock.sendMessage(from, {

                        text: '❌ فشل تحويل الفيديو'

                    }, { quoted: msg });

                }

                await sock.sendMessage(from, {

                    audio: { url: audioPath },

                    mimetype: 'audio/ogg; codecs=opus',

                    ptt: true

                }, { quoted: msg });

                fs.unlinkSync(videoPath);

                fs.unlinkSync(audioPath);

            });

        } catch (error) {

            console.error('خطأ في تحويل الصوت:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};