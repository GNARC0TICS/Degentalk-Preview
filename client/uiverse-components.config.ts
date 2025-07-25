import { z } from 'zod';

// Loader message configurations
export const loaderMessagesSchema = z.object({
  sleepyLoader: z.object({
    default: z.array(z.string()),
    seasonal: z.record(z.array(z.string())).optional(), // 'christmas', 'halloween', etc.
    eventBased: z.record(z.array(z.string())).optional(), // 'maintenance', 'update', etc.
    userLevel: z.record(z.array(z.string())).optional(), // 'newbie', 'veteran', 'whale', etc.
  }),
  degenLoader: z.object({
    defaultText: z.string(),
    cryptoSymbols: z.array(z.string()), // ['$', '₿', 'Ξ', etc.]
    levelBasedText: z.record(z.string()).optional(),
  }),
  radarLoader: z.object({
    defaultText: z.string(),
    searchContextText: z.record(z.string()), // 'users': 'Scanning users...', 'threads': 'Finding threads...'
  })
});

// Button theme configurations  
export const buttonThemesSchema = z.object({
  pumpButton: z.object({
    variants: z.object({
      pump: z.object({
        gradient: z.string(),
        shadow: z.string(),
        hoverShadow: z.string(),
        icon: z.string().optional(),
      }),
      dump: z.object({
        gradient: z.string(),
        shadow: z.string(),
        hoverShadow: z.string(),
        icon: z.string().optional(),
      }),
      neutral: z.object({
        gradient: z.string(),
        shadow: z.string(),
        hoverShadow: z.string(),
      })
    }),
    seasonal: z.record(z.object({
      pump: z.object({
        gradient: z.string(),
        shadow: z.string(),
      }),
      dump: z.object({
        gradient: z.string(),
        shadow: z.string(),
      })
    })).optional(),
    userLevelOverrides: z.record(z.object({
      pulseAnimation: z.boolean(),
      particleEffects: z.boolean(),
      glowIntensity: z.number(),
    })).optional()
  }),
  copeButton: z.object({
    sadEmojis: z.array(z.string()),
    levelBasedEmojis: z.record(z.array(z.string())).optional(),
    animations: z.object({
      droopIntensity: z.number(),
      hoverDelay: z.number(),
    })
  }),
  red3DButton: z.object({
    baseGradient: z.string(),
    shadowColor: z.string(),
    depth: z.number(),
    warningIcon: z.string(),
    criticalActions: z.array(z.string()), // ['delete', 'ban', 'reset']
  })
});

// Animation configurations
export const animationConfigSchema = z.object({
  globalSpeed: z.number().min(0.1).max(3).default(1), // Speed multiplier
  reducedMotion: z.boolean().default(false),
  particleEffects: z.object({
    enabled: z.boolean(),
    density: z.number().min(1).max(10),
    colors: z.array(z.string()),
  }),
  glowEffects: z.object({
    enabled: z.boolean(),
    intensity: z.number().min(0).max(1),
    pulseSpeed: z.number(),
  })
});

// Card configurations
export const cardConfigSchema = z.object({
  brutalistCard: z.object({
    borderWidth: z.number(),
    shadowOffset: z.number(),
    accentColors: z.array(z.string()),
    noiseTexture: z.boolean(),
  }),
  shopCard3D: z.object({
    perspective: z.number(),
    rotationIntensity: z.number(),
    glowOnHover: z.boolean(),
    rarityGradients: z.record(z.string()), // 'common', 'rare', 'legendary'
  })
});

// Main configuration
export const uiverseComponentsConfigSchema = z.object({
  loaderMessages: loaderMessagesSchema,
  buttonThemes: buttonThemesSchema,
  animations: animationConfigSchema,
  cards: cardConfigSchema,
  // Feature flags for components
  features: z.object({
    enableParticleEffects: z.boolean(),
    enableGlowEffects: z.boolean(),
    enable3DEffects: z.boolean(),
    enableCustomCursors: z.boolean(),
  }),
  // A/B testing variants
  experiments: z.object({
    buttonVariant: z.enum(['default', 'aggressive', 'subtle']),
    loaderPersonality: z.enum(['funny', 'professional', 'degen']),
  }).optional()
});

