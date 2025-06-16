// ForumMap Configuration - Single Source of Truth
// This file defines the canonical forum structure, themes, and rules for DegenTalk

// --- Type Definitions ---

export interface PrefixGrantRule {
  slug: string;
  autoAssign: boolean;
  condition?: {
    minReplies?: number;
    minLikes?: number;
    minXp?: number;
    role?: string;
  };
}

export interface ForumRules {
  // Core permissions
  allowPosting: boolean;
  xpEnabled: boolean;
  tippingEnabled: boolean;
  
  // XP configuration
  xpMultiplier?: number;
  
  // Access control
  accessLevel?: 'public' | 'registered' | 'level_10+' | 'vip' | 'mod' | 'admin';
  minXpRequired?: number;
  
  // Content features
  allowPolls?: boolean;
  allowTags?: boolean;
  allowAttachments?: boolean;
  
  // Prefix system
  availablePrefixes?: string[];
  prefixGrantRules?: PrefixGrantRule[];
  requiredPrefix?: boolean;
  
  // Custom behaviors
  customComponent?: string;
  customRules?: Record<string, unknown>;
}

export interface ForumTheme {
  // Visual identity
  color: string;
  icon: string;
  colorTheme: string; // CSS theme class
  
  // Assets
  bannerImage?: string;
  backgroundImage?: string;
  
  // Components
  landingComponent?: string;
  customStyles?: Record<string, string>;
}

export interface Forum {
  // Identity
  slug: string;
  name: string;
  description?: string;
  
  // Configuration
  rules: ForumRules;
  themeOverride?: Partial<ForumTheme>;
  
  // Metadata
  position?: number;
  tags?: string[];
}

export interface Zone {
  // Identity
  slug: string;
  name: string;
  description: string;
  
  // Type & hierarchy
  type: 'primary' | 'general';
  position?: number;
  
  // Configuration
  theme: ForumTheme;
  defaultRules?: Partial<ForumRules>; // Default rules for child forums
  
  // Child forums
  forums: Forum[];
}

// --- Theme Presets ---

const THEME_PRESETS = {
  pit: {
    color: '#FF4D00',
    icon: '🔥',
    colorTheme: 'theme-pit',
    bannerImage: '/assets/banners/the-pit.webp',
    landingComponent: 'PitLanding',
  },
  mission: {
    color: '#0088FF',
    icon: '🎯',
    colorTheme: 'theme-mission',
    bannerImage: '/assets/banners/mission-control.webp',
    landingComponent: 'MissionLanding',
  },
  casino: {
    color: '#B950FF',
    icon: '🎰',
    colorTheme: 'theme-casino',
    bannerImage: '/assets/banners/casino-floor.webp',
    landingComponent: 'CasinoLanding',
  },
  briefing: {
    color: '#FFD700',
    icon: '📰',
    colorTheme: 'theme-briefing',
    bannerImage: '/assets/banners/briefing-room.webp',
    landingComponent: 'BriefingLanding',
  },
  archive: {
    color: '#999999',
    icon: '🗄️',
    colorTheme: 'theme-archive',
    bannerImage: '/assets/banners/the-archive.webp',
    landingComponent: 'ArchiveLanding',
  },
} as const;

// --- Default Rules ---

const DEFAULT_FORUM_RULES: ForumRules = {
  allowPosting: true,
  xpEnabled: true,
  tippingEnabled: false,
  xpMultiplier: 1,
  accessLevel: 'registered',
  allowPolls: true,
  allowTags: true,
  allowAttachments: true,
  requiredPrefix: false,
};

// --- Zone Configurations ---

