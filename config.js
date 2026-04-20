/**
 * Global Configuration for WhatsApp MD Bot
 */

module.exports = {
    // Bot Owner Configuration
    ownerNumber: ['212770192392'],       // Add your number without + or spaces (e.g., 919876543210)
    ownerName: ['𝑽𝑬𝑵𝑶𝑴'], // Owner names corresponding to ownerNumber array
    
    // Bot Configuration
    botName: '𝑽𝑬𝑵𝑶𝑴-𝑩𝑶𝑻-𝑴𝑫',
    prefix: '.',
    sessionName: 'session',
    sessionID: process.env.SESSION_ID || '',
    newsletterJid: '120363422273008761@newsletter', // Newsletter JID for menu forwarding
    updateZipUrl: 'https://github.com/mruniquehacker/KnightBot-Mini/archive/refs/heads/main.zip', // URL to latest code zip for .update command
    
    // Sticker Configuration
    packname: '𝑽𝑬𝑵𝑶𝑴-𝑩𝑶𝑻-𝑴𝑫',
    
    // Bot Behavior
    selfMode: false, // Private mode - only owner can use commands
    autoRead: false,
    autoTyping: false,
    autoBio: false,
    autoSticker: false,
    autoReact: false,
    autoReactMode: 'bot', // set bot or all via cmd
    autoDownload: false,
    
    // Group Settings Defaults
    defaultGroupSettings: {
      antilink: false,
      antilinkAction: 'delete', // 'delete', 'kick', 'warn'
      antitag: false,
      antitagAction: 'delete',
      antiall: false, // Owner only - blocks all messages from non-admins
      antiviewonce: false,
      antibot: false,
      anticall: false, // Anti-call feature
      antigroupmention: false, // Anti-group mention feature
      antigroupmentionAction: 'delete', // 'delete', 'kick'
      welcome: false,
      welcomeMessage: '╭╼━≪•𝙽𝙴𝚆 𝙼𝙴𝙼𝙱𝙴𝚁•≫━╾╮\n┃𝚆𝙴𝙻𝙲𝙾𝙼𝙴: @user 👋\n┃Member count: #memberCount\n┃𝚃𝙸𝙼𝙴: time⏰\n╰━━━━━━━━━━━━━━━╯\n\n*@user* Welcome to *@group*! 🎉\n*Group 𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝚃𝙸𝙾𝙽*\ngroupDesc\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ botName*',
      goodbye: false,
      goodbyeMessage: 'Goodbye @user 👋 We will never miss you!',
      antiSpam: false,
      antidelete: false,
      nsfw: false,
      detect: false,
      chatbot: false,
      autosticker: false // Auto-convert images/videos to stickers
    },
    
    // API Keys (add your own)
    apiKeys: {
      // Add API keys here if needed
      openai: '',
      deepai: '',
      remove_bg: ''
    },
    
    // Message Configuration
    messages: {
      wait: '*⏳ إنتظر من فضلك...*',
      success: '*✅ لقد نجح!*',
      error: '*❌ حذث خطأ أثناء التنفيذ!*',
      ownerOnly: '*👑 هذا الأمر مخصص للمطور 𝑽𝑬𝑵𝑶𝑴 فقط😉!*',
      adminOnly: '*🛡️ هذا الأمر مخصص للأدمينز فقط😉!*',
      groupOnly: '*👥 هذا الأمر مخصص للمجموعات فقط!*',
      privateOnly: '*💬 هذا الأمر مخصص للخاص فقط!*',
      botAdminNeeded: '*🤖 عطيني اشراف أولا 🤨*',
      invalidCommand: '*❓ أمر خطأ أكتب .اوامر للمساعدة*'
    },
    
    // Timezone
    timezone: 'Africa/Morocco',
    
    // Limits
    maxWarnings: 3,
    
    // Social Links (optional)
    social: {
      github: 'https://github.com/mounirzerouali53',
      instagram: 'https://instagram.com/elgrande_.mounir',
      youtube: 'https://www.youtube.com/@venom2144'
    }
};
  