// Default configuration
export const defaultUiverseConfig: z.infer<typeof uiverseComponentsConfigSchema> = {
  loaderMessages: {
    sleepyLoader: {
      default: [
        "This is taking a while...",
        "Still working on it...",
        "Maybe grab a coffee? ☕",
        "Almost there... probably...",
        "Zzz... oh, still loading!",
        "Have you tried turning it off and on again?",
        "Loading harder...",
        "My bad, this is slow today...",
        "🐌 Snail mode activated",
        "Worth the wait, I promise!"
      ],
      seasonal: {
        christmas: [
          "Santa's checking the list twice...",
          "🎄 Loading presents...",
          "Ho ho ho... still loading!",
        ],
        halloween: [
          "👻 Boo! Still loading...",
          "Summoning data from the void...",
          "🎃 Carving out your request...",
        ]
      },
      userLevel: {
        newbie: [
          "Welcome! This might take a moment...",
          "Getting things ready for you...",
          "First time? Don't worry, almost done!",
        ],
        whale: [
          "VIP loading experience... still loading though 🐋",
          "Your premium loader is working overtime...",
          "Even whales have to wait sometimes...",
        ]
      }
    },
    degenLoader: {
      defaultText: "Loading gains...",
      cryptoSymbols: ['$', '₿', 'Ξ', '◈', '₮'],
      levelBasedText: {
        newbie: "Counting pennies...",
        trader: "Calculating profits...",
        whale: "Moving markets...",
        degen: "APE-ing in..."
      }
    },
    radarLoader: {
      defaultText: "Scanning...",
      searchContextText: {
        users: "Finding degens...",
        threads: "Discovering alpha...",
        zones: "Exploring territories...",
        transactions: "Tracking on-chain..."
      }
    }
  },
  buttonThemes: {
    pumpButton: {
      variants: {
        pump: {
          gradient: "from-emerald-500 to-green-400",
          shadow: "0_0_20px_rgba(16,185,129,0.5)",
          hoverShadow: "0_0_30px_rgba(16,185,129,0.8)",
          icon: "arrow-up"
        },
        dump: {
          gradient: "from-red-500 to-pink-500",
          shadow: "0_0_20px_rgba(239,68,68,0.5)",
          hoverShadow: "0_0_30px_rgba(239,68,68,0.8)",
          icon: "arrow-down"
        },
        neutral: {
          gradient: "from-zinc-700 to-zinc-600",
          shadow: "0_0_20px_rgba(113,113,122,0.3)",
          hoverShadow: "0_0_30px_rgba(113,113,122,0.5)"
        }
      },
      userLevelOverrides: {
        whale: {
          pulseAnimation: true,
          particleEffects: true,
          glowIntensity: 1
        },
        newbie: {
          pulseAnimation: false,
          particleEffects: false,
          glowIntensity: 0.3
        }
      }
    },
    copeButton: {
      sadEmojis: ['(╥﹏╥)', '(っ◔◡◔)っ', '(｡•́︿•̀｡)', '( ͡° ͜ʖ ͡°)'],
      levelBasedEmojis: {
        rekt: ['💀', '📉', '🪦'],
        surviving: ['😅', '🥲', '😬'],
      },
      animations: {
        droopIntensity: 1,
        hoverDelay: 0.3
      }
    },
    red3DButton: {
      baseGradient: "linear-gradient(145deg, #dc2626, #b91c1c)",
      shadowColor: "#7f1d1d",
      depth: 4,
      warningIcon: "exclamation-triangle",
      criticalActions: ['delete', 'ban', 'reset', 'nuke']
    }
  },
  animations: {
    globalSpeed: 1,
    reducedMotion: false,
    particleEffects: {
      enabled: true,
      density: 3,
      colors: ['#10b981', '#06b6d4', '#fbbf24']
    },
    glowEffects: {
      enabled: true,
      intensity: 0.7,
      pulseSpeed: 1.5
    }
  },
  cards: {
    brutalistCard: {
      borderWidth: 3,
      shadowOffset: 8,
      accentColors: ['#10b981', '#dc2626', '#fbbf24'],
      noiseTexture: true
    },
    shopCard3D: {
      perspective: 1000,
      rotationIntensity: 15,
      glowOnHover: true,
      rarityGradients: {
        common: "from-zinc-600 to-zinc-700",
        rare: "from-blue-600 to-blue-700",
        epic: "from-purple-600 to-purple-700",
        legendary: "from-amber-500 to-amber-600",
        mythic: "from-red-500 via-purple-500 to-blue-500"
      }
    }
  },
  features: {
    enableParticleEffects: true,
    enableGlowEffects: true,
    enable3DEffects: true,
    enableCustomCursors: false
  },
  experiments: {
    buttonVariant: 'default',
    loaderPersonality: 'degen'
  }
};

// Helper to get current season
export function getCurrentSeason(): string | null {
  const month = new Date().getMonth();
  if (month === 11 || month === 0) return 'christmas';
  if (month === 9) return 'halloween';
  if (month >= 5 && month <= 7) return 'summer';
  return null;
}

// Helper to get user level config
export function getUserLevelConfig(xp: number): string {
  if (xp < 100) return 'newbie';
  if (xp < 1000) return 'trader';
  if (xp < 10000) return 'degen';
  return 'whale';
}

export type UiverseComponentsConfig = z.infer<typeof uiverseComponentsConfigSchema>;