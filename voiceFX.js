const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const { exec } = require('child_process');

const fs = require('fs');

const path = require('path');

async function voiceEffect(sock, msg, filter) {

    try {

        const from = msg.key.remoteJid;

        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!quoted || !quoted.audioMessage) {

            return await sock.sendMessage(from, {

                text: "❌ رد على تسجيل صوتي"

            }, { quoted: msg });

        }

        const stream = await downloadContentFromMessage(quoted.audioMessage, 'audio');

        let buffer = Buffer.from([]);

        for await (const chunk of stream) {

            buffer = Buffer.concat([buffer, chunk]);

        }

        const tempDir = path.join(__dirname, '../../temp/');

        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const inputOgg = path.join(tempDir, `input-${Date.now()}.ogg`);

        const tempWav = path.join(tempDir, `temp-${Date.now()}.wav`);

        const outputOgg = path.join(tempDir, `output-${Date.now()}.ogg`);

        fs.writeFileSync(inputOgg, buffer);

        await new Promise((resolve, reject) => {

            exec(`ffmpeg -y -i "${inputOgg}" "${tempWav}"`, (err) => {

                if (err) reject(err);

                resolve();

            });

        });

        await new Promise((resolve, reject) => {

            exec(`ffmpeg -y -i "${tempWav}" -filter:a "${filter}" -c:a libopus "${outputOgg}"`, (err) => {

                if (err) reject(err);

                resolve();

            });

        });

        const out = fs.readFileSync(outputOgg);

        await sock.sendMessage(from, {

            audio: out,

            mimetype: 'audio/ogg; codecs=opus',

            ptt: true

        }, { quoted: msg });

        fs.unlinkSync(inputOgg);

        fs.unlinkSync(tempWav);

        fs.unlinkSync(outputOgg);

    } catch (error) {

        console.error('خطأ في تأثير الصوت:', error);

        throw error;

    }

}

module.exports = { voiceEffect };