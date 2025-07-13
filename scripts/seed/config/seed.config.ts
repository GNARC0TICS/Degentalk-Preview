import { z } from 'zod';

/**
 * Master seed configuration with validation
 * Controls all aspects of the platform simulation
 */

// Zod schema for type safety
export const SeedConfigSchema = z.object({
	// Environment control
	environment: z.object({
		mode: z.enum(['dev', 'staging', 'prod']),
		safeMode: z.boolean().default(false),
		forceReseed: z.boolean().default(false),
		verboseLogging: z.boolean().default(true)
	}),

	// User distribution (halved from original plan)
	users: z.object({
		total: z.number().default(50),
		distribution: z.object({
			admins: z.number().default(1),
			mods: z.number().default(2),
			whales: z.number().default(2),
			veterans: z.number().default(10),
			active: z.number().default(25),
			newbies: z.number().default(8),
			banned: z.number().default(1),
			shadowBanned: z.number().default(1)
		}),
		behaviors: z.object({
			postFrequency: z.object({
				low: z.number().default(0.3),
				medium: z.number().default(0.5),
				high: z.number().default(0.2)
			}),
			tipGenerosity: z.object({
				stingy: z.number().default(0.4),
				normal: z.number().default(0.4),
				generous: z.number().default(0.2)
			})
		})
	}),

	// Content generation (realistic scale)
	content: z.object({
		threads: z.object({
			total: z.number().default(250),
			perForum: z.object({
				min: z.number().default(10),
				max: z.number().default(50)
			}),
			types: z.object({
				normal: z.number().default(0.7),
				jackpot: z.number().default(0.1),
				surge: z.number().default(0.1),
				announcement: z.number().default(0.05),
				guide: z.number().default(0.05)
			}),
			specialStates: z.object({
				locked: z.number().default(0.05),
				pinned: z.number().default(0.06),
				solved: z.number().default(0.1)
			})
		}),
		posts: z.object({
			total: z.number().default(2500),
			perThread: z.object({
				min: z.number().default(5),
				max: z.number().default(50)
			}),
			features: z.object({
				hasImages: z.number().default(0.2),
				hasReactions: z.number().default(0.6),
				hasTips: z.number().default(0.05),
				hasMentions: z.number().default(0.15),
				isEdited: z.number().default(0.1)
			}),
			edgeCases: z.object({
				unicodeChaos: z.number().default(0.01),
				maxLength: z.number().default(0.001),
				deepNesting: z.number().default(0.02)
			})
		})
	}),

	// Economy simulation
	economy: z.object({
		transactions: z.object({
			dgtTransfers: z.number().default(500),
			tips: z.number().default(250),
			rainEvents: z.number().default(25),
			shopPurchases: z.number().default(100)
		}),
		patterns: z.object({
			tipAmounts: z.object({
				small: z.object({ range: z.tuple([z.number(), z.number()]).default([1, 10]), chance: z.number().default(0.7) }),
				medium: z.object({ range: z.tuple([z.number(), z.number()]).default([10, 100]), chance: z.number().default(0.25) }),
				whale: z.object({ range: z.tuple([z.number(), z.number()]).default([100, 1000]), chance: z.number().default(0.05) })
			}),
			rainSettings: z.object({
				amounts: z.array(z.number()).default([100, 500, 1000, 5000]),
				participants: z.array(z.number()).default([10, 25, 50, 100])
			})
		})
	}),

	// Gamification depth
	gamification: z.object({
		xpActions: z.object({
			simulateAll: z.boolean().default(true),
			dailyCaps: z.boolean().default(true),
			cooldowns: z.boolean().default(true),
			multipliers: z.boolean().default(true)
		}),
		achievements: z.object({
			progressSimulation: z.boolean().default(true),
			unlockPercentage: z.number().default(0.3),
			chainedAchievements: z.boolean().default(true)
		}),
		missions: z.object({
			activePerUser: z.number().default(3),
			completionRate: z.number().default(0.6),
			streakSimulation: z.boolean().default(true)
		})
	}),

	// Shop & Cosmetics
	cosmetics: z.object({
		ownership: z.object({
			whaleOwnsAll: z.boolean().default(true),
			veteranRareItems: z.number().default(0.7),
			newbieStarterPack: z.boolean().default(true)
		}),
		equipped: z.object({
			avatarFrames: z.number().default(0.4),
			usernameEffects: z.number().default(0.2),
			signatures: z.number().default(0.3)
		}),
		combinations: z.object({
			matchingSets: z.number().default(0.3),
			chaosMode: z.number().default(0.1)
		})
	}),

	// Abuse simulation
	abuse: z.object({
		enabled: z.boolean().default(true),
		patterns: z.object({
			spamming: z.object({ users: z.number().default(2), intensity: z.enum(['low', 'medium', 'high']).default('medium') }),
			xpFarming: z.object({ users: z.number().default(1), strategy: z.enum(['loop', 'burst', 'distributed']).default('loop') }),
			toxicity: z.object({ users: z.number().default(1), severity: z.enum(['mild', 'moderate', 'severe']).default('moderate') }),
			botNetwork: z.object({ size: z.number().default(0), coordinated: z.boolean().default(false) })
		})
	}),

	// Temporal simulation
	temporal: z.object({
		simulationDays: z.number().default(30),
		activityPattern: z.enum(['realistic', 'uniform', 'burst']).default('realistic'),
		peakHours: z.array(z.number()).default([9, 14, 20]),
		weekendMultiplier: z.number().default(1.5),
		decayRates: z.object({
			threadHeat: z.number().default(0.95),
			userActivity: z.number().default(0.9)
		})
	})
});

