/**
 * Global Configuration for WhatsApp MD Bot
 */

module.exports = {
    // Bot Owner Configuration
    ownerNumber: ['212602405501'],       // Add your number without + or spaces (e.g., 919876543210)
    ownerName: ['𝑽𝑬𝑵𝑶𝑴'], // Owner names corresponding to ownerNumber array
    
    // Bot Configuration
    botName: '𝑽𝑬𝑵𝑶𝑴-𝑩𝑶𝑻-𝑴𝑫',
    prefix: '.',
    sessionName: 'session',
    sessionID: process.env.SESSION_ID || 'KnightBot!H4sIAAAAAAAAA5VVyZKjRhD9l7pKMY1YhKSIjjCbJLSiFSHHHEpQoEKIpaoAoQndfLQdffGx/7E/wYG6e3oO9rh9K7IqXr7M9zL5BuIEUzRGFeh9AynBBWSoPrIqRaAH1Nz3EQFN4EEGQQ+c1DQ+Ce3WZKqtlws9gNBpZOJ4nD9MF0JZLMry+uAXO01odR7BrQnS/BBh9yeA1flQOlv91OAygS/Xx5GQ7TcCpUW13E2ugTazxbGzi44DJXkEtxoRYoLjwEiP6IwIjMaosiAmn6Ov6Z1SXhxmoo1MuzwWNlHmY2TQjXXEI7ea2uuy0xcgf906n6PfCnXmaoc1l83klbEUxp0Zytmu319fVu55IneN8DqXfMFUlFf6FAcx8kwPxQyz6tN97yjbi7ygMxRPrtpQXwpMKBzJ3PBxlm5dxdARKkW+SzBvfI54hxtMy80RXeKpGmm2AU19kuCsMeMiq0Fm2XCqVbmER/JJ/JG4Rd69cvo/feemnhSKfTNah5jFNNjL6kksVgs8uTD7oeS3cT58GHW3Zp/7HH26WdjOaL9NaCTF2kFeEPMoC7lV5LqjFRryZ7P+1DhkVml80IcsJz9jicI1axxCvh2HjXXidMqKSn7Cz5ZyG48rdCArUfKxKluTzU47zZcIKYF9XIdlxkNXcydeUS4CdVVyS2fAzb3rofJjrDzeKzqhyvRAr3VrAoICTBmBDCdxHZOEJoBesUIuQezeXeBamfWQnxvBjuyUNBvm5nSMyaQYNyZqarfSsGh3upt8qC6CR9AEKUlcRCnyhpiyhFRTRCkMEAW9X782QYwu7FW3OpvQagIfE8o2cZ5GCfTeRX2/hK6b5DFbVbGr1QdEQI/7CCPGcBzQuo15DIl7xAXSjpBR0PNhRNH3AhFBHugxkqPvQ6slXt1321k4hsivQROc73pgD/QA3+LbHC9yksS1erz8C/1S1rAwTb/EiIEmiGH9Grw8P/318vz028vz0x8vz09/vjw//Q6aILqDiBzXFXlObguSJN1h6vjtO/06m4cYxBGt14EJMXEdzRhdGynlBgPFCBQtUMBHue+2edWFz0cs8U47ZVoq0xE9+WKDRo4+l6xkb7crK9+mqWVA9Rwmj/8AAnpgq8+3K+MqttW2XYTjTbybCwumYsZ3LFcx+556NcQR6hTHkxygzng4y6aX8prlGn/Jwh0NaKd/0nYXa9nnLTUzrqai6eVjnc1DBXbRj8lgPg7DjHfbbl7oXSkMXfewWWwNt8G8E28a0E1VJxrtVYu7nFTFCpfQEDbJQ6trXo7SRIkvk6zYTHaS4OTmrtIejIEYBq+Gvg9U9LbI8N1rtZD1p4/RfS+8Cfafwr4Sr/3H3Zo/YLxtmn+ZVtUj+ACH+36pTxVdO4yGDYuMbOWar9uDbU5DOYJwfRkE+6QNbrevTZBGkPkJOdf743yAoAlIktduNmM/+dlfQ+FMJQj6ddkRpEz5mJA1PiPK4DkFvZYs87LAt7r86yuLJOkQ0mPdga0sZxtw+xvRg6EvbgcAAA==',
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
  