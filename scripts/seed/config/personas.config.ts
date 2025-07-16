import type { UserId } from '../../../shared/types/ids';

export interface PersonaBehavior {
	postFrequency: 'low' | 'medium' | 'high' | 'burst';
	postStyle: 'helpful' | 'provocative' | 'technical' | 'casual' | 'memetic';
	tipGenerosity: 'stingy' | 'normal' | 'generous' | 'whale';
	rainFrequency?: 'never' | 'rare' | 'occasional' | 'daily';
	helpfulness: number; // 0-1
	toxicity: number; // 0-1
	reportMagnet: boolean;
	exploitsXPLoops?: boolean;
	completionist?: boolean;
}

export interface PersonaCosmetics {
	equipped: string[];
	owned: string[] | 'all';
	preferredTheme?: string;
	signatureStyle?: string;
}

export interface Persona {
	username: string;
	email: string;
	role: 'admin' | 'mod' | 'user';
	personality: string;
	bio: string;
	stats: {
		xp: number;
		level: number;
		dgt: number;
		clout?: number;
		warnings?: number;
		bans?: number;
		reputation?: number;
	};
	cosmetics: PersonaCosmetics;
	behavior: PersonaBehavior;
	socialGraph?: {
		friends?: string[];
		enemies?: string[];
		follows?: string[];
		blockedBy?: string[];
	};
	specialTraits?: string[];
}

/**
 * Enhanced personas with deep personalities and behaviors
 */
export const personas: Record<string, Persona> = {
	// === ADMIN/MOD PERSONAS ===
	degen_overlord: {
		username: 'degen_overlord',
		email: 'admin@degentalk.com',
		role: 'admin',
		personality: 'benevolent_dictator',
		bio: '👑 Founder & Chief Degen | Building the future of degenerate discourse | DMs open for bribes',
		stats: {
			xp: 999999,
			level: 99,
			dgt: 50000,
			clout: 10000,
			reputation: 10000
		},
		cosmetics: {
			equipped: ['admin_crown', 'rainbow_gradient_name', 'matrix_signature', 'golden_frame'],
			owned: 'all'
		},
		behavior: {
			postFrequency: 'medium',
			postStyle: 'technical',
			tipGenerosity: 'generous',
			rainFrequency: 'occasional',
			helpfulness: 0.9,
			toxicity: 0.1,
			reportMagnet: false
		},
		specialTraits: ['creates_announcements', 'pins_threads', 'gives_badges']
	},

	mod_karen: {
		username: 'ModKaren',
		email: 'karen@degentalk.com',
		role: 'mod',
		personality: 'strict_enforcer',
		bio: '🚨 Head of Fun Police | Zero tolerance for rule breakers | "I\'d like to speak to your manager"',
		stats: {
			xp: 75000,
			level: 45,
			dgt: 15000,
			warnings: 0,
			reputation: 7500
		},
		cosmetics: {
			equipped: ['mod_badge', 'red_alert_frame', 'flashing_text_name'],
			owned: ['mod_badge', 'red_alert_frame', 'flashing_text_name', 'ban_hammer_cursor']
		},
		behavior: {
			postFrequency: 'high',
			postStyle: 'helpful',
			tipGenerosity: 'normal',
			helpfulness: 0.7,
			toxicity: 0,
			reportMagnet: false
		},
		specialTraits: ['locks_threads', 'issues_warnings', 'removes_spam']
	},

	// === WHALE PERSONAS ===
	moby_degen: {
		username: 'MobyDegen',
		email: 'whale@degentalk.com',
		role: 'user',
		personality: 'chaotic_rich',
		bio: '🐋 Professional bag holder | Rain every day at 4:20 | "Money can\'t buy happiness but it can buy DGT"',
		stats: {
			xp: 85000,
			level: 50,
			dgt: 500000,
			clout: 8000,
			warnings: 2
		},
		cosmetics: {
			equipped: ['whale_frame', 'money_rain_effect', 'golden_signature', 'diamond_cursor'],
			owned: 'all'
		},
		behavior: {
			postFrequency: 'medium',
			postStyle: 'provocative',
			tipGenerosity: 'whale',
			rainFrequency: 'daily',
			helpfulness: 0.5,
			toxicity: 0.3,
			reportMagnet: true
		},
		socialGraph: {
			friends: ['grind_lord', 'alpha_hunter'],
			enemies: ['paper_hands'],
			follows: ['degen_overlord']
		},
		specialTraits: ['creates_drama', 'funds_events', 'market_manipulator']
	},

	// === VETERAN PERSONAS ===
	grind_lord: {
		username: 'GrindLord420',
		email: 'grinder@degentalk.com',
		role: 'user',
		personality: 'optimization_obsessed',
		bio: '📊 XP maximalist | 365 day streak | Spreadsheet enthusiast | "Sleep is for the weak"',
		stats: {
			xp: 65000,
			level: 40,
			dgt: 1000, // Spends it all on cosmetics
			clout: 6000,
			reputation: 8000
		},
		cosmetics: {
			equipped: ['streak_fire_frame', 'xp_counter_badge', 'efficiency_aura'],
			owned: ['streak_fire_frame', 'xp_counter_badge', 'efficiency_aura', 'calculator_cursor', 'spreadsheet_bg']
		},
		behavior: {
			postFrequency: 'high',
			postStyle: 'technical',
			tipGenerosity: 'stingy',
			helpfulness: 0.9,
			toxicity: 0,
			reportMagnet: false,
			exploitsXPLoops: true,
			completionist: true
		},
		specialTraits: ['finds_exploits', 'writes_guides', 'helps_newbies', 'never_sleeps']
	},

	alpha_hunter: {
		username: 'AlphaHunter',
		email: 'alpha@degentalk.com',
		role: 'user',
		personality: 'information_broker',
		bio: '🎯 Early to everything, late to nothing | Leaked alpha in DMs | NFA DYOR',
		stats: {
			xp: 45000,
			level: 30,
			dgt: 25000,
			clout: 5000
		},
		cosmetics: {
			equipped: ['insider_frame', 'encrypted_name', 'classified_signature'],
			owned: ['insider_frame', 'encrypted_name', 'classified_signature', 'magnifying_glass']
		},
		behavior: {
			postFrequency: 'burst',
			postStyle: 'technical',
			tipGenerosity: 'normal',
			helpfulness: 0.4,
			toxicity: 0.1,
			reportMagnet: false
		},
		specialTraits: ['creates_fomo', 'shares_leaks', 'dm_trader']
	},

	// === ACTIVE USER PERSONAS ===
	shitpost_samurai: {
		username: 'ShitpostSamurai',
		email: 'memes@degentalk.com',
		role: 'user',
		personality: 'meme_lord',
		bio: '🗡️ Memes are my katana | Irony level: ∞ | "Touch grass? Never heard of her"',
		stats: {
			xp: 25000,
			level: 20,
			dgt: 5000,
			clout: 3000
		},
		cosmetics: {
			equipped: ['pepe_frame', 'comic_sans_name', 'meme_collage_sig'],
			owned: ['pepe_frame', 'comic_sans_name', 'meme_collage_sig', 'wojak_cursor', 'doge_bg']
		},
		behavior: {
			postFrequency: 'high',
			postStyle: 'memetic',
			tipGenerosity: 'normal',
			helpfulness: 0.3,
			toxicity: 0.2,
			reportMagnet: true
		},
		specialTraits: ['creates_memes', 'derails_threads', 'ratio_master']
	},

	helpful_helen: {
		username: 'HelpfulHelen',
		email: 'helen@degentalk.com',
		role: 'user',
		personality: 'community_pillar',
		bio: '💝 Here to help! | Tutorial queen | "No question is too small" | Recovering forum mom',
		stats: {
			xp: 30000,
			level: 25,
			dgt: 8000,
			reputation: 9000
		},
		cosmetics: {
			equipped: ['heart_frame', 'pastel_gradient_name', 'helpful_badge'],
			owned: ['heart_frame', 'pastel_gradient_name', 'helpful_badge', 'angel_wings']
		},
		behavior: {
			postFrequency: 'medium',
			postStyle: 'helpful',
			tipGenerosity: 'generous',
			helpfulness: 1.0,
			toxicity: 0,
			reportMagnet: false
		},
		specialTraits: ['writes_tutorials', 'welcomes_newbies', 'defuses_drama']
	},

	// === NEWBIE PERSONAS ===
	paper_hands: {
		username: 'PaperHands2024',
		email: 'newbie@degentalk.com',
		role: 'user',
		personality: 'anxious_newbie',
		bio: 'New here... | Still learning | "Is this the right place to ask about...?"',
		stats: {
			xp: 100,
			level: 1,
			dgt: 10,
			reputation: 100
		},
		cosmetics: {
			equipped: [],
			owned: ['starter_frame']
		},
		behavior: {
			postFrequency: 'low',
			postStyle: 'casual',
			tipGenerosity: 'stingy',
			helpfulness: 0.1,
			toxicity: 0,
			reportMagnet: false
		},
		specialTraits: ['asks_basic_questions', 'makes_mistakes', 'gets_rekt']
	},

	lurker_larry: {
		username: 'LurkerLarry',
		email: 'lurker@degentalk.com',
		role: 'user',
		personality: 'silent_observer',
		bio: '👀',
		stats: {
			xp: 500,
			level: 3,
			dgt: 100
		},
		cosmetics: {
			equipped: ['invisible_frame'],
			owned: ['invisible_frame', 'ghost_cursor']
		},
		behavior: {
			postFrequency: 'low',
			postStyle: 'casual',
			tipGenerosity: 'normal',
			helpfulness: 0,
			toxicity: 0,
			reportMagnet: false
		},
		specialTraits: ['never_posts', 'always_online', 'knows_everything']
	},

	// === PROBLEMATIC PERSONAS ===
	toxic_tyler: {
		username: 'ToxicTyler666',
		email: 'toxic@degentalk.com',
		role: 'user',
		personality: 'edge_lord',
		bio: '🔥 Professional thread derailer | Banned from 47 forums | "Cope harder"',
		stats: {
			xp: 15000,
			level: 15,
			dgt: 666,
			warnings: 5,
			bans: 2
		},
		cosmetics: {
			equipped: ['skull_frame', 'blood_drip_name', 'edgy_signature'],
			owned: ['skull_frame', 'blood_drip_name', 'edgy_signature', 'middle_finger_cursor']
		},
		behavior: {
			postFrequency: 'burst',
			postStyle: 'provocative',
			tipGenerosity: 'stingy',
			helpfulness: 0,
			toxicity: 0.9,
			reportMagnet: true
		},
		socialGraph: {
			enemies: ['ModKaren', 'HelpfulHelen'],
			blockedBy: ['HelpfulHelen', 'PaperHands2024']
		},
		specialTraits: ['starts_flamewars', 'ban_evader', 'report_target']
	},

	spam_bot_9000: {
		username: 'TotallyNotABot',
		email: 'bot@degentalk.com',
		role: 'user',
		personality: 'obvious_bot',
		bio: 'CLICK HERE FOR FREE DGT!!! | bit.ly/definitelynotascam | 100% LEGIT NO SCAM',
		stats: {
			xp: 0,
			level: 1,
			dgt: 0,
			warnings: 10,
			bans: 5
		},
		cosmetics: {
			equipped: [],
			owned: []
		},
		behavior: {
			postFrequency: 'burst',
			postStyle: 'casual',
			tipGenerosity: 'stingy',
			helpfulness: 0,
			toxicity: 0.5,
			reportMagnet: true,
			exploitsXPLoops: true
		},
		specialTraits: ['posts_links', 'duplicate_content', 'instant_ban']
	},

	shadow_banned_sam: {
		username: 'WhyNobodyReplies',
		email: 'shadow@degentalk.com',
		role: 'user',
		personality: 'unaware_shadow_banned',
		bio: 'Hello? Is anyone there? | Why does nobody ever respond to me? | Testing 123...',
		stats: {
			xp: 5000,
			level: 10,
			dgt: 1000,
			warnings: 20
		},
		cosmetics: {
			equipped: ['default_frame'],
			owned: ['default_frame', 'echo_effect']
		},
		behavior: {
			postFrequency: 'high',
			postStyle: 'casual',
			tipGenerosity: 'normal',
			helpfulness: 0.5,
			toxicity: 0.3,
			reportMagnet: false
		},
		specialTraits: ['shadow_banned', 'confused', 'persistent']
	}
};

/**
 * Helper to get personas by category
 */
export function getPersonasByRole(role: 'admin' | 'mod' | 'user'): Persona[] {
	return Object.values(personas).filter(p => p.role === role);
}

export function getPersonasByBehavior(trait: keyof PersonaBehavior, value: any): Persona[] {
	return Object.values(personas).filter(p => p.behavior[trait] === value);
}

export function getWhalePersonas(): Persona[] {
	return Object.values(personas).filter(p => p.stats.dgt > 100000);
}

export function getToxicPersonas(): Persona[] {
	return Object.values(personas).filter(p => p.behavior.toxicity > 0.5);
}