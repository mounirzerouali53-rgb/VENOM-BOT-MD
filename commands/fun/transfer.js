const { loadDB, saveDB, getUserData } = require('../../lib/database');

module.exports = {

    name: "تحويل",

    aliases: ["حول", "send"],

    category: "economy",

    description: "تحويل الأموال لمستخدم آخر",

    

    async execute(sock, msg, args, extra) {

        try {

            const from = extra.from;

            const sender = msg.key.participant || msg.key.remoteJid;

            

            if (!args[0] || !args[1]) {

                return await sock.sendMessage(from, {

                    text: "❌ الاستخدام: .تحويل @المستخدم المبلغ"

                }, { quoted: msg });

            }

            const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

            if (!mentioned || mentioned.length === 0) {

                return await sock.sendMessage(from, {

                    text: "❌ يرجى منشن المستخدم المرسل له"

                }, { quoted: msg });

            }

            const receiver = mentioned[0];

            const amount = parseInt(args[1]);

            if (isNaN(amount) || amount <= 0) {

                return await sock.sendMessage(from, {

                    text: "❌ المبلغ غير صحيح"

                }, { quoted: msg });

            }

            const db = loadDB();

            const senderData = getUserData(db, sender);

            const receiverData = getUserData(db, receiver);

            if (senderData.gold < amount) {

                return await sock.sendMessage(from, {

                    text: `❌ رصيدك غير كافٍ!\nرصيدك الحالي: ${senderData.gold} ذهب`

                }, { quoted: msg });

            }

            senderData.gold -= amount;

            receiverData.gold += amount;

            

            saveDB(db);

            await sock.sendMessage(from, {

                text: `✅ تم التحويل بنجاح!\n\n📤 المحول: @${sender.split("@")[0]}\n📥 المستلم: @${receiver.split("@")[0]}\n💰 المبلغ: ${amount} ذهب`,

                mentions: [sender, receiver]

            }, { quoted: msg });

        } catch (error) {

            console.error('خطأ في أمر التحويل:', error);

            await sock.sendMessage(msg.key.remoteJid, {

                text: `❌ حدث خطأ: ${error.message}`

            }, { quoted: msg });

        }

    }

};