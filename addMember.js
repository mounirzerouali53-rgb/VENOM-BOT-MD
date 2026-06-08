const fs = require('fs');
const path = require('path');

const MEMBERS_FILE = path.join(__dirname, '../../database/NewMembers.json');
const NICK_FILE = path.join(__dirname, '../../database/AnimeNicknames.json');

// ===============================
// 📂 تحميل وحفظ البيانات
// ===============================
function loadMembers() {
  if (!fs.existsSync(MEMBERS_FILE)) return [];
  return JSON.parse(fs.readFileSync(MEMBERS_FILE));
}

function saveMembers(data) {
  fs.writeFileSync(MEMBERS_FILE, JSON.stringify(data, null, 2));
}

function loadNicknames() {
  if (!fs.existsSync(NICK_FILE)) return [];
  return JSON.parse(fs.readFileSync(NICK_FILE));
}

function saveNicknames(data) {
  fs.writeFileSync(NICK_FILE, JSON.stringify(data, null, 2));
}

// ===============================
// 🔎 تحقق من اللقب مأخوذ
// ===============================
function isNicknameTaken(nickname) {
  const members = loadMembers();
  return members.some(m =>
    m.nickname.toLowerCase() === nickname.toLowerCase()
  );
}

// ===============================
// 👤 تحقق من العضو مسجل
// ===============================
function isMemberRegistered(number) {
  const members = loadMembers();
  return members.some(m => m.number === number);
}

