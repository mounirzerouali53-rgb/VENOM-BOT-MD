/**
 * Simple JSON-based Database for Group Settings
 */

const fs = require('fs');
const path = require('path');
const config = require('./config');

const DB_PATH = path.join(__dirname, 'database');
const GROUPS_DB = path.join(DB_PATH, 'groups.json');
const USERS_DB = path.join(DB_PATH, 'users.json');
const WARNINGS_DB = path.join(DB_PATH, 'warnings.json');
const MODS_DB = path.join(DB_PATH, 'mods.json');

// Initialize database directory
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

// Initialize database files
const initDB = (filePath, defaultData = {}) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

initDB(GROUPS_DB, {});
initDB(USERS_DB, {});
initDB(WARNINGS_DB, {});
initDB(MODS_DB, { moderators: [] });

// Read database
const readDB = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading database: ${error.message}`);
    return {};
  }
};

// Write database
const writeDB = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing database: ${error.message}`);
    return false;
  }
};

// Group Settings
const getGroupSettings = (groupId) => {
  const groups = readDB(GROUPS_DB);
  if (!groups[groupId]) {
    groups[groupId] = { ...config.defaultGroupSettings };
    writeDB(GROUPS_DB, groups);
  }
  return groups[groupId];
};

const updateGroupSettings = (groupId, settings) => {
  const groups = readDB(GROUPS_DB);
  groups[groupId] = { ...groups[groupId], ...settings };
  return writeDB(GROUPS_DB, groups);
};

// User Data
const getUser = (userId) => {
  const users = readDB(USERS_DB);
  if (!users[userId]) {
    users[userId] = {
      registered: Date.now(),
      premium: false,
      banned: false
    };
    writeDB(USERS_DB, users);
  }
  return users[userId];
};

const updateUser = (userId, data) => {
  const users = readDB(USERS_DB);
  users[userId] = { ...users[userId], ...data };
  return writeDB(USERS_DB, users);
};

// Warnings System
const getWarnings = (groupId, userId) => {
  const warnings = readDB(WARNINGS_DB);
  const key = `${groupId}_${userId}`;
  return warnings[key] || { count: 0, warnings: [] };
};

const addWarning = (groupId, userId, reason) => {
  const warnings = readDB(WARNINGS_DB);
  const key = `${groupId}_${userId}`;
  
  if (!warnings[key]) {
    warnings[key] = { count: 0, warnings: [] };
  }
  
  warnings[key].count++;
  warnings[key].warnings.push({
    reason,
    date: Date.now()
  });
  
  writeDB(WARNINGS_DB, warnings);
  return warnings[key];
};

const removeWarning = (groupId, userId) => {
  const warnings = readDB(WARNINGS_DB);
  const key = `${groupId}_${userId}`;
  
  if (warnings[key] && warnings[key].count > 0) {
    warnings[key].count--;
    warnings[key].warnings.pop();
    writeDB(WARNINGS_DB, warnings);
    return true;
  }
  return false;
};

const clearWarnings = (groupId, userId) => {
  const warnings = readDB(WARNINGS_DB);
  const key = `${groupId}_${userId}`;
  delete warnings[key];
  return writeDB(WARNINGS_DB, warnings);
};

// Moderators System
const getModerators = () => {
  const mods = readDB(MODS_DB);
  return mods.moderators || [];
};

const addModerator = (userId) => {
  const mods = readDB(MODS_DB);
  if (!mods.moderators) mods.moderators = [];
  if (!mods.moderators.includes(userId)) {
    mods.moderators.push(userId);
    return writeDB(MODS_DB, mods);
  }
  return false;
};

const removeModerator = (userId) => {
  const mods = readDB(MODS_DB);
  if (mods.moderators) {
    mods.moderators = mods.moderators.filter(id => id !== userId);
    return writeDB(MODS_DB, mods);
  }
  return false;
};

const isModerator = (userId) => {
  const mods = getModerators();
  return mods.includes(userId);
};
// ========== ADMIN GUARD SETTINGS ==========
const getAdminGuardStatus = (groupId) => {
  const groups = readDB(GROUPS_DB);
  return groups[groupId]?.adminGuard || false;
};

const setAdminGuardStatus = (groupId, enabled) => {
  const groups = readDB(GROUPS_DB);
  if (!groups[groupId]) {
    groups[groupId] = { ...config.defaultGroupSettings };
  }
  groups[groupId].adminGuard = enabled;
  return writeDB(GROUPS_DB, groups);
};

// ========== PROTECTED MEMBERS (Whitelist) ==========
const getProtectedMembers = (groupId) => {
  const groups = readDB(GROUPS_DB);
  return groups[groupId]?.protectedMembers || [];
};

const addProtectedMember = (groupId, jid) => {
  const groups = readDB(GROUPS_DB);
  if (!groups[groupId]) {
    groups[groupId] = { ...config.defaultGroupSettings };
  }
  if (!groups[groupId].protectedMembers) {
    groups[groupId].protectedMembers = [];
  }
  if (!groups[groupId].protectedMembers.includes(jid)) {
    groups[groupId].protectedMembers.push(jid);
  }
  return writeDB(GROUPS_DB, groups);
};

const removeProtectedMember = (groupId, jid) => {
  const groups = readDB(GROUPS_DB);
  if (groups[groupId] && groups[groupId].protectedMembers) {
    groups[groupId].protectedMembers = groups[groupId].protectedMembers.filter(m => m !== jid);
    return writeDB(GROUPS_DB, groups);
  }
  return false;
};

const isProtectedMember = (groupId, jid) => {
  const groups = readDB(GROUPS_DB);
  const members = groups[groupId]?.protectedMembers || [];
  const normalized = jid.split('@')[0];
  
  return members.some(member => 
    member.includes(normalized) || normalized.includes(member.split('@')[0])
  );
};

const getProtectedMembersList = (groupId) => {
  const groups = readDB(GROUPS_DB);
  return groups[groupId]?.protectedMembers || [];
};

// ========== KICK TRACKING ==========
const getKickTracker = (groupId) => {
  const groups = readDB(GROUPS_DB);
  return groups[groupId]?.kickTracker || {};
};

const addKickRecord = (groupId, adminJid) => {
  const groups = readDB(GROUPS_DB);
  if (!groups[groupId]) {
    groups[groupId] = { ...config.defaultGroupSettings };
  }
  if (!groups[groupId].kickTracker) {
    groups[groupId].kickTracker = {};
  }
  
  const now = Date.now();
  if (!groups[groupId].kickTracker[adminJid]) {
    groups[groupId].kickTracker[adminJid] = [];
  }
  
  groups[groupId].kickTracker[adminJid].push(now);
  
  // Filter records from last 20 seconds only
  groups[groupId].kickTracker[adminJid] = groups[groupId].kickTracker[adminJid].filter(
    timestamp => now - timestamp < 20000
  );
  
  writeDB(GROUPS_DB, groups);
  return groups[groupId].kickTracker[adminJid].length;
};

const clearKickTracker = (groupId, adminJid) => {
  const groups = readDB(GROUPS_DB);
  if (groups[groupId] && groups[groupId].kickTracker) {
    delete groups[groupId].kickTracker[adminJid];
    writeDB(GROUPS_DB, groups);
  }
};
module.exports = {
  getGroupSettings,
  updateGroupSettings,
  getUser,
  updateUser,
  getWarnings,
  addWarning,
  removeWarning,
  clearWarnings,
  getModerators,
  addModerator,
  removeModerator,
  isModerator,
  // Admin Guard
  getAdminGuardStatus,
  setAdminGuardStatus,
  getProtectedMembers,
  addProtectedMember,
  removeProtectedMember,
  isProtectedMember,
  getProtectedMembersList,
  getKickTracker,
  addKickRecord,
  clearKickTracker
};