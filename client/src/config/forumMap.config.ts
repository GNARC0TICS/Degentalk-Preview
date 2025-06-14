// ForumFusion: Canonical Forum & Zone Config
// This file is the single source of truth for all forum logic, theming, and rules.

export type PrefixGrantRule = {
  slug: string;
  autoAssign: boolean;
  condition?: {
    minReplies?: number;
    minLikes?: number;
  };
};

export type ForumRules = {
  allowPosting: boolean;
  xpEnabled: boolean;
  tippingEnabled: boolean;
  xpMultiplier?: number;
  accessLevel?: 'public' | 'registered' | 'level_10+' | 'mod' | 'admin';
  availablePrefixes?: string[];
  prefixGrantRules?: PrefixGrantRule[];
  customComponent?: string;
};

export type ForumTheme = {
  color: string;
  icon: string;
  bannerImage: string;
  landingComponent: string;
};

export type Forum = {
  slug: string;
  name: string;
  rules: ForumRules;
  themeOverride?: Partial<ForumTheme>;
  parentForumSlug?: string; // Slug of the parent zone or a higher-level forum
};

export type Zone = {
  slug: string;
  name: string;
  type: 'primary' | 'general';
  description?: string; // Added description here
  theme?: ForumTheme;
  forums: Forum[];
};

export const forumMap: { zones: Zone[] } = {
  zones: [
    {
      slug: 'the-pit',
      name: 'The Pit',
      type: 'primary',
      theme: {
        color: '#FF4D00',
        icon: '🔥',
        bannerImage: '/banners/the-pit.jpg',
        landingComponent: 'PitLanding',
      },
      forums: [
        {
          slug: 'general-brawls',
          name: 'General Brawls',
          // parentForumSlug: 'the-pit', // Example: if 'the-pit' is its direct parent in config
          rules: {
            allowPosting: true,
            xpEnabled: true,
            tippingEnabled: true,
            availablePrefixes: ['[BRAWL]', '[DEBATE]'],
            prefixGrantRules: [
              { slug: '[HOT]', autoAssign: true, condition: { minReplies: 20, minLikes: 10 } },
              { slug: '[MOD]', autoAssign: false },
            ],
          },
        },
        {
          slug: 'pit-memes',
          name: 'Pit Memes',
          // parentForumSlug: 'the-pit', // Example
          rules: {
            allowPosting: true,
            xpEnabled: false,
            tippingEnabled: true,
            availablePrefixes: ['[MEME]', '[FUN]'],
          },
        },
      ],
    },
    {
      slug: 'mission-control',
      name: 'Mission Control',
      type: 'primary',
      theme: {
        color: '#0055FF',
        icon: '🛰️',
        bannerImage: '/banners/mission-control.jpg',
        landingComponent: 'MissionLanding',
      },
      forums: [
        {
          slug: 'alpha-leaks',
          name: 'Alpha Leaks',
          parentForumSlug: 'mission-control', // Explicitly setting parent
          rules: {
            allowPosting: true,
            xpEnabled: true,
            tippingEnabled: true,
            xpMultiplier: 2,
            accessLevel: 'level_10+',
            availablePrefixes: ['[LEAK]', '[ALPHA]'],
            prefixGrantRules: [
              { slug: '[ALPHA]', autoAssign: false },
              { slug: '[HOT]', autoAssign: true, condition: { minReplies: 10 } },
            ],
          },
        },
        {
          slug: 'project-analysis',
          name: 'Project Analysis',
          parentForumSlug: 'mission-control', // Explicitly setting parent
          rules: {
            allowPosting: true,
            xpEnabled: true,
            tippingEnabled: false,
            availablePrefixes: ['[REVIEW]', '[RESEARCH]'],
          },
        },
      ],
    },
    {
      slug: 'briefing-room',
      name: 'The Briefing Room',
      type: 'primary',
      theme: {
        color: '#00B894',
        icon: '📢',
        bannerImage: '/banners/briefing-room.jpg',
        landingComponent: 'BriefingLanding',
      },
      forums: [
        {
          slug: 'announcements',
          name: 'Announcements',
          rules: {
            allowPosting: false,
            xpEnabled: false,
            tippingEnabled: false,
            availablePrefixes: ['[ANN]'],
          },
        },
        {
          slug: 'news',
          name: 'News & Updates',
          rules: {
            allowPosting: true,
            xpEnabled: true,
            tippingEnabled: false,
            availablePrefixes: ['[NEWS]', '[UPDATE]'],
          },
        },
      ],
    },
    {
      slug: 'market-moves',
      name: 'Market Moves',
      type: 'general',
      forums: [
        {
          slug: 'signals-ta',
          name: 'Signals & TA',
          rules: {
            allowPosting: true,
            xpEnabled: true,
            tippingEnabled: true,
            availablePrefixes: ['[SIGNAL]', '[TA]'],
          },
        },
        {
          slug: 'trade-journals',
          name: 'Trade Journals',
          rules: {
            allowPosting: true,
            xpEnabled: false,
            tippingEnabled: true,
            availablePrefixes: ['[JOURNAL]'],
          },
        },
      ],
    },
    {
      slug: 'airdrops-quests',
      name: 'Airdrops & Quests',
      type: 'general',
      forums: [
        {
          slug: 'bounty-board',
          name: 'Bounty Board',
          rules: {
            allowPosting: true,
            xpEnabled: true,
            tippingEnabled: true,
            availablePrefixes: ['[BOUNTY]', '[QUEST]'],
          },
        },
      ],
    },
  ],
};

