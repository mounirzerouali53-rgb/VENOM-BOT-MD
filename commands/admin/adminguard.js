/**
 * Command: Admin Guard
 */

const database = require('../../database');

module.exports = {
  name: 'مراقبة',
  aliases: ['حماية_الادمن', 'adminguard'],
  description: 'تفعيل/إلغاء نظام حماية الأدمن',
  category: 'admin',
  groupOnly: true,
  adminOnly: false,
  ownerOnly:true,
  botAdminNeeded: true,

  async execute(sock, msg, args, {
    from,
    reply,
    react
  }) {
    const subCommand = args[0]?.toLowerCase();
    
    // Turn ON
    if (subCommand === 'on' || subCommand === 'تفعيل') {
      const current = database.getAdminGuardStatus(from);
      if (current) {
        await reply('✅ النظام مفعل بالفعل');
        await react('✅');
        return;
      }
      
      database.setAdminGuardStatus(from, true);
      await reply('🛡️ *تم تفعيل نظام حماية الأدمن*\n\n▪️ سيتم مراقبة الترقيات والخفضات\n▪️ الطرد السريع (3+ خلال 20 ثانية) = خفض تلقائي');
      await react('🛡️');
      return;
    }
    
    // Turn OFF
    if (subCommand === 'off' || subCommand === 'إلغاء') {
      const current = database.getAdminGuardStatus(from);
      if (!current) {
        await reply('❌ النظام غير مفعل');
        await react('❌');
        return;
      }
      
      database.setAdminGuardStatus(from, false);
      await reply('🔒 *تم إلغاء تفعيل نظام حماية الأدمن*');
      await react('🔒');
      return;
    }
    
    // Add protected member
    if (subCommand === 'add' || subCommand === 'حماية') {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      let targetJid = mentioned[0];
      
      if (!targetJid && args[1]) {
        const num = args[1].replace(/[^0-9]/g, '');
        if (num) targetJid = `${num}@s.whatsapp.net`;
      }
      
      if (!targetJid) {
        await reply('⚠️ منشن العضو: `.admin_guard add @user`');
        await react('⚠️');
        return;
      }
      
      const isAlready = database.isProtectedMember(from, targetJid);
      if (isAlready) {
        await reply(`✅ ${targetJid.split('@')[0]} موجود بالفعل`);
        await react('✅');
        return;
      }
      
      database.addProtectedMember(from, targetJid);
      await reply(`🛡️ تمت إضافة ${targetJid.split('@')[0]} للقائمة البيضاء`);
      await react('🛡️');
      return;
    }
    
    // Remove protected member
    if (subCommand === 'remove' || subCommand === 'إزالة') {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
      let targetJid = mentioned[0];
      
      if (!targetJid && args[1]) {
        const num = args[1].replace(/[^0-9]/g, '');
        if (num) targetJid = `${num}@s.whatsapp.net`;
      }
      
      if (!targetJid) {
        await reply('⚠️ منشن العضو: `.admin_guard remove @user`');
        await react('⚠️');
        return;
      }
      
      const isProtected = database.isProtectedMember(from, targetJid);
      if (!isProtected) {
        await reply(`❌ ${targetJid.split('@')[0]} غير موجود`);
        await react('❌');
        return;
      }
      
      database.removeProtectedMember(from, targetJid);
      await reply(`🔓 تمت إزالة ${targetJid.split('@')[0]} من القائمة البيضاء`);
      await react('🔓');
      return;
    }
    
    // Show list
    if (subCommand === 'list' || subCommand === 'قائمة') {
      const list = database.getProtectedMembersList(from);
      
      if (list.length === 0) {
        await reply('📋 القائمة البيضاء فارغة\nاستخدم `.admin_guard add @user` للإضافة');
        await react('📋');
        return;
      }
      
      let msg = '🛡️ *【الأعضاء المحميون】*\n\n';
      for (let i = 0; i < list.length; i++) {
        msg += `${i + 1}️⃣ @${list[i].split('@')[0]}\n`;
      }
      msg += `\n📌 المجموع: ${list.length}`;
      
      await sock.sendMessage(from, { text: msg, mentions: list });
      await react('🛡️');
      return;
    }
    
    // Show status
    const status = database.getAdminGuardStatus(from) ? '🟢 مفعل' : '🔴 غير مفعل';
    const count = database.getProtectedMembersList(from).length;
    
    await reply(`🛡️ *نظام حماية الأدمن*\n\n▪️ الحالة: ${status}\n▪️ المحميون: ${count}\n\n📌 *الأوامر:*\n.admin_guard on/off\n.admin_guard add @user\n.admin_guard remove @user\n.admin_guard list`);
    await react('🛡️');
  }
};