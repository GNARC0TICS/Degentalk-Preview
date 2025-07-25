/**
 * Title Configuration
 * 
 * Defines all title unlock paths and requirements for DegenTalk
 */

export interface TitleDefinition {
  id: string;
  name: string;
  icon: string;
  description?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const TITLE_DEFINITIONS = {
  // Level-based titles (automatic unlocks)
  levels: {
    1: { id: 'newfag', name: 'Newfag', icon: '🆕', rarity: 'common' as const },
    10: { id: 'novice_degen', name: 'Novice Degen', icon: '🎰', rarity: 'common' as const },
    25: { id: 'seasoned_gambler', name: 'Seasoned Gambler', icon: '🎲', rarity: 'uncommon' as const },
    50: { id: 'casino_regular', name: 'Casino Regular', icon: '🃏', rarity: 'uncommon' as const },
    75: { id: 'vip_degen', name: 'VIP Degen', icon: '🥂', rarity: 'rare' as const },
    100: { id: 'high_roller', name: 'High Roller', icon: '💎', rarity: 'rare' as const },
    150: { id: 'whale', name: 'Whale', icon: '🐋', rarity: 'epic' as const },
    200: { id: 'basement_dweller', name: 'Basement Dweller', icon: '🏚️', rarity: 'epic' as const },
    500: { id: 'no_life', name: 'No Life', icon: '💀', rarity: 'legendary' as const }
  },
  
  // Role-based titles (automatic for role holders)
  roles: {
    moderator: { id: 'forum_jannie', name: 'Forum Jannie', icon: '🧹', rarity: 'rare' as const },
    admin: { id: 'casino_boss', name: 'Casino Boss', icon: '🎩', rarity: 'legendary' as const },
    vip: { id: 'vip_whale', name: 'VIP Whale', icon: '🐋', rarity: 'epic' as const },
    contributor: { id: 'code_monkey', name: 'Code Monkey', icon: '🐒', rarity: 'rare' as const }
  },
  
  // Achievement-based titles
  achievements: {
    first_post: { id: 'lurker_no_more', name: 'Lurker No More', icon: '👁️' },
    tip_1000_dgt: { id: 'big_tipper', name: 'Big Tipper', icon: '💸' },
    lose_10000_dgt: { id: 'rekt', name: 'REKT', icon: '📉' },
    win_100000_dgt: { id: 'lucky_bastard', name: 'Lucky Bastard', icon: '🍀' },
    banned_once: { id: 'reformed_degen', name: 'Reformed Degen', icon: '😇' },
    thread_100_replies: { id: 'conversation_starter', name: 'Conversation Starter', icon: '💬' },
    post_1000_times: { id: 'spam_god', name: 'Spam God', icon: '📢' },
    online_24h: { id: 'touch_grass', name: 'Touch Grass', icon: '🌱' }
  },
  
  // Shop titles (purchasable with DGT)
  shop: {
    neon_degen: { 
      id: 'neon_degen', 
      name: 'Neon Degen', 
      icon: '🌟', 
      price: 5000,
      description: 'Glows in the dark'
    },
    diamond_hands: { 
      id: 'diamond_hands', 
      name: 'Diamond Hands', 
      icon: '💎🙌', 
      price: 10000,
      description: 'HODL gang'
    },
    moon_boy: { 
      id: 'moon_boy', 
      name: 'Moon Boy', 
      icon: '🚀', 
      price: 25000,
      description: 'To the moon!'
    },
    wojak: { 
      id: 'wojak', 
      name: 'Wojak', 
      icon: '😔', 
      price: 1337,
      description: 'Feels bad man'
    },
    pepe: { 
      id: 'pepe', 
      name: 'Rare Pepe', 
      icon: '🐸', 
      price: 42069,
      description: 'Extremely rare'
    }
  },
  
  // Special event titles (admin granted)
  special: {
    beta_tester: { id: 'beta_tester', name: 'Beta Tester', icon: '🧪', rarity: 'epic' as const },
    bug_hunter: { id: 'bug_hunter', name: 'Bug Hunter', icon: '🐛', rarity: 'rare' as const },
    event_winner: { id: 'event_winner', name: 'Event Winner', icon: '🏆', rarity: 'epic' as const },
    top_donor: { id: 'top_donor', name: 'Sugar Daddy', icon: '💰', rarity: 'legendary' as const }
  }
} as const;

// Helper to get all titles
export function getAllTitles(): TitleDefinition[] {
  const allTitles: TitleDefinition[] = [];
  
  Object.values(TITLE_DEFINITIONS.levels).forEach(title => allTitles.push(title));
  Object.values(TITLE_DEFINITIONS.roles).forEach(title => allTitles.push(title));
  Object.values(TITLE_DEFINITIONS.achievements).forEach(title => allTitles.push(title));
  Object.values(TITLE_DEFINITIONS.shop).forEach(title => allTitles.push(title));
  Object.values(TITLE_DEFINITIONS.special).forEach(title => allTitles.push(title));
  
  return allTitles;
}

// Get title by ID
export function getTitleById(titleId: string): TitleDefinition | undefined {
  return getAllTitles().find(title => title.id === titleId);
}