// CANONICAL PRIMARY ZONE THEMES
const PRIMARY_ZONE_THEMES = {
  'the-pit': {
    icon: '🔥',
    color: '#FF3C3C',
    bannerImage: '/banners/pit.jpg',
    landingComponent: 'PitLanding',
    description: 'Raw, unfiltered, and often unhinged. Welcome to the heart of degen discussion.',
  },
  'mission-control': {
    icon: '🎯',
    color: '#0088FF',
    bannerImage: '/banners/mission.jpg',
    landingComponent: 'MissionLanding',
    description: 'Strategic discussions, alpha, and project deep dives. For the serious degen.',
  },
  'casino-floor': {
    icon: '🎰',
    color: '#B950FF',
    bannerImage: '/banners/casino.jpg',
    landingComponent: 'CasinoLanding',
    description: 'Trading, gambling, and high-stakes plays. May the odds be ever in your favor.',
  },
  'briefing-room': {
    icon: '📰',
    color: '#FFD700',
    bannerImage: '/banners/briefing.jpg',
    landingComponent: 'BriefingLanding',
    description: 'News, announcements, and official updates. Stay informed.',
  },
  'the-archive': {
    icon: '🗄️',
    color: '#999999',
    bannerImage: '/banners/archive.jpg',
    landingComponent: 'ArchiveLanding',
    description: 'Historical records, past glories, and lessons learned. For the degen historian.',
  },
};

// --- PATCH ZONES ---
const existingZones: Zone[] = [ // Ensure the array is typed as Zone[]
  ...forumMap.zones.filter(z => !['casino-floor', 'the-archive'].includes(z.slug)),
  // Add missing canonical zones if not present
  ...(['casino-floor', 'the-archive']
    .filter(slug => !forumMap.zones.some(z => z.slug === slug))
    .map(slug => {
      const name = slug === 'casino-floor' ? 'The Casino Floor' : 'The Archive';
      // Explicitly create an object that conforms to the Zone type
      const newZone: Zone = {
        slug,
        name,
        type: 'primary', // This is a valid Zone['type']
        forums: [],
        // description and theme are optional, so they can be omitted here
        // they will be added by the patching logic below if it's a primary zone
      };
      return newZone;
    })
  ),
];

forumMap.zones = existingZones.map((zone) => {
  const defaults = PRIMARY_ZONE_THEMES[zone.slug as keyof typeof PRIMARY_ZONE_THEMES];
  if (zone.type === 'primary' && defaults) {
    return {
      ...zone,
      description: defaults.description,
      theme: {
        icon: defaults.icon,
        color: defaults.color,
        bannerImage: defaults.bannerImage,
        landingComponent: defaults.landingComponent,
      },
    };
  }
  return zone;
});
