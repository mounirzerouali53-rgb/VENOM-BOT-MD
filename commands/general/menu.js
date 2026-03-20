const config = require('../../config');
const { loadCommands } = require('../../utils/commandLoader');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'قائمة',
  aliases: ['ليست'],
  category: 'عام',
  description: 'عرض جميع الأوامر',
  usage: '.قائمة',

  async execute(sock, msg, args, extra) {
    try {
      const commands = loadCommands();
      const categories = {};

      commands.forEach((cmd, name) => {
        if (cmd.name === name) {
          if (!categories[cmd.category]) categories[cmd.category] = [];
          categories[cmd.category].push(cmd);
        }
      });

      const ownerNames = Array.isArray(config.ownerName) ? config.ownerName : [config.ownerName];
      const displayOwner = ownerNames[0] || config.ownerName || 'مالك البوت';

      let menuText = `*~╔═ ⛓️🩸 𝖁𝕰𝕹𝕺𝕸🩸⛓️ ═╗~*\n\n`;
      menuText += `👋 مرحبا @${extra.sender.split('@')[0]}!\n\n`;
      menuText += `⚡ بادئة الأوامر: ${config.prefix}\n`;
      menuText += `📦 إجمالي الأوامر: ${commands.size}\n`;
      menuText += `👑 المالك: ${displayOwner}\n\n`;

      const arabicCategories = {
        general: 'عام',
        group: 'المجموعة',
        admin: 'إدارة',
        owner: 'مالك',
        media: 'وسائط',
        utility: 'أدوات',
        textmaker: 'صانع نصوص'
      };

      for (const cat in arabicCategories) {
        if (categories[cat]) {
          menuText += `┏━━━━━━━━━━━━\n`;
          menuText += `┃ 🗂️ *${arabicCategories[cat]}*\n`;
          menuText += `┗━━━━━━━━━━━━\n`;
          categories[cat].forEach(cmd => {
            menuText += `│ ➜ *${config.prefix}${cmd.name}*\n`;
          });
          menuText += `\n`;
        }
      }

      menuText += `*~╚═ ⚔️ 𝕭𝖄:𝕱𝕰𝕹𝕺𝕸⚔️ ═╝~*\n\n`;
      menuText += `💡 اكتب ${config.prefix}help <أمر> لمزيد من المعلومات\n`;
      menuText += `🌟 إصدار البوت: 1.0.0\n`;

      const imagePath = path.join(__dirname, '../../utils/bot_image.jpg');
      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);
        await sock.sendMessage(extra.from, {
          image: imageBuffer,
          caption: menuText,
          mentions: [extra.sender],
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true
          }
        }, { quoted: msg });
      } else {
        await sock.sendMessage(extra.from, {
          text: menuText,
          mentions: [extra.sender]
        }, { quoted: msg });
      }

    } catch (error) {
      await extra.reply(`❌ حدث خطأ: ${error.message}`);
    }
  }
};