const { loadDB, saveDB, getUserData } = require('../../lib/database');

const flags = require('../../data/flags'); // ملف الأعلام

let flagGames = new Map();

module.exports = {

    name: "علم",

    aliases: ["flag", "بلد"],

    category: "games",

    description: "لعبة تخمين الأعلام",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            const sender = msg.key.participant || msg.key.remoteJid;

            if (!from.endsWith('@g.us')) {

                return await sock.sendMessage(from, {

                    text: '❌ هذه اللعبة متاحة فقط في المجموعات.'

                }, { quoted: msg });

            }

            if (flagGames.has(from)) {

                return await sock.sendMessage(from, {

                    text: '⛔ هناك لعبة جارية بالفعل!'

                }, { quoted: msg });

            }

            const flag = flags[Math.floor(Math.random() * flags.length)];

            const reward = 50;

            flagGames.set(from, { 

                answer: flag.name,

                reward: reward,

                attempts: new Map()

            });

            const sentMsg = await sock.sendMessage(from, {

                text: `*╔═══〔 🚩 لعبة الأعلام 〕═══╗*\n\n` +

                      `*🚩 العلم:* ${flag.flag}\n` +

                      `*💰 الجائزة:* ${reward} ذهب\n` +

                      `*⏳ الوقت:* 20 ثانية\n\n` +

                      `*✍️ اكتب اسم الدولة فقط!*`

            }, { quoted: msg });

            setTimeout(async () => {

                if (flagGames.has(from)) {

                    const game = flagGames.get(from);

                    await sock.sendMessage(from, {

                        text: `*⏳ انتهى الوقت!*\n*🚩 الدولة هي:* ${game.answer}`

                    });

                    flagGames.delete(from);

                }

            }, 20000);

        } catch (error) {

            console.error('خطأ في لعبة الأعلام:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    },

    async checkAnswer(sock, msg, userInput) {

        try {

            const from = msg.key.remoteJid;

            const sender = msg.key.participant || msg.key.remoteJid;

            if (!flagGames.has(from)) return false;

            const game = flagGames.get(from);

            const attempts = game.attempts;

            if (attempts.get(sender) >= 2) return false;

            if (userInput.toLowerCase().trim() === game.answer.toLowerCase()) {

                const db = loadDB();

                const user = getUserData(db, sender);

                user.gold += game.reward;

                saveDB(db);

                await sock.sendMessage(from, {

                    text: `*✅ إجابة صحيحة!*\n*👤 @${sender.split('@')[0]}*\n*💰 +${game.reward} ذهب*`,

                    mentions: [sender]

                });

                flagGames.delete(from);

                return true;

            } else {

                attempts.set(sender, (attempts.get(sender) || 0) + 1);

                await sock.sendMessage(from, {

                    react: { text: '❌', key: msg.key }

                });

                return false;

            }

        } catch (error) {

            console.error('خطأ في التحقق:', error);

            return false;

        }

    }

};