// Export the typed config
export type SeedConfig = z.infer<typeof SeedConfigSchema>;

// Default configuration
export const defaultSeedConfig: SeedConfig = {
	environment: {
		mode: 'dev',
		safeMode: false,
		forceReseed: false,
		verboseLogging: true
	},
	users: {
		total: 50,
		distribution: {
			admins: 1,
			mods: 2,
			whales: 2,
			veterans: 10,
			active: 25,
			newbies: 8,
			banned: 1,
			shadowBanned: 1
		},
		behaviors: {
			postFrequency: { low: 0.3, medium: 0.5, high: 0.2 },
			tipGenerosity: { stingy: 0.4, normal: 0.4, generous: 0.2 }
		}
	},
	content: {
		threads: {
			total: 250,
			perForum: { min: 10, max: 50 },
			types: {
				normal: 0.7,
				jackpot: 0.1,
				surge: 0.1,
				announcement: 0.05,
				guide: 0.05
			},
			specialStates: {
				locked: 0.05,
				pinned: 0.06,
				solved: 0.1
			}
		},
		posts: {
			total: 2500,
			perThread: { min: 5, max: 50 },
			features: {
				hasImages: 0.2,
				hasReactions: 0.6,
				hasTips: 0.05,
				hasMentions: 0.15,
				isEdited: 0.1
			},
			edgeCases: {
				unicodeChaos: 0.01,
				maxLength: 0.001,
				deepNesting: 0.02
			}
		}
	},
	economy: {
		transactions: {
			dgtTransfers: 500,
			tips: 250,
			rainEvents: 25,
			shopPurchases: 100
		},
		patterns: {
			tipAmounts: {
				small: { range: [1, 10], chance: 0.7 },
				medium: { range: [10, 100], chance: 0.25 },
				whale: { range: [100, 1000], chance: 0.05 }
			},
			rainSettings: {
				amounts: [100, 500, 1000, 5000],
				participants: [10, 25, 50, 100]
			}
		}
	},
	gamification: {
		xpActions: {
			simulateAll: true,
			dailyCaps: true,
			cooldowns: true,
			multipliers: true
		},
		achievements: {
			progressSimulation: true,
			unlockPercentage: 0.3,
			chainedAchievements: true
		},
		missions: {
			activePerUser: 3,
			completionRate: 0.6,
			streakSimulation: true
		}
	},
	cosmetics: {
		ownership: {
			whaleOwnsAll: true,
			veteranRareItems: 0.7,
			newbieStarterPack: true
		},
		equipped: {
			avatarFrames: 0.4,
			usernameEffects: 0.2,
			signatures: 0.3
		},
		combinations: {
			matchingSets: 0.3,
			chaosMode: 0.1
		}
	},
	abuse: {
		enabled: true,
		patterns: {
			spamming: { users: 2, intensity: 'medium' },
			xpFarming: { users: 1, strategy: 'loop' },
			toxicity: { users: 1, severity: 'moderate' },
			botNetwork: { size: 0, coordinated: false }
		}
	},
	temporal: {
		simulationDays: 30,
		activityPattern: 'realistic',
		peakHours: [9, 14, 20],
		weekendMultiplier: 1.5,
		decayRates: {
			threadHeat: 0.95,
			userActivity: 0.9
		}
	}
};

// Environment-specific overrides
export const environmentConfigs: Record<string, Partial<SeedConfig>> = {
	dev: {
		// Full chaos mode for dev
		abuse: {
			enabled: true,
			patterns: {
				spamming: { users: 2, intensity: 'high' },
				xpFarming: { users: 2, strategy: 'burst' },
				toxicity: { users: 2, severity: 'severe' },
				botNetwork: { size: 10, coordinated: true }
			}
		}
	},
	staging: {
		// Realistic testing for staging
		abuse: {
			enabled: true,
			patterns: {
				spamming: { users: 1, intensity: 'low' },
				xpFarming: { users: 1, strategy: 'distributed' },
				toxicity: { users: 1, severity: 'mild' },
				botNetwork: { size: 0, coordinated: false }
			}
		}
	},
	prod: {
		// No fake data in prod!
		users: { total: 0, distribution: { admins: 0, mods: 0, whales: 0, veterans: 0, active: 0, newbies: 0, banned: 0, shadowBanned: 0 } },
		content: { threads: { total: 0 }, posts: { total: 0 } },
		abuse: { enabled: false }
	}
};

// Helper to get config for current environment
export function getSeedConfig(mode: 'dev' | 'staging' | 'prod' = 'dev'): SeedConfig {
	const envOverrides = environmentConfigs[mode] || {};
	const config = { ...defaultSeedConfig, ...envOverrides };
	
	// Validate the final config
	return SeedConfigSchema.parse(config);
}