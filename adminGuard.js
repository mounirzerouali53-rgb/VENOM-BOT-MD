/**
 * Admin Guard System - حماية الأدمن
 */

const database = require('../database');

// Cache for recent actions
const recentActions = new Map();

const clearRecentAction = (key) => {
  setTimeout(() => recentActions.delete(key), 2000);
};

const handleGroupParticipantsUpdate = async (sock, update) => {
  try {
    const { id: groupId, participants, action } = update;
    
    if (!groupId?.endsWith('@g.us')) return;
    
    const isEnabled = database.getAdminGuardStatus(groupId);
    if (!isEnabled) return;
    
    if (action !== 'promote' && action !== 'demote') return;
    
    const botIsAdmin = await isBotAdmin(sock, groupId);
    if (!botIsAdmin) return;
    
    for (const participant of participants) {
      const targetJid = participant.id || participant;
      if (!targetJid) continue;
      
      const actionKey = `${groupId}:${action}:${targetJid}`;
      if (recentActions.has(actionKey)) continue;
      recentActions.set(actionKey, true);
      clearRecentAction(actionKey);
      
      const isProtected = database.isProtectedMember(groupId, targetJid);
      const isTargetOwner = isOwner(targetJid);
      
      // Case: Promoting non-protected member
      if (action === 'promote' && !isProtected && !isTargetOwner) {
        const promoter = await findActionPerpetrator(sock, groupId, targetJid, 'promote');
        if (!promoter || isOwner(promoter)) continue;
        
        await sock.groupParticipantsUpdate(groupId, [targetJid], 'demote');
        await sock.groupParticipantsUpdate(groupId, [promoter], 'demote');
        
        const targetName = targetJid.split('@')[0];
        const promoterName = promoter.split('@')[0];
        
        await sock.sendMessage(groupId, {
          text: `⚠️ *【نظام حماية الأدمن】*\n\n` +
                `▢ تمت ترقية *${targetName}* إلى أدمن\n` +
                `▢ هذا العضو *غير معتمد* في القائمة البيضاء\n\n` +
                `🔻 تم خفض *${targetName}* إلى عضو عادي\n` +
                `🔻 تم خفض *${promoterName}* إلى عضو عادي\n\n` +
                `> *السبب:* ترقية غير مصرح بها`,
          mentions: [targetJid, promoter]
        });
      }
      
      // Case: Demoting protected member
      else if (action === 'demote' && isProtected) {
        const demoter = await findActionPerpetrator(sock, groupId, targetJid, 'demote');
        if (!demoter || isOwner(demoter)) continue;
        
        await sock.groupParticipantsUpdate(groupId, [targetJid], 'promote');
        await sock.groupParticipantsUpdate(groupId, [demoter], 'demote');
        
        const targetName = targetJid.split('@')[0];
        const demoterName = demoter.split('@')[0];
        
        await sock.sendMessage(groupId, {
          text: `⚠️ *【نظام حماية الأدمن】*\n\n` +
                `▢ تم خفض *${targetName}* من رتبة أدمن\n` +
                `▢ هذا العضو *معتمد* في القائمة البيضاء\n\n` +
                `🔺 تمت إعادة ترقية *${targetName}* إلى أدمن\n` +
                `🔻 تم خفض *${demoterName}* إلى عضو عادي\n\n` +
                `> *السبب:* خفض رتبة عضو محمي`,
          mentions: [targetJid, demoter]
        });
      }
    }
  } catch (error) {
    console.error('[AdminGuard] Error:', error);
  }
};

const handleGroupKick = async (sock, update) => {
  try {
    const { id: groupId, participants, action } = update;
    
    if (!groupId?.endsWith('@g.us')) return;
    if (action !== 'remove') return;
    
    const isEnabled = database.getAdminGuardStatus(groupId);
    if (!isEnabled) return;
    
    const botIsAdmin = await isBotAdmin(sock, groupId);
    if (!botIsAdmin) return;
    
    // Find who kicked (simplified - you may need to enhance this)
    const kicker = await findKicker(sock, groupId);
    if (!kicker || isOwner(kicker)) return;
    
    const isKickerAdmin = await isUserAdmin(sock, groupId, kicker);
    if (!isKickerAdmin) return;
    
    const kickCount = database.addKickRecord(groupId, kicker);
    
    if (kickCount >= 3) {
      await sock.groupParticipantsUpdate(groupId, [kicker], 'demote');
      database.clearKickTracker(groupId, kicker);
      
      const kickerName = kicker.split('@')[0];
      
      await sock.sendMessage(groupId, {
        text: `⚠️ *【نظام حماية الأدمن】*\n\n` +
              `▢ قام الأدمن *${kickerName}* بطرد ${kickCount} أعضاء\n` +
              `▢ خلال أقل من 20 ثانية\n\n` +
              `🔻 تم خفض رتبته إلى *عضو عادي*\n\n` +
              `> *السبب:* طرد متكرر وسريع`,
        mentions: [kicker]
      });
    }
  } catch (error) {
    console.error('[AdminGuard] Kick error:', error);
  }
};

// Helper functions
const isBotAdmin = async (sock, groupId) => {
  try {
    const metadata = await sock.groupMetadata(groupId);
    const botId = sock.user.id;
    return metadata.participants.some(p => 
      (p.id === botId || p.id?.split('@')[0] === botId?.split('@')[0]) && 
      (p.admin === 'admin' || p.admin === 'superadmin')
    );
  } catch {
    return false;
  }
};

const isUserAdmin = async (sock, groupId, jid) => {
  try {
    const metadata = await sock.groupMetadata(groupId);
    const participant = metadata.participants.find(p => 
      p.id === jid || p.id?.split('@')[0] === jid.split('@')[0]
    );
    return participant?.admin === 'admin' || participant?.admin === 'superadmin';
  } catch {
    return false;
  }
};

const isOwner = (jid) => {
  try {
    const config = require('../config');
    const number = jid.split('@')[0];
    return config.ownerNumber?.some(owner => 
      owner.includes(number) || number.includes(owner.split('@')[0])
    ) || false;
  } catch {
    return false;
  }
};

const findActionPerpetrator = async (sock, groupId, targetJid, action) => {
  // Simplified - returns the first admin found
  // You can enhance this by checking group action logs
  try {
    const metadata = await sock.groupMetadata(groupId);
    const admins = metadata.participants.filter(p => p.admin);
    return admins.length > 0 ? admins[0].id : null;
  } catch {
    return null;
  }
};

const findKicker = async (sock, groupId) => {
  // Simplified - returns the first admin found
  try {
    const metadata = await sock.groupMetadata(groupId);
    const admins = metadata.participants.filter(p => p.admin);
    return admins.length > 0 ? admins[0].id : null;
  } catch {
    return null;
  }
};

module.exports = {
  handleGroupParticipantsUpdate,
  handleGroupKick
};