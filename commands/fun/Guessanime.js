const fs = require('fs');

const path = require('path');

const walletsFile = path.join(__dirname, '../../database/wallets.json');

// دالة تحميل المحافظ بالهيكلة الصحيحة

function loadWallets() {

    if (!fs.existsSync(walletsFile)) {

        // إنشاء ملف جديد بالهيكلة الصحيحة

        const initialData = { users: {} };

        fs.writeFileSync(walletsFile, JSON.stringify(initialData, null, 2));

        return initialData;

    }

    

    try {

        const data = JSON.parse(fs.readFileSync(walletsFile));

        // التأكد من وجود هيكل users حتى لو كان الملف قديماً

        if (!data.users) {

            data.users = {};

            // تحويل البيانات القديمة إلى الهيكل الجديد إذا وجدت

            Object.keys(data).forEach(key => {

                if (key !== 'users' && data[key] && typeof data[key] === 'object') {

                    data.users[key] = {

                        diamonds: 0,

                        gold: data[key].ذهب || 0,

                        silver: 0,

                        bronze: 0,

                        cash: 0,

                        bank: 0,

                        crypto: 0,

                        rank: "مبتدئ"

                    };

                }

            });

        }

        return data;

    } catch (error) {

        console.error('خطأ في تحميل المحفظة:', error);

        return { users: {} };

    }

}

// دالة حفظ المحافظ

function saveWallets(data) {

    try {

        fs.writeFileSync(walletsFile, JSON.stringify(data, null, 2));

    } catch (error) {

        console.error('خطأ في حفظ المحفظة:', error);

    }

}

const activeGames = new Map();

const characters = [

  { img: "https://files.catbox.moe/fee0ba.jpg", answers: ["سوكونا"] },

  { img: "https://files.catbox.moe/lstyrm.png", answers: ["غوجو"] },

  { img: "https://files.catbox.moe/0tv9a1.png", answers: ["ناروتو"] },

  { img: "https://files.catbox.moe/hwuf4f.png", answers: ["زورو"] },

  { img: "https://files.catbox.moe/kydyid.png", answers: ["تانجيرو"] },

  { img: "https://files.catbox.moe/1wumh6.png", answers: ["ميكاسا"] },

  { img: "https://files.catbox.moe/gd2b9e.png", answers: ["غوكو"] },

  { img: "https://files.catbox.moe/zpzo1c.png", answers: ["سايتاما"] },

  { img: "https://files.catbox.moe/xyxjc6.png", answers: ["كيلوا"] },

  { img: "https://files.catbox.moe/zeo0kp.png", answers: ["لايت"] }

];

module.exports = {

  name: 'تخمين',

  aliases: ['خمن'],

  category: 'group',

  description: 'لعبة تخمين الشخصيات',

  usage: '.تخمين',

  async execute(sock, msg, args, extra) {

    try {

      const chatId = extra.from;

      if (activeGames.has(chatId)) {

        return await sock.sendMessage(chatId, {

          text: '⛔ | هناك لعبة جارية بالفعل!'

        }, { quoted: msg });

      }

      const correctChar = characters[Math.floor(Math.random() * characters.length)];

      const correctAnswer = correctChar.answers[0];

      let options = [correctAnswer];

      while (options.length < 3) {

        const randomName = characters[Math.floor(Math.random() * characters.length)].answers[0];

        if (!options.includes(randomName)) options.push(randomName);

      }

      options = options.sort(() => Math.random() - 0.5);

      activeGames.set(chatId, { correctAnswer });

      const caption = `

╭━━━〔 👤 *تحدي الشخصيات* 〕━━━╮

┃ ⚡ خمن من في الصورة؟

┃

┃ 1️⃣ - ${options[0]}

┃ 2️⃣ - ${options[1]}

┃ 3️⃣ - ${options[2]}

┃

┃ 💰 المكافأة: 200 ذهب

┃ ⏳ الوقت: 25 ثانية

╰━━━━━━━━━━━━━━━━━━╯

✍️ اكتب اسم الشخصية فقط!

      `.trim();

      await sock.sendMessage(chatId, {

        image: { url: correctChar.img },

        caption: caption

      }, { quoted: msg });

      const timeout = setTimeout(async () => {

        if (activeGames.has(chatId)) {

          await sock.sendMessage(chatId, {

            text: `⏳ انتهى الوقت!\n👤 الشخصية هي: *${correctAnswer}*`

          });

          activeGames.delete(chatId);

        }

      }, 25000);

      const handler = async ({ messages }) => {

        const m = messages[0];

        if (!m.message) return;

        if (m.key.remoteJid !== chatId) return;

        if (m.key.fromMe) return;

        const userInput = (m.message.conversation || m.message.extendedTextMessage?.text || "").trim();

        const game = activeGames.get(chatId);

        if (!game) return;

        if (userInput === game.correctAnswer) {

          clearTimeout(timeout);

          const sender = m.key.participant || m.key.remoteJid;

          

          // تحميل المحفظة بالهيكلة الجديدة

          const wallets = loadWallets();

          

          // التأكد من وجود المستخدم في قاعدة البيانات

          if (!wallets.users[sender]) {

            wallets.users[sender] = {

              diamonds: 0,

              gold: 0,

              silver: 0,

              bronze: 0,

              cash: 0,

              bank: 0,

              crypto: 0,

              rank: "مبتدئ"

            };

          }

          

          // إضافة الذهب للفائز

          wallets.users[sender].gold += 200;

          

          // حفظ التحديثات

          saveWallets(wallets);

          await sock.sendMessage(chatId, {

            text: `✅ إجابة صحيحة!\n👤 الشخصية: *${game.correctAnswer}*\n🥇 +200 ذهب`,

            mentions: [sender]

          }, { quoted: m });

          activeGames.delete(chatId);

          sock.ev.off('messages.upsert', handler);

        }

      };

      sock.ev.on('messages.upsert', handler);

    } catch (err) {

      await extra.reply(`❌ حدث خطأ: ${err.message}`);

    }

  }

};