module.exports = {
  name: 'ورك',
  aliases: ['register', 'تسجيل', 'members'],
  category: 'group',
  description: 'تسجيل الأعضاء وإدارة الألقاب',
  
  async execute(sock, msg, args, extra) {
    try {
      const chatId = extra.from;
      const senderId = msg.key.participant || msg.key.remoteJid;
      const messageText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      const command = args[0]?.toLowerCase();

      // التحقق من وجود أوامر فرعية
      if (command === 'قائمة' || command === 'list') {
        return await this.listMembers(sock, chatId, msg);
      } else if (command === 'حذف' || command === 'delete') {
        return await this.deleteMember(sock, chatId, msg);
      } else if (command === 'عشوائي' || command === 'random') {
        return await this.randomNickname(sock, chatId, msg);
      } else if (command === 'متبقي' || command === 'remaining') {
        return await this.remainingNicknames(sock, chatId, msg);
      } else if (command === 'تحقق' || command === 'verify') {
        return await this.verifyMember(sock, chatId, msg);
      }

      // إذا لم يكن أمر فرعي، نفذ التسجيل
      await this.registerMember(sock, chatId, senderId, messageText, msg);
      
    } catch (error) {
      console.error('Register Command Error:', error);
      await sock.sendMessage(extra.from, {
        text: '*❌ حدث خطأ أثناء تنفيذ الأمر!*'
      }, { quoted: msg });
    }
  },

  // ===============================
  // 🟢 تسجيل عضو مع الرابط والـvCard
  // ===============================
  async registerMember(sock, chatId, senderId, messageText, message) {
    try {
      const workGroupId = '120363424780316145@g.us'; // عدل إذا لزم
      const mainGroupUrl = 'https://chat.whatsapp.com/Cf5VB10lqPw7yWufi91P2X?mode=gi_t';
      
      const body = messageText.slice(5).trim();
      const [nickname, inviter] = body.split('|').map(s => s.trim());

      if (!nickname || !inviter) {
        return sock.sendMessage(chatId, {
          text: '*⚠️ الصيغة الصحيحة: .سجل اللقب | من طرف فلان*'
        }, { quoted: message });
      }

      const quoted = message.message?.extendedTextMessage?.contextInfo;
      const targetJid = quoted?.participant || quoted?.mentionedJid?.[0];

      if (!targetJid) {
        return sock.sendMessage(chatId, {
          text: '*❗ رد على الشخص أولاً!*'
        }, { quoted: message });
      }

      const cleanNumber = targetJid.split('@')[0];

      if (isMemberRegistered(cleanNumber)) {
        return sock.sendMessage(chatId, {
          text: '*⚠️ هذا العضو مسجل مسبقاً!*'
        }, { quoted: message });
      }

      if (isNicknameTaken(nickname)) {
        return sock.sendMessage(chatId, {
          text: '*⚠️ اللقب مأخوذ بالفعل!*'
        }, { quoted: message });
      }

      let nicknames = loadNicknames();
      const nickIndex = nicknames.findIndex(n =>
        n.toLowerCase() === nickname.toLowerCase()
      );
      
      // 🗑 حذف اللقب من اللائحة
      nicknames.splice(nickIndex, 1);
      saveNicknames(nicknames);

      // 💾 تسجيل العضو
      let members = loadMembers();
      members.push({
        number: cleanNumber,
        jid: targetJid,
        nickname,
        invitedBy: inviter,
        addedBy: senderId,
        groupId: chatId,
        date: new Date().toISOString()
      });
      saveMembers(members);

      // 📇 إنشاء vCard
      const vcard = `
> *𓆩〄║ 𝐄𝐂𝐋𝐈𝐏𝐒𝐄↓〄 𓆪*
*┃ 🎭 اللــــقــــب:*  
*┃      ➤* ${nickname}
*┃◇◇◇◇◇◇◇*
*┃ 👤 مــــن طــــرف:*  
*┃     ➤* ${inviter}
*┃◇◇◇◇◇◇◇*
*┃ 🔖    الإشــــارة:*  
*┃     ➤* @${targetJid.split('@')[0]}
> *𓆩〄║ 𝐄𝐂𝐋𝐈𝐏𝐒𝐄↓〄 𓆪*`;
      
      // 📤 إرسال جهة الاتصال لجروب الورك
      await sock.sendMessage(workGroupId, {
        text: vcard,
        mentions: [targetJid]
      });

      // 📩 رسالة خاصة للعضو
      const privateMsg =
`*╔═══〔 🎉 تم قبولك رسمياً 〕═══╗*\n\n` +
`*مرحباً بك 『 ${nickname} 』*\n\n` +
`📌 تمت إضافتك للنظام بنجاح.\n` +
`🔗 هذا رابط المجموعة الرئيسية:\n${mainGroupUrl}\n\n` +
`*إدارة : 𝐂.𝐋.𝐏.𝐒*`;
      
      await sock.sendMessage(targetJid, { text: privateMsg });

      // ✅ تأكيد في الكروب
      await sock.sendMessage(chatId, {
        text: `
> *𓆩〄║ 𝐄𝐂𝐋𝐈𝐏𝐒𝐄↓〄 𓆪*
*┃تم تسجيل*
    @${cleanNumber}     *┃*
*┃بلقب* ${nickname}
*┃بنجاح ✅*
> *𓆩〄║ 𝐄𝐂𝐋𝐈𝐏𝐒𝐄↓〄 𓆪*`,
        mentions: [targetJid]
      }, { quoted: message });
      
    } catch (error) {
      console.error('Register Error:', error);
      await sock.sendMessage(chatId, {
        text: '*❌ حدث خطأ أثناء التسجيل!*'
      });
    }
  },

  // ===============================
  // 📋 عرض قائمة المسجلين
  // ===============================
  async listMembers(sock, chatId, message) {
    const members = loadMembers();

    if (!members.length) {
      return sock.sendMessage(chatId, {
        text: '*📭 لا يوجد أعضاء مسجلين!*'
      }, { quoted: message });
    }

    let text = '*📜 قائمة الأعضاء المسجلين:*\n\n';
    members.forEach((m, i) => {
      text += `*${i + 1}.* ${m.nickname}\n`;
      text += `   *👤 من طرف:* ${m.invitedBy}\n`;
    });

    await sock.sendMessage(chatId, { text }, { quoted: message });
  },

  // ===============================
  // ❌ حذف عضو + استرجاع اللقب تلقائياً
  // ===============================
  async deleteMember(sock, chatId, message) {
    const quoted = message.message?.extendedTextMessage?.contextInfo;
    const targetJid = quoted?.participant || quoted?.mentionedJid?.[0];

    if (!targetJid) {
      return sock.sendMessage(chatId, {
        text: '*❗ رد على العضو لحذفه!*'
      }, { quoted: message });
    }

    const cleanNumber = targetJid.split('@')[0];
    let members = loadMembers();
    let nicknames = loadNicknames();
    const index = members.findIndex(m => m.number === cleanNumber);

    if (index === -1) {
      return sock.sendMessage(chatId, {
        text: '*❌ العضو غير موجود!*'
      }, { quoted: message });
    }

    const removedMember = members[index];

    // ♻️ استرجاع اللقب
    nicknames.push(removedMember.nickname);
    saveNicknames(nicknames);

    members.splice(index, 1);
    saveMembers(members);

    await sock.sendMessage(chatId, {
      text: '*♻️ تم حذف العضو واسترجاع اللقب للنظام!*'
    }, { quoted: message });
  },

  // ===============================
  // 🎲 لقب عشوائي
  // ===============================
  async randomNickname(sock, chatId, message) {
    const nicknames = loadNicknames();

    if (!nicknames.length) {
      return sock.sendMessage(chatId, {
        text: '*❌ لا توجد ألقاب متبقية!*'
      }, { quoted: message });
    }

    const random = nicknames[Math.floor(Math.random() * nicknames.length)];
    await sock.sendMessage(chatId, {
      text: `*🎲 لقب عشوائي:*\n\n『 ${random} 』`
    }, { quoted: message });
  },

  // ===============================
  // 📊 عدد الألقاب المتبقية
  // ===============================
  async remainingNicknames(sock, chatId, message) {
    const nicknames = loadNicknames();

    if (!nicknames.length) {
      return await sock.sendMessage(chatId, {
        text: `*╔═══『 🎭 𝑨𝑵𝑰𝑴𝑬 𝑵𝑰𝑪𝑲𝑵𝑨𝑴𝑬𝑺 』═══╗*
*┃ ❌ لا توجد ألقاب متبقية*
*╚═══════════════════════╝*`
      }, { quoted: message });
    }

    // تحويل الألقاب إلى قائمة مرتبة
    const formattedList = nicknames
      .map((name, index) => `✦ ${index + 1} ➤ ${name}`)
      .join("\n");

    const text = `
*╔═══『 🎭 𝑨𝑵𝑰𝑴𝑬 𝑵𝑰𝑪𝑲𝑵𝑨𝑴𝑬𝑺 』═══╗*
*┃ 📊 العدد المتبقي:* ${nicknames.length}
*╠═══════════════════════╣*
${formattedList}
*╚═══════════════════════╝*
`;

    await sock.sendMessage(chatId, {
      text: text
    }, { quoted: message });
  },

  // ==============تحقق =================
  async verifyMember(sock, chatId, message) {
    const quoted = message.message?.extendedTextMessage?.contextInfo;
    let targetJid = quoted?.participant || quoted?.mentionedJid?.[0];

    if (!targetJid) {
      return sock.sendMessage(chatId, {
        text: '*❗ رد على رسالة العضو للتحقق منه!*'
      }, { quoted: message });
    }
    
    const cleanNumber = targetJid.split('@')[0].split(':')[0];
    let data = loadMembers();
    const info = data.find(item => item.number === cleanNumber || item.jid === targetJid);

    if (!info) {
      return sock.sendMessage(chatId, {
        text: '*❌ هذا العضو غير مسجل في النظام!*'
      }, { quoted: message });
    }
    
    // 📅 تحويل تاريخ الانضمام
    const joinDate = new Date(info.date).toLocaleString("ar-MA");

    // 📸 صورة العضو
    let profilePic;
    try { 
      profilePic = await sock.profilePictureUrl(info.jid, "image"); 
    } catch { 
      profilePic = null; 
    }

    const caption =
`*╔═══〔 🔎 بطاقة العضو الرسمية 〕═══╗*\n\n` +
`*📛 اللقب:* ${info.nickname}\n` +
`*👤 من طرف:* ${info.invitedBy}\n` +
`*📅 تاريخ الانضمام:* ${joinDate}\n` +
`*📌 الحالة:* مسجل ✅\n\n` +
`*إدارة : 𝐂.𝐋.𝐏.𝐒*`;

    if (profilePic) {
      await sock.sendMessage(chatId, {
        image: { url: profilePic },
        caption,
        mentions: [targetJid]
      }, { quoted: message });
    } else {
      await sock.sendMessage(chatId, {
        text: caption,
        mentions: [targetJid]
      }, { quoted: message });
    }
  }
};