const PRIMARY_ZONES: Zone[] = [
  {
    slug: 'the-pit',
    name: 'The Pit',
    description: 'Raw, unfiltered chaos. Home of the true degens.',
    type: 'primary',
    position: 1,
    theme: THEME_PRESETS.pit,
    defaultRules: {
      tippingEnabled: true,
      xpMultiplier: 1.5,
    },
    forums: [
      {
        slug: 'general-brawls',
        name: 'General Brawls',
        description: 'No holds barred discussion zone',
        position: 1,
        rules: {
          ...DEFAULT_FORUM_RULES,
          tippingEnabled: true,
          xpMultiplier: 1.5,
          availablePrefixes: ['[BRAWL]', '[DEBATE]', '[RAGE]', '[COPE]'],
          prefixGrantRules: [
            {
              slug: '[HOT]',
              autoAssign: true,
              condition: { minReplies: 20, minLikes: 10 }
            },
            {
              slug: '[NUCLEAR]',
              autoAssign: true,
              condition: { minReplies: 50, minLikes: 25 }
            },
          ],
        },
      },
      {
        slug: 'shitpost-central',
        name: 'Shitpost Central',
        description: 'Maximum chaos, minimum sense',
        position: 2,
        rules: {
          ...DEFAULT_FORUM_RULES,
          xpEnabled: false, // No XP for shitposting
          tippingEnabled: true,
          availablePrefixes: ['[MEME]', '[SHITPOST]', '[BASED]', '[CRINGE]'],
          requiredPrefix: true,
        },
      },
      {
        slug: 'cope-cage',
        name: 'The Cope Cage',
        description: 'For when your bags are heavy',
        position: 3,
        rules: {
          ...DEFAULT_FORUM_RULES,
          tippingEnabled: true,
          availablePrefixes: ['[COPE]', '[HOPIUM]', '[REKT]', '[GUH]'],
        },
      },
    ],
  },
  {
    slug: 'mission-control',
    name: 'Mission Control',
    description: 'Strategic planning and alpha hunting grounds.',
    type: 'primary',
    position: 2,
    theme: THEME_PRESETS.mission,
    defaultRules: {
      xpMultiplier: 2,
      accessLevel: 'level_10+',
    },
    forums: [
      {
        slug: 'alpha-leaks',
        name: 'Alpha Leaks',
        description: 'High-value intel only',
        position: 1,
        rules: {
          ...DEFAULT_FORUM_RULES,
          xpMultiplier: 3,
          tippingEnabled: true,
          accessLevel: 'level_10+',
          availablePrefixes: ['[ALPHA]', '[LEAK]', '[INSIDER]', '[CONFIRMED]'],
          prefixGrantRules: [
            {
              slug: '[VERIFIED]',
              autoAssign: false,
              condition: { role: 'mod' }
            },
          ],
        },
        tags: ['premium', 'verified-only'],
      },
      {
        slug: 'research-lab',
        name: 'Research Lab',
        description: 'Deep dives and technical analysis',
        position: 2,
        rules: {
          ...DEFAULT_FORUM_RULES,
          xpMultiplier: 2,
          availablePrefixes: ['[RESEARCH]', '[ANALYSIS]', '[DD]', '[THESIS]'],
          allowAttachments: true,
        },
      },
      {
        slug: 'strategy-room',
        name: 'Strategy Room',
        description: 'Plan your next moves',
        position: 3,
        rules: {
          ...DEFAULT_FORUM_RULES,
          xpMultiplier: 1.5,
          availablePrefixes: ['[STRATEGY]', '[PLAN]', '[PLAYBOOK]'],
        },
      },
    ],
  },
  {
    slug: 'casino-floor',
    name: 'The Casino Floor',
    description: 'High stakes, higher dopamine. Gamble responsibly (or don\'t).',
    type: 'primary',
    position: 3,
    theme: THEME_PRESETS.casino,
    defaultRules: {
      tippingEnabled: true,
      xpMultiplier: 2,
    },
    forums: [
      {
        slug: 'degen-bets',
        name: 'Degen Bets',
        description: 'YOLO plays and moonshots',
        position: 1,
        rules: {
          ...DEFAULT_FORUM_RULES,
          tippingEnabled: true,
          xpMultiplier: 2.5,
          availablePrefixes: ['[YOLO]', '[BET]', '[LONG]', '[SHORT]', '[LEVERAGE]'],
          prefixGrantRules: [
            {
              slug: '[LEGEND]',
              autoAssign: true,
              condition: { minXp: 10000 }
            },
          ],
        },
      },
      {
        slug: 'prediction-markets',
        name: 'Prediction Markets',
        description: 'Put your money where your mouth is',
        position: 2,
        rules: {
          ...DEFAULT_FORUM_RULES,
          tippingEnabled: true,
          xpMultiplier: 2,
          availablePrefixes: ['[PREDICT]', '[ODDS]', '[MARKET]'],
          customComponent: 'PredictionMarket',
        },
      },
      {
        slug: 'gains-porn',
        name: 'Gains Porn',
        description: 'Flex your wins (proof required)',
        position: 3,
        rules: {
          ...DEFAULT_FORUM_RULES,
          tippingEnabled: true,
          availablePrefixes: ['[GAINS]', '[PROOF]', '[MOON]'],
          requiredPrefix: true,
          customRules: {
            requireProof: true,
            minGainPercentage: 100,
          },
        },
      },
    ],
  },
  {
    slug: 'briefing-room',
    name: 'The Briefing Room',
    description: 'Official announcements and platform updates.',
    type: 'primary',
    position: 4,
    theme: THEME_PRESETS.briefing,
    defaultRules: {
      xpEnabled: false,
      tippingEnabled: false,
    },
    forums: [
      {
        slug: 'announcements',
        name: 'Platform Announcements',
        description: 'Official DegenTalk updates',
        position: 1,
        rules: {
          allowPosting: false, // Admin only
          xpEnabled: false,
          tippingEnabled: false,
          accessLevel: 'admin',
          availablePrefixes: ['[ANNOUNCEMENT]', '[UPDATE]', '[CRITICAL]'],
        },
      },
      {
        slug: 'news-feed',
        name: 'Crypto News Feed',
        description: 'Breaking news and market updates',
        position: 2,
        rules: {
          ...DEFAULT_FORUM_RULES,
          xpEnabled: true,
          availablePrefixes: ['[NEWS]', '[BREAKING]', '[RUMOR]', '[CONFIRMED]'],
        },
      },
      {
        slug: 'ama-stage',
        name: 'AMA Stage',
        description: 'Ask Me Anything sessions',
        position: 3,
        rules: {
          ...DEFAULT_FORUM_RULES,
          tippingEnabled: true,
          availablePrefixes: ['[AMA]', '[LIVE]', '[Q&A]'],
          customComponent: 'AMAThread',
        },
      },
    ],
  },
  {
    slug: 'the-archive',
    name: 'The Archive',
    description: 'Historical records and legendary threads.',
    type: 'primary',
    position: 5,
    theme: THEME_PRESETS.archive,
    defaultRules: {
      allowPosting: false, // Read-only by default
      xpEnabled: false,
    },
    forums: [
      {
        slug: 'hall-of-fame',
        name: 'Hall of Fame',
        description: 'Legendary calls and epic wins',
        position: 1,
        rules: {
          allowPosting: false,
          xpEnabled: false,
          tippingEnabled: false,
          accessLevel: 'public',
          availablePrefixes: ['[LEGEND]', '[CLASSIC]', '[HISTORIC]'],
        },
      },
      {
        slug: 'rekt-museum',
        name: 'REKT Museum',
        description: 'Learn from the fallen',
        position: 2,
        rules: {
          allowPosting: false,
          xpEnabled: false,
          tippingEnabled: false,
          availablePrefixes: ['[REKT]', '[F]', '[CAUTIONARY]'],
        },
      },
    ],
  },
];

