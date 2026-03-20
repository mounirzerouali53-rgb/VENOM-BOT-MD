const fs = require('fs');

const path = require('path');

const dbPath = path.join(__dirname, '../database/wallets.json');

function loadDB() {

    try {

        if (!fs.existsSync(dbPath)) {

            const initialData = { users: {} };

            fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));

            return initialData;

        }

        return JSON.parse(fs.readFileSync(dbPath));

    } catch (error) {

        console.error('خطأ في تحميل قاعدة البيانات:', error);

        return { users: {} };

    }

}

function saveDB(data) {

    try {

        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

    } catch (error) {

        console.error('خطأ في حفظ قاعدة البيانات:', error);

    }

}

function getUserData(db, userId) {

    try {

        // التحقق من صحة userId

        if (!userId) {

            console.error('userId غير معرف');

            return {

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

        // تنظيف الـ userId من أي بيانات زائدة

        const cleanUserId = userId.split(':')[0]; // إزالة أي جزء بعد :

        

        // التأكد من وجود المستخدم

        if (!db.users[cleanUserId]) {

            db.users[cleanUserId] = {

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

        return db.users[cleanUserId];

    } catch (error) {

        console.error('خطأ في getUserData:', error);

        return {

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

}

module.exports = { loadDB, saveDB, getUserData };
