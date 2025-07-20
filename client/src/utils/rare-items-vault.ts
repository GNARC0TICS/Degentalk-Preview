// Rare Items Vault - A comprehensive collection of items that can be managed by admins
// This serves as a central repository for all items available in the shop

// Rarity enumeration
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'seasonal';

// Item acquisition methods
export type UnlockMethod =
	| 'shop'
	| 'lootbox'
	| 'event'
	| 'achievement'
	| 'rain'
	| 'secret'
	| 'admin';

// Item category
export type ItemCategory =
	| 'frames'
	| 'titles'
	| 'colors'
	| 'boosts'
	| 'effects'
	| 'badges'
	| 'seasonal'
	| 'exclusive';

// Season type for seasonal items
export type SeasonType =
	| 'halloween'
	| 'christmas'
	| 'summer'
	| 'anniversary'
	| 'spring'
	| 'default';

// Base interface for all items
export interface BaseVaultItem {
	id: string;
	name: string;
	description: string;
	imageUrl?: string;
	category: ItemCategory;
	rarity: ItemRarity;
	unlockMethods: UnlockMethod[];
	xpRequirement?: number;
	isEnabled: boolean;
	season?: SeasonType;
	releaseDateUtc?: string;
	expiryDateUtc?: string;
	dropChance?: number; // For lootboxes (percentage)
	dgtPrice: number;
	usdtPrice: number;
	tags?: string[];
	createdBy?: string; // Admin ID/username
	metadata?: Record<string, any>; // Extensible field for future properties
}

// Specific frame interface
export interface VaultFrame extends BaseVaultItem {
	category: 'frames';
	frameAnimation?: 'static' | 'pulse' | 'glow' | 'shimmer' | 'particle';
	frameColor?: string; // HEX color
	frameBorderWidth?: number;
}

// Specific title interface
export interface VaultTitle extends BaseVaultItem {
	category: 'titles';
	titleColor?: string; // HEX color
	titleAnimation?: 'static' | 'glow' | 'rainbow' | 'pulse';
	titleFontStyle?: 'normal' | 'italic' | 'bold';
}

// Specific color interface for username colors
export interface VaultColor extends BaseVaultItem {
	category: 'colors';
	colorValue: string; // HEX color
	colorAnimation?: 'static' | 'pulse' | 'gradient' | 'rainbow';
	gradientColors?: string[]; // Array of HEX colors if gradient
}

// Specific boost interface
export interface VaultBoost extends BaseVaultItem {
	category: 'boosts';
	boostDuration: number; // In hours
	boostMultiplier: number; // e.g., 1.5x, 2x
	boostType: 'xp' | 'rain' | 'referral' | 'post_score';
	stackable: boolean;
	maxStack?: number;
}

