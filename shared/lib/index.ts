// admin-module-registry moved to client - requires admin.config

// Auth utilities
// canUser moved to server - requires DB access

// Emoji utilities
export * from './emoji/unlockEmojiPack.js';

// Forum utilities
// canUserPost and getForumRules moved to client - require client context
export * from './forum/getAvailablePrefixes.js';
export * from './forum/prefixEngine.js';
export * from './forum/shouldAwardXP.js';

// Mentions utilities
export * from './mentions/createMentionsIndex.js';
export * from './mentions/utils.js';

// Moderation utilities
export * from './moderation/applyModerationAction.js';

// Wallet utilities
export * from './wallet/testUtils.js';
