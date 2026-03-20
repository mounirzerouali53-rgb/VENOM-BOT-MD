const fs = require('fs');

const path = require('path');

const config = require('../../config');

const { loadCommands } = require('../../utils/commandLoader');

const { sendButtons } = require('gifted-btns');

module.exports = {

  name: 'مساعدة',

  description: 'عرض الأوامر الرئيسية فقط',

  usage: '.مساعدة',

  category: 'عام',

  async execute(sock, msg, args, extra) {

    try {

      const prefix = config.prefix;

      const commands = loadCommands();

      const categories = {};

      // ترتيب الأوامر حسب الفئة، فقط الاسم الرئيسي

      commands.forEach((cmd) => {

        const cat = (cmd.category || 'أخرى').toLowerCase();

        if (!categories[cat]) categories[cat] = [];

        if (!categories[cat].includes(cmd.name)) {

          categories[cat].push(cmd.name);

        }

      });

      let menu = `*~╔═ ⛓️🩸 𝖁𝕰𝕹𝕺𝕸🩸⛓️ ═╗~*\n`;

      menu += `👋 مرحبا @${extra.sender.split('@')[0]}!\n`;

      menu += `⚡ بادئة الأوامر: *${prefix}*\n`;

      menu += `📦 مجموع الأوامر: ${commands.size}\n\n`;

      // عرض كل فئة مع زخرفة VENOM

      const arabicCategories = {

        general: 'عام',

        group: 'المجموعة',

        admin: 'إدارة',

        owner: 'مالك',

        media: 'وسائط',

        utility: 'أدوات',

        textmaker: 'صانع نصوص'

      };

      for (const cat of Object.keys(categories).sort()) {

        const displayCat = arabicCategories[cat] || cat;

        menu += `*~╔═ ⚡ ${displayCat.toUpperCase()} ⚡ ═╗~*\n`;

        categories[cat].forEach(cmdName => {

          menu += `│ ➜ *${prefix}${cmdName}*\n`;

        });

        menu += `*~╚═ ⚔️ END ${displayCat.toUpperCase()} ⚔️ ═╝~*\n\n`;

      }

      menu += `*~╚═ ⚔️ 𝕭𝖄:𝕱𝕰𝕹𝕺𝕸⚔️ ═╝~*\n`;

      // إرسال القائمة مع أزرار

      await sendButtons(sock, extra.from, {

        title: '',

        text: menu,

        footer: `> *Powered by ${config.botName}*`,

        buttons: [

          {

            name: 'cta_url',

            buttonParamsJson: JSON.stringify({

              display_text: 'يوتيوب',

              url: config.social?.youtube || 'https://www.youtube.com/@venom2144'

            })

          },

          {

            name: 'cta_url',

            buttonParamsJson: JSON.stringify({

              display_text: 'زيارة المستودع',

              url: config.social?.github || 'https://github.com/mounirzerouali53'

            })

          },

          {

            name: 'cta_url',

            buttonParamsJson: JSON.stringify({

              display_text: 'انضم للقناة',

              url: 'https://whatsapp.com/channel/0029Vb6kr0K1yT23FVNNo30r'

            })

          }

        ]

      }, { quoted: msg });

    } catch (err) {

      console.error('list.js error:', err);

      await extra.reply('❌ فشل تحميل قائمة الأوامر.');

    }

  }

};