// The frames from the vault based on provided data
export const vaultFrames: VaultFrame[] = [
	{
		id: 'ice-caster-frame',
		name: 'Ice Caster Frame',
		description: 'Frozen shimmer with crackling cold',
		category: 'frames',
		rarity: 'rare',
		unlockMethods: ['shop', 'lootbox'],
		isEnabled: true,
		dgtPrice: 300,
		usdtPrice: 3.0,
		frameAnimation: 'shimmer',
		frameColor: '#a0e4fe',
		tags: ['winter', 'animation']
	},
	{
		id: 'solar-flare-frame',
		name: 'Solar Flare Frame',
		description: 'Fiery animated frame',
		category: 'frames',
		rarity: 'epic',
		unlockMethods: ['shop', 'lootbox'],
		isEnabled: true,
		dgtPrice: 800,
		usdtPrice: 8.0,
		frameAnimation: 'pulse',
		frameColor: '#ff9d40',
		tags: ['fire', 'animation']
	},
	{
		id: 'neon-degen-frame',
		name: 'Neon Degen Frame',
		description: 'Electric animated streaks',
		category: 'frames',
		rarity: 'legendary',
		unlockMethods: ['shop', 'lootbox'],
		isEnabled: true,
		dgtPrice: 1800,
		usdtPrice: 18.0,
		frameAnimation: 'glow',
		frameColor: '#40ff9d',
		tags: ['neon', 'animation', 'premium']
	},
	{
		id: 'og-whale-frame',
		name: 'OG Whale Frame',
		description: 'Launch event or whale bonus',
		category: 'frames',
		rarity: 'legendary',
		unlockMethods: ['event', 'achievement'],
		isEnabled: true,
		dgtPrice: 2000,
		usdtPrice: 20.0,
		frameAnimation: 'pulse',
		frameColor: '#40b0ff',
		tags: ['whale', 'exclusive', 'premium'],
		xpRequirement: 15000
	},
	{
		id: 'gold-standard-frame',
		name: 'Gold Standard Frame',
		description: 'Classic gold-themed',
		category: 'frames',
		rarity: 'rare',
		unlockMethods: ['shop'],
		isEnabled: true,
		dgtPrice: 500,
		usdtPrice: 5.0,
		frameAnimation: 'static',
		frameColor: '#ffd700',
		tags: ['gold', 'classic']
	},
	{
		id: 'vaporwave-dream-frame',
		name: 'Vaporwave Dream Frame',
		description: 'Pastel animated glow',
		category: 'frames',
		rarity: 'epic',
		unlockMethods: ['shop', 'lootbox'],
		isEnabled: true,
		dgtPrice: 1200,
		usdtPrice: 12.0,
		frameAnimation: 'glow',
		frameColor: '#ff71ce',
		tags: ['vaporwave', 'animation', 'retro']
	},
	{
		id: 'quantum-drip-frame',
		name: 'Quantum Drip Frame',
		description: 'Animated particle aura',
		category: 'frames',
		rarity: 'mythic',
		unlockMethods: ['event', 'achievement'],
		isEnabled: true,
		dgtPrice: 3000,
		usdtPrice: 30.0,
		frameAnimation: 'particle',
		frameColor: '#b967ff',
		tags: ['premium', 'animation', 'exclusive'],
		xpRequirement: 20000
	},
	{
		id: 'ace-gambler-frame',
		name: 'Ace Gambler Frame',
		description: 'Floating ace cards',
		category: 'frames',
		rarity: 'epic',
		unlockMethods: ['shop', 'lootbox'],
		isEnabled: true,
		dgtPrice: 900,
		usdtPrice: 9.0,
		frameAnimation: 'particle',
		frameColor: '#e74c3c',
		tags: ['gambling', 'cards', 'animation']
	},
	{
		id: 'haunted-revenant-frame',
		name: 'Haunted Revenant Frame',
		description: 'Ghostly mist animation',
		category: 'frames',
		rarity: 'seasonal',
		unlockMethods: ['event', 'shop'],
		isEnabled: true,
		dgtPrice: 1000,
		usdtPrice: 10.0,
		frameAnimation: 'shimmer',
		frameColor: '#7b68ee',
		tags: ['halloween', 'animation', 'seasonal'],
		season: 'halloween',
		releaseDateUtc: '2023-10-01T00:00:00Z',
		expiryDateUtc: '2023-11-07T00:00:00Z'
	},
	{
		id: 'frostbite-frame',
		name: 'Frostbite Frame',
		description: 'Crystalline frost',
		category: 'frames',
		rarity: 'seasonal',
		unlockMethods: ['event', 'shop'],
		isEnabled: true,
		dgtPrice: 1000,
		usdtPrice: 10.0,
		frameAnimation: 'pulse',
		frameColor: '#a0e4fe',
		tags: ['winter', 'christmas', 'animation', 'seasonal'],
		season: 'christmas',
		releaseDateUtc: '2023-12-01T00:00:00Z',
		expiryDateUtc: '2024-01-07T00:00:00Z'
	}
];

