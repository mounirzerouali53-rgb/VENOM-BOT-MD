/**
 * Global Configuration for WhatsApp MD Bot
 * 𓆗𝐀̷𝐍̷𝐎̷𝐍̷𝐘̷𝐌̷𝐎̷𝐔̷𝐒̷𓆗
 */

module.exports = {
    // Bot Owner Configuration
    ownerNumber: ['212787536523'],
    ownerName: ['𝐇𝐀𝐌𝐙𝐀 𝐋𝐊𝐇𝐀𝐓𝐈𝐁𝐄'],
    
    // Bot Configuration
    botName: '𝐇𝐀𝐌𝐙𝐀 𝐋𝐊𝐇𝐀𝐓𝐈𝐁𝐄',
    prefix: '.',
    sessionName: 'session',
    sessionID: process.env.SESSION_ID || '',
    newsletterJid: '120363422273008761@newsletter',
    updateZipUrl: 'https://github.com/mruniquehacker/KnightBot-Mini/archive/refs/heads/main.zip',
    
    // Sticker Configuration
    packname: '𝐇𝐀𝐌𝐙𝐀 𝐋𝐊𝐇𝐀𝐓𝐈𝐁𝐄',
    
    // Bot Behavior
    selfMode: false,
    autoRead: false,
    autoTyping: false,
    autoBio: false,
    autoSticker: false,
    autoReact: false,
    autoReactMode: 'bot',
    autoDownload: false,
    
    // Group Settings Defaults
    defaultGroupSettings: {
      antilink: false,
      antilinkAction: 'delete',
      maxWarnings: 3,
      antitag: false,
      antitagAction: 'delete',
      antiall: false,
      antiviewonce: false,
      antibot: false,
      anticall: false,
      antigroupmention: false,
      antigroupmentionAction: 'delete',
      welcome: false,
      welcomeMessage: '╭━━━𓆗👁️𓆗━━━╮\n┃ 🖤 عضو جديد في الظل\n┃ ✨ مرحباً: @user\n┃ 👥 الأعضاء: #memberCount\n┃ ⏰ الوقت: time\n╰━━━𓆗👁️𓆗━━━╯\n\n*@user* أهلاً بك في *@group*\n\n*📋 وصف الجروب:*\ngroupDesc\n\n> *𝐇𝐀𝐌𝐙𝐀 𝐋𝐊𝐇𝐀𝐓𝐈𝐁𝐄*',
      goodbye: false,
      goodbyeMessage: '╭━━━𓆗👁️𓆗━━━╮\n┃ 🖤 وداعاً @user 👋\n┃ 💨 اختفى في الظلام\n╰━━━𓆗👁️𓆗━━━╯',
      antiSpam: false,
      antidelete: false,
      nsfw: false,
      detect: false,
      chatbot: false,
      autosticker: false,
      badwordFilter: false,
      badwordAction: 'warn',
      badwordMaxWarnings: 3
    },
    
    // API Keys
    apiKeys: {
      openai: '',
      deepai: '',
      remove_bg: ''
    },
    
    // Message Configuration
    messages: {
      wait: '╭━━━𓆗⏳𓆗━━━╮\n┃ جاري التنفيذ...\n╰━━━𓆗⏳𓆗━━━╯',

      success: '╭━━━𓆗✅𓆗━━━╮\n┃ تمّ بنجاح ✅\n╰━━━𓆗✅𓆗━━━╯',

      error: '╭━━━𓆗❌𓆗━━━╮\n┃ حدث خطأ ما! ❌\n╰━━━𓆗❌𓆗━━━╯',

      ownerOnly: '╭━━━𓆗👑𓆗━━━╮\n┃ هذا الأمر مخصص\n┃ لـ *𝐇𝐀𝐌𝐙𝐀 𝐋𝐊𝐇𝐀𝐓𝐈𝐁𝐄* فقط!\n╰━━━𓆗👑𓆗━━━╯',

      adminOnly: '╭━━━𓆗🛡️𓆗━━━╮\n┃ هذا الأمر مخصص\n┃ للمشرفين فقط!\n╰━━━𓆗🛡️𓆗━━━╯',

      groupOnly: '╭━━━𓆗👥𓆗━━━╮\n┃ هذا الأمر مخصص\n┃ للمجموعات فقط!\n╰━━━𓆗👥𓆗━━━╯',

      privateOnly: '╭━━━𓆗💬𓆗━━━╮\n┃ هذا الأمر مخصص\n┃ للخاص فقط!\n╰━━━𓆗💬𓆗━━━╯',

      botAdminRequired: '╭━━━𓆗🤖𓆗━━━╮\n┃ اجعلني مشرفاً\n┃ أولاً!\n╰━━━𓆗🤖𓆗━━━╯',

      invalidCommand: '╭━━━𓆗❓𓆗━━━╮\n┃ أمر غير صحيح!\n┃ 📋 اكتب .اوامر للقائمة\n╰━━━𓆗❓𓆗━━━╯'
    },
    
    // Timezone
    timezone: 'Africa/Morocco',
    
    // Limits
    maxWarnings: 3,
    
    // Social Links
    social: {
      github: 'https://github.com/mounirzerouali53',
      instagram: 'https://instagram.com/elgrande_.mounir',
      youtube: 'https://www.youtube.com/@venom2144'
    }
};