// --- General Zones ---

const GENERAL_ZONES: Zone[] = [
  {
    slug: 'market-analysis',
    name: 'Market Analysis',
    description: 'Technical analysis and market discussion',
    type: 'general',
    position: 10,
    theme: {
      color: '#2ECC71',
      icon: '📊',
      colorTheme: 'theme-market',
    },
    forums: [
      {
        slug: 'btc-analysis',
        name: 'BTC Analysis',
        position: 1,
        rules: {
          ...DEFAULT_FORUM_RULES,
          availablePrefixes: ['[TA]', '[FA]', '[SIGNAL]', '[TARGET]'],
        },
      },
      {
        slug: 'altcoin-analysis',
        name: 'Altcoin Analysis',
        position: 2,
        rules: {
          ...DEFAULT_FORUM_RULES,
          availablePrefixes: ['[ALT]', '[GEM]', '[ANALYSIS]'],
        },
      },
    ],
  },
  {
    slug: 'defi-lab',
    name: 'DeFi Laboratory',
    description: 'DeFi protocols, yield farming, and strategies',
    type: 'general',
    position: 11,
    theme: {
      color: '#3498DB',
      icon: '🧪',
      colorTheme: 'theme-defi',
    },
    forums: [
      {
        slug: 'yield-farming',
        name: 'Yield Farming',
        position: 1,
        rules: {
          ...DEFAULT_FORUM_RULES,
          tippingEnabled: true,
          availablePrefixes: ['[FARM]', '[APY]', '[YIELD]', '[RISK]'],
        },
      },
      {
        slug: 'protocol-discussion',
        name: 'Protocol Discussion',
        position: 2,
        rules: {
          ...DEFAULT_FORUM_RULES,
          availablePrefixes: ['[PROTOCOL]', '[AUDIT]', '[SECURITY]'],
        },
      },
    ],
  },
  {
    slug: 'nft-district',
    name: 'NFT District',
    description: 'JPEGs, art, and digital collectibles',
    type: 'general',
    position: 12,
    theme: {
      color: '#E74C3C',
      icon: '🖼️',
      colorTheme: 'theme-nft',
    },
    forums: [
      {
        slug: 'nft-calls',
        name: 'NFT Calls',
        position: 1,
        rules: {
          ...DEFAULT_FORUM_RULES,
          tippingEnabled: true,
          availablePrefixes: ['[MINT]', '[FLIP]', '[HODL]', '[BLUECHIP]'],
        },
      },
      {
        slug: 'art-gallery',
        name: 'Art Gallery',
        position: 2,
        rules: {
          ...DEFAULT_FORUM_RULES,
          allowAttachments: true,
          availablePrefixes: ['[ART]', '[SHOWCASE]', '[COLLECTION]'],
        },
      },
    ],
  },
];

// --- Export Configuration ---

export const forumMap = {
  zones: [...PRIMARY_ZONES, ...GENERAL_ZONES],
  
  // Helper methods
  getZoneBySlug: (slug: string) => 
    forumMap.zones.find(z => z.slug === slug),
  
  getForumBySlug: (slug: string) => {
    for (const zone of forumMap.zones) {
      const forum = zone.forums.find(f => f.slug === slug);
      if (forum) return { forum, zone };
    }
    return null;
  },
  
  getPrimaryZones: () => 
    forumMap.zones.filter(z => z.type === 'primary'),
  
  getGeneralZones: () => 
    forumMap.zones.filter(z => z.type === 'general'),
  
  // Config metadata
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
};

// --- Validation ---

// Ensure unique slugs
const allSlugs = new Set<string>();
forumMap.zones.forEach(zone => {
  if (allSlugs.has(zone.slug)) {
    throw new Error(`Duplicate zone slug: ${zone.slug}`);
  }
  allSlugs.add(zone.slug);
  
  zone.forums.forEach(forum => {
    if (allSlugs.has(forum.slug)) {
      throw new Error(`Duplicate forum slug: ${forum.slug}`);
    }
    allSlugs.add(forum.slug);
  });
});