// Titles from the vault based on provided data
export const vaultTitles: VaultTitle[] = [
	{
		id: 'whale-slayer',
		name: 'Whale Slayer',
		description: 'XP contest winner',
		category: 'titles',
		rarity: 'epic',
		unlockMethods: ['achievement'],
		isEnabled: true,
		dgtPrice: 1200,
		usdtPrice: 12.0,
		titleColor: '#4a90e2',
		titleAnimation: 'glow',
		tags: ['achievement', 'contest']
	},
	{
		id: 'certified-degen',
		name: 'Certified Degen',
		description: 'General XP or tips',
		category: 'titles',
		rarity: 'rare',
		unlockMethods: ['shop', 'achievement'],
		isEnabled: true,
		dgtPrice: 500,
		usdtPrice: 5.0,
		titleColor: '#7ed321',
		titleAnimation: 'static',
		tags: ['general', 'activity']
	},
	{
		id: 'rainmaker',
		name: 'Rainmaker',
		description: 'Rained 10+ times',
		category: 'titles',
		rarity: 'rare',
		unlockMethods: ['achievement'],
		isEnabled: true,
		dgtPrice: 600,
		usdtPrice: 6.0,
		titleColor: '#d0021b',
		titleAnimation: 'pulse',
		tags: ['rain', 'activity']
	},
	{
		id: 'moonshot-caller',
		name: 'Moonshot Caller',
		description: 'Predicts major event',
		category: 'titles',
		rarity: 'legendary',
		unlockMethods: ['admin'],
		isEnabled: true,
		dgtPrice: 2000,
		usdtPrice: 20.0,
		titleColor: '#9013fe',
		titleAnimation: 'glow',
		tags: ['prediction', 'admin-awarded']
	},
	{
		id: 'forum-og',
		name: 'Forum OG',
		description: 'Early users only',
		category: 'titles',
		rarity: 'mythic',
		unlockMethods: ['admin'],
		isEnabled: true,
		dgtPrice: 0,
		usdtPrice: 0.0,
		titleColor: '#f8e71c',
		titleAnimation: 'rainbow',
		tags: ['early-adopter', 'exclusive']
	},
	{
		id: 'liquidity-provider',
		name: 'Liquidity Provider',
		description: 'Big purchase achiever',
		category: 'titles',
		rarity: 'rare',
		unlockMethods: ['shop', 'achievement'],
		isEnabled: true,
		dgtPrice: 700,
		usdtPrice: 7.0,
		titleColor: '#50e3c2',
		titleAnimation: 'static',
		tags: ['purchase', 'activity']
	},
	{
		id: 'lootbox-legend',
		name: 'Lootbox Legend',
		description: 'Lootbox reward winner',
		category: 'titles',
		rarity: 'epic',
		unlockMethods: ['lootbox'],
		isEnabled: true,
		dgtPrice: 0,
		usdtPrice: 0.0,
		titleColor: '#f5a623',
		titleAnimation: 'pulse',
		tags: ['lootbox', 'exclusive']
	},
	{
		id: 'shillmaster-supreme',
		name: 'Shillmaster Supreme',
		description: 'Top referrer',
		category: 'titles',
		rarity: 'rare',
		unlockMethods: ['achievement'],
		isEnabled: true,
		dgtPrice: 500,
		usdtPrice: 5.0,
		titleColor: '#ff6a6a',
		titleAnimation: 'static',
		tags: ['referral', 'activity']
	},
	{
		id: 'flame-farmer',
		name: 'Flame Farmer',
		description: 'Hottest threads',
		category: 'titles',
		rarity: 'epic',
		unlockMethods: ['achievement'],
		isEnabled: true,
		dgtPrice: 800,
		usdtPrice: 8.0,
		titleColor: '#ff6b00',
		titleAnimation: 'glow',
		tags: ['content', 'activity']
	},
	{
		id: 'rainstorm-champion',
		name: 'Rainstorm Champion',
		description: 'Top rainer in event',
		category: 'titles',
		rarity: 'seasonal',
		unlockMethods: ['event'],
		isEnabled: true,
		dgtPrice: 1000,
		usdtPrice: 10.0,
		titleColor: '#4a90e2',
		titleAnimation: 'pulse',
		tags: ['event', 'rain', 'seasonal']
	}
];

// Colors from the vault based on provided data
export const vaultColors: VaultColor[] = [
	{
		id: 'electric-cyan',
		name: 'Electric Cyan',
		description: 'Shimmering animated',
		category: 'colors',
		rarity: 'rare',
		unlockMethods: ['shop', 'lootbox'],
		isEnabled: true,
		dgtPrice: 400,
		usdtPrice: 4.0,
		colorValue: '#00ffff',
		colorAnimation: 'pulse',
		tags: ['animation', 'bright']
	},
	{
		id: 'inferno-red',
		name: 'Inferno Red',
		description: 'Flicker glow',
		category: 'colors',
		rarity: 'rare',
		unlockMethods: ['shop', 'lootbox'],
		isEnabled: true,
		dgtPrice: 400,
		usdtPrice: 4.0,
		colorValue: '#ff3d00',
		colorAnimation: 'pulse',
		tags: ['animation', 'bright']
	},
	{
		id: 'royal-purple',
		name: 'Royal Purple',
		description: 'Static deep glow',
		category: 'colors',
		rarity: 'epic',
		unlockMethods: ['shop', 'lootbox'],
		isEnabled: true,
		dgtPrice: 700,
		usdtPrice: 7.0,
		colorValue: '#9c27b0',
		colorAnimation: 'pulse' as const,
		tags: ['premium', 'royal']
	},
	{
		id: 'cosmic-pink',
		name: 'Cosmic Pink',
		description: 'Animated pulse',
		category: 'colors',
		rarity: 'legendary',
		unlockMethods: ['shop', 'lootbox', 'event'],
		isEnabled: true,
		dgtPrice: 1500,
		usdtPrice: 15.0,
		colorValue: '#ff4081',
		colorAnimation: 'pulse',
		tags: ['animation', 'premium']
	},
	{
		id: 'degen-black-inverted',
		name: 'Degen Black (Inverted)',
		description: 'Rare prestige',
		category: 'colors',
		rarity: 'mythic',
		unlockMethods: ['admin', 'achievement'],
		isEnabled: true,
		dgtPrice: 3000,
		usdtPrice: 30.0,
		colorValue: '#000000',
		colorAnimation: 'rainbow',
		tags: ['prestige', 'exclusive', 'premium'],
		xpRequirement: 25000
	},
	{
		id: 'starlight-silver',
		name: 'Starlight Silver',
		description: 'Lootbox exclusive',
		category: 'colors',
		rarity: 'legendary',
		unlockMethods: ['lootbox'],
		isEnabled: true,
		dgtPrice: 0,
		usdtPrice: 0.0,
		colorValue: '#e0e0e0',
		colorAnimation: 'gradient',
		gradientColors: ['#e0e0e0', '#b0b0b0', '#e0e0e0'],
		tags: ['lootbox', 'exclusive']
	}
];

// Boosts from the vault based on provided data
export const vaultBoosts: VaultBoost[] = [
	{
		id: 'xp-doubler-24h',
		name: 'XP Doubler (24h)',
		description: '2x XP gain',
		category: 'boosts',
		rarity: 'rare',
		unlockMethods: ['shop', 'lootbox'],
		isEnabled: true,
		dgtPrice: 300,
		usdtPrice: 3.0,
		boostDuration: 24,
		boostMultiplier: 2,
		boostType: 'xp',
		stackable: false,
		tags: ['xp', 'temporary']
	},
	{
		id: 'rain-booster-48h',
		name: 'Rain Booster (48h)',
		description: '2x rain yield',
		category: 'boosts',
		rarity: 'epic',
		unlockMethods: ['shop', 'lootbox'],
		isEnabled: true,
		dgtPrice: 600,
		usdtPrice: 6.0,
		boostDuration: 48,
		boostMultiplier: 2,
		boostType: 'rain',
		stackable: false,
		tags: ['rain', 'temporary']
	},
	{
		id: 'hot-post-amplifier',
		name: 'Hot Post Amplifier',
		description: '2x hot post score',
		category: 'boosts',
		rarity: 'epic',
		unlockMethods: ['shop', 'lootbox'],
		isEnabled: true,
		dgtPrice: 500,
		usdtPrice: 5.0,
		boostDuration: 72,
		boostMultiplier: 2,
		boostType: 'post_score',
		stackable: false,
		tags: ['content', 'temporary']
	},
	{
		id: 'referral-frenzy-booster',
		name: 'Referral Frenzy Booster',
		description: '1.5x referral bonus',
		category: 'boosts',
		rarity: 'rare',
		unlockMethods: ['shop', 'lootbox'],
		isEnabled: true,
		dgtPrice: 400,
		usdtPrice: 4.0,
		boostDuration: 168, // 7 days in hours
		boostMultiplier: 1.5,
		boostType: 'referral',
		stackable: false,
		tags: ['referral', 'temporary']
	},
	{
		id: 'vault-unlock-key',
		name: 'Vault Unlock Key',
		description: 'Unlocks secret shop or item',
		category: 'boosts',
		rarity: 'mythic',
		unlockMethods: ['admin', 'event'],
		isEnabled: true,
		dgtPrice: 2000,
		usdtPrice: 20.0,
		boostDuration: 0, // Permanent
		boostMultiplier: 1,
		boostType: 'xp',
		stackable: false,
		tags: ['special', 'unlock', 'permanent']
	},
	{
		id: 'lifetime-xp-boost',
		name: 'Lifetime XP Boost',
		description: 'Permanent small XP boost',
		category: 'boosts',
		rarity: 'legendary',
		unlockMethods: ['event'],
		isEnabled: true,
		dgtPrice: 0,
		usdtPrice: 0.0,
		boostDuration: 0, // Permanent
		boostMultiplier: 1.1, // 10% boost
		boostType: 'xp',
		stackable: true,
		maxStack: 5, // Up to 50% boost total
		tags: ['special', 'permanent', 'anniversary']
	}
];

// Mystery box exclusives
export const vaultMysteryExclusives = [
	{
		id: 'degen-supreme-frame',
		name: 'Degen Supreme Frame',
		description: 'Lootbox exclusive frame with supreme animation',
		category: 'frames' as ItemCategory,
		rarity: 'legendary' as ItemRarity,
		unlockMethods: ['lootbox'] as UnlockMethod[],
		isEnabled: true,
		dgtPrice: 0,
		usdtPrice: 0.0,
		frameAnimation: 'particle',
		frameColor: '#ff0080',
		tags: ['lootbox', 'exclusive', 'animation'],
		dropChance: 3 // 3% chance
	},
	{
		id: 'flex-god-title',
		name: 'Flex God Title',
		description: 'Lootbox exclusive title that sparkles',
		category: 'titles' as ItemCategory,
		rarity: 'legendary' as ItemRarity,
		unlockMethods: ['lootbox'] as UnlockMethod[],
		isEnabled: true,
		dgtPrice: 0,
		usdtPrice: 0.0,
		titleColor: '#ffcc00',
		titleAnimation: 'rainbow',
		tags: ['lootbox', 'exclusive'],
		dropChance: 2 // 2% chance
	}
];

// Combined items data for easy access
export const vaultItems = {
	frames: vaultFrames,
	titles: vaultTitles,
	colors: vaultColors,
	boosts: vaultBoosts,
	exclusives: vaultMysteryExclusives
};

// Helper functions for the admin panel and item management

// Get items by category
export function getItemsByCategory(category: ItemCategory) {
	switch (category) {
		case 'frames':
			return vaultFrames;
		case 'titles':
			return vaultTitles;
		case 'colors':
			return vaultColors;
		case 'boosts':
			return vaultBoosts;
		case 'seasonal':
			return [...vaultFrames, ...vaultTitles].filter((item) => item.rarity === 'seasonal');
		case 'exclusive':
			return vaultMysteryExclusives;
		default:
			return [];
	}
}

// Get items by rarity
export function getItemsByRarity(rarity: ItemRarity) {
	const allItems = [
		...vaultFrames,
		...vaultTitles,
		...vaultColors,
		...vaultBoosts,
		...vaultMysteryExclusives
	];

	return allItems.filter((item) => item.rarity === rarity);
}

// Get lootbox items with drop chances
export function getLootboxItems() {
	const allItems = [
		...vaultFrames,
		...vaultTitles,
		...vaultColors,
		...vaultBoosts,
		...vaultMysteryExclusives
	];

	return allItems.filter(
		(item) => item.unlockMethods.includes('lootbox') && item.dropChance !== undefined
	);
}

// Get seasonal items
export function getSeasonalItems(season: SeasonType) {
	const allItems = [...vaultFrames, ...vaultTitles, ...vaultColors, ...vaultBoosts];

	return allItems.filter(
		(item) => 'season' in item && item.season === season && item.rarity === 'seasonal'
	);
}

// Get items by XP requirement
export function getItemsByXpRequirement(minXp: number, maxXp: number) {
	const allItems = [
		...vaultFrames,
		...vaultTitles,
		...vaultColors,
		...vaultBoosts,
		...vaultMysteryExclusives
	];

	return allItems.filter(
		(item) =>
			(item as any).xpRequirement !== undefined && (item as any).xpRequirement >= minXp && (item as any).xpRequirement <= maxXp
	);
}

// Get currently available seasonal items
export function getCurrentSeasonalItems() {
	const now = new Date();
	const allItems = [...vaultFrames, ...vaultTitles, ...vaultColors, ...vaultBoosts];

	return allItems.filter((item) => {
		if (item.rarity !== 'seasonal') return false;
		if (!item.releaseDateUtc || !item.expiryDateUtc) return true;

		const releaseDate = new Date(item.releaseDateUtc);
		const expiryDate = new Date(item.expiryDateUtc);

		return now >= releaseDate && now <= expiryDate;
	});
}
