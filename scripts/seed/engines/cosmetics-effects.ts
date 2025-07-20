import { db } from '../../../db';
// import { logger } from '@server/core/logger'; // Logger not needed in seeding
import * as schema from '../../../db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import type { UserId } from '../../../shared/types/ids';
import { getSeedConfig } from '../config/seed.config';
import { personas } from '../config/personas.config';
import chalk from 'chalk';

export interface CosmeticItem {
	id: string;
	name: string;
	type: 'frame' | 'effect' | 'badge' | 'cursor' | 'background' | 'signature';
	rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
	price: number;
	effects?: {
		animation?: string;
		color?: string;
		special?: string[];
	};
}

export interface CosmeticSet {
	id: string;
	name: string;
	items: string[];
	bonus?: string;
}

export class CosmeticsEffectsEngine {
	private config = getSeedConfig();
	private cosmeticItems: Map<string, CosmeticItem> = new Map();
	private cosmeticSets: Map<string, CosmeticSet> = new Map();
	private rarityWeights = {
		common: 0.5,
		uncommon: 0.3,
		rare: 0.15,
		epic: 0.04,
		legendary: 0.01
	};

	private log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
		const prefix = {
			info: chalk.cyan('ℹ️'),
			success: chalk.green('✅'),
			error: chalk.red('❌'),
			warn: chalk.yellow('⚠️')
		}[type];
		
		console.log(`${prefix} [CosmeticsEngine] ${message}`);
	}

	/**
	 * Initialize cosmetics from database
	 */
	async initialize(): Promise<void> {
		this.log('Initializing cosmetics effects engine...', 'info');

		// Load all cosmetic items
		await this.loadCosmeticItems();
		
		// Define cosmetic sets
		this.defineCosmeticSets();

		this.log(`Loaded ${this.cosmeticItems.size} cosmetic items and ${this.cosmeticSets.size} sets`, 'success');
	}

	/**
	 * Load cosmetic items from shop products
	 */
	private async loadCosmeticItems(): Promise<void> {
		// In a real implementation, these would come from the database
		// For now, we'll define them programmatically
		const cosmeticDefinitions: CosmeticItem[] = [
			// Frames
			{ id: 'default_frame', name: 'Default Frame', type: 'frame', rarity: 'common', price: 0 },
			{ id: 'starter_frame', name: 'Starter Frame', type: 'frame', rarity: 'common', price: 100 },
			{ id: 'wooden_frame', name: 'Wooden Frame', type: 'frame', rarity: 'common', price: 250 },
			{ id: 'silver_frame', name: 'Silver Frame', type: 'frame', rarity: 'uncommon', price: 500 },
			{ id: 'golden_frame', name: 'Golden Frame', type: 'frame', rarity: 'rare', price: 1000 },
			{ id: 'diamond_frame', name: 'Diamond Frame', type: 'frame', rarity: 'epic', price: 2500 },
			{ id: 'rainbow_frame', name: 'Rainbow Animated Frame', type: 'frame', rarity: 'legendary', price: 5000, effects: { animation: 'rainbow_cycle' } },
			{ id: 'fire_frame', name: 'Fire Frame', type: 'frame', rarity: 'epic', price: 3000, effects: { animation: 'fire' } },
			{ id: 'ice_frame', name: 'Ice Frame', type: 'frame', rarity: 'epic', price: 3000, effects: { animation: 'frost' } },
			{ id: 'admin_crown', name: 'Admin Crown Frame', type: 'frame', rarity: 'legendary', price: 0, effects: { special: ['admin_only'] } },
			{ id: 'mod_badge', name: 'Moderator Badge Frame', type: 'frame', rarity: 'epic', price: 0, effects: { special: ['mod_only'] } },
			{ id: 'whale_frame', name: 'Whale Frame', type: 'frame', rarity: 'legendary', price: 10000, effects: { animation: 'water_splash' } },
			{ id: 'streak_fire_frame', name: 'Streak Fire Frame', type: 'frame', rarity: 'rare', price: 1500, effects: { animation: 'fire_small' } },
			{ id: 'heart_frame', name: 'Heart Frame', type: 'frame', rarity: 'uncommon', price: 750, effects: { animation: 'pulse' } },
			{ id: 'skull_frame', name: 'Skull Frame', type: 'frame', rarity: 'rare', price: 1250, effects: { special: ['edgy'] } },
			{ id: 'invisible_frame', name: 'Invisible Frame', type: 'frame', rarity: 'uncommon', price: 500, effects: { special: ['transparent'] } },
			{ id: 'pepe_frame', name: 'Pepe Frame', type: 'frame', rarity: 'rare', price: 1337, effects: { special: ['meme'] } },
			{ id: 'insider_frame', name: 'Insider Frame', type: 'frame', rarity: 'epic', price: 2000, effects: { special: ['exclusive'] } },
			{ id: 'red_alert_frame', name: 'Red Alert Frame', type: 'frame', rarity: 'uncommon', price: 800, effects: { animation: 'flash_red' } },

			// Name effects
			{ id: 'rainbow_gradient_name', name: 'Rainbow Gradient', type: 'effect', rarity: 'legendary', price: 3000, effects: { color: 'rainbow_gradient' } },
			{ id: 'golden_glow_name', name: 'Golden Glow', type: 'effect', rarity: 'rare', price: 1500, effects: { color: 'gold_glow' } },
			{ id: 'matrix_text', name: 'Matrix Text', type: 'effect', rarity: 'epic', price: 2000, effects: { animation: 'matrix_rain' } },
			{ id: 'flashing_text_name', name: 'Flashing Text', type: 'effect', rarity: 'uncommon', price: 600, effects: { animation: 'flash' } },
			{ id: 'encrypted_name', name: 'Encrypted Name', type: 'effect', rarity: 'rare', price: 1200, effects: { special: ['encrypted'] } },
			{ id: 'comic_sans_name', name: 'Comic Sans', type: 'effect', rarity: 'common', price: 420, effects: { special: ['font_change'] } },
			{ id: 'pastel_gradient_name', name: 'Pastel Gradient', type: 'effect', rarity: 'uncommon', price: 800, effects: { color: 'pastel_gradient' } },
			{ id: 'blood_drip_name', name: 'Blood Drip', type: 'effect', rarity: 'rare', price: 1100, effects: { animation: 'drip' } },

			// Signatures
			{ id: 'default_signature', name: 'Default Signature', type: 'signature', rarity: 'common', price: 0 },
			{ id: 'golden_signature', name: 'Golden Signature', type: 'signature', rarity: 'rare', price: 1000, effects: { color: 'gold' } },
			{ id: 'matrix_signature', name: 'Matrix Signature', type: 'signature', rarity: 'epic', price: 1800, effects: { animation: 'matrix' } },
			{ id: 'classified_signature', name: 'Classified Signature', type: 'signature', rarity: 'rare', price: 1300, effects: { special: ['redacted'] } },
			{ id: 'meme_collage_sig', name: 'Meme Collage', type: 'signature', rarity: 'uncommon', price: 900, effects: { special: ['meme_bg'] } },
			{ id: 'helpful_badge', name: 'Helper Badge', type: 'signature', rarity: 'uncommon', price: 600, effects: { special: ['badge'] } },
			{ id: 'edgy_signature', name: 'Edgy Signature', type: 'signature', rarity: 'uncommon', price: 666, effects: { special: ['dark'] } },

			// Cursors
			{ id: 'default_cursor', name: 'Default Cursor', type: 'cursor', rarity: 'common', price: 0 },
			{ id: 'diamond_cursor', name: 'Diamond Cursor', type: 'cursor', rarity: 'epic', price: 2200, effects: { special: ['sparkle'] } },
			{ id: 'ban_hammer_cursor', name: 'Ban Hammer', type: 'cursor', rarity: 'epic', price: 0, effects: { special: ['mod_only'] } },
			{ id: 'calculator_cursor', name: 'Calculator Cursor', type: 'cursor', rarity: 'uncommon', price: 750, effects: { special: ['nerdy'] } },
			{ id: 'magnifying_glass', name: 'Magnifying Glass', type: 'cursor', rarity: 'uncommon', price: 800, effects: { special: ['detective'] } },
			{ id: 'wojak_cursor', name: 'Wojak Cursor', type: 'cursor', rarity: 'rare', price: 1100, effects: { special: ['meme'] } },
			{ id: 'angel_wings', name: 'Angel Wings Cursor', type: 'cursor', rarity: 'rare', price: 1400, effects: { special: ['holy'] } },
			{ id: 'ghost_cursor', name: 'Ghost Cursor', type: 'cursor', rarity: 'uncommon', price: 700, effects: { special: ['transparent'] } },
			{ id: 'middle_finger_cursor', name: 'Middle Finger', type: 'cursor', rarity: 'rare', price: 1337, effects: { special: ['offensive'] } },

			// Backgrounds/Effects
			{ id: 'money_rain_effect', name: 'Money Rain', type: 'background', rarity: 'legendary', price: 5000, effects: { animation: 'money_fall' } },
			{ id: 'efficiency_aura', name: 'Efficiency Aura', type: 'background', rarity: 'rare', price: 1600, effects: { animation: 'glow_pulse' } },
			{ id: 'spreadsheet_bg', name: 'Spreadsheet Background', type: 'background', rarity: 'uncommon', price: 850, effects: { special: ['grid'] } },
			{ id: 'doge_bg', name: 'Doge Background', type: 'background', rarity: 'rare', price: 1420, effects: { special: ['meme_pattern'] } },
			{ id: 'echo_effect', name: 'Echo Effect', type: 'background', rarity: 'uncommon', price: 600, effects: { special: ['shadow_text'] } },

			// Badges
			{ id: 'xp_counter_badge', name: 'XP Counter', type: 'badge', rarity: 'uncommon', price: 700, effects: { special: ['live_counter'] } }
		];

		// Store in map
		cosmeticDefinitions.forEach(item => {
			this.cosmeticItems.set(item.id, item);
		});
	}

	/**
	 * Define cosmetic sets with bonuses
	 */
	private defineCosmeticSets(): void {
		const sets: CosmeticSet[] = [
			{
				id: 'golden_set',
				name: 'Golden Collection',
				items: ['golden_frame', 'golden_glow_name', 'golden_signature'],
				bonus: 'golden_aura_effect'
			},
			{
				id: 'matrix_set',
				name: 'Matrix Set',
				items: ['matrix_text', 'matrix_signature'],
				bonus: 'matrix_bg_effect'
			},
			{
				id: 'meme_lord_set',
				name: 'Meme Lord',
				items: ['pepe_frame', 'comic_sans_name', 'meme_collage_sig', 'wojak_cursor', 'doge_bg'],
				bonus: 'meme_sounds'
			},
			{
				id: 'efficiency_set',
				name: 'Efficiency Expert',
				items: ['streak_fire_frame', 'xp_counter_badge', 'efficiency_aura', 'calculator_cursor', 'spreadsheet_bg'],
				bonus: 'xp_boost_visual'
			},
			{
				id: 'whale_set',
				name: 'Whale Suite',
				items: ['whale_frame', 'rainbow_gradient_name', 'golden_signature', 'diamond_cursor', 'money_rain_effect'],
				bonus: 'whale_sounds'
			},
			{
				id: 'admin_set',
				name: 'Admin Powers',
				items: ['admin_crown', 'rainbow_gradient_name', 'matrix_signature', 'golden_frame'],
				bonus: 'admin_particles'
			},
			{
				id: 'edge_lord_set',
				name: 'Edge Lord',
				items: ['skull_frame', 'blood_drip_name', 'edgy_signature', 'middle_finger_cursor'],
				bonus: 'dark_mode_extreme'
			}
		];

		sets.forEach(set => {
			this.cosmeticSets.set(set.id, set);
		});
	}

	/**
	 * Generate cosmetic ownership for a user based on persona
	 */
	async generateUserCosmetics(userId: UserId, personaId: string): Promise<void> {
		const persona = personas[personaId];
		if (!persona) return;

		this.log(`Generating cosmetics for ${persona.username}`, 'info');

		// Determine owned items
		const ownedItems = await this.determineOwnedItems(persona);

		// Save to inventory
		for (const itemId of ownedItems) {
			const item = this.cosmeticItems.get(itemId);
			if (!item) continue;

			await db.insert(schema.userInventory).values({
				userId,
				itemId,
				itemType: 'cosmetic',
				quantity: 1,
				metadata: {
					equipped: persona.cosmetics.equipped.includes(itemId),
					acquiredFrom: this.getAcquisitionSource(persona, item)
				},
				acquiredAt: new Date()
			}).onConflictDoNothing();
		}

		// Equip items
		await this.equipCosmeticsForUser(userId, persona);

		this.log(`Generated ${ownedItems.size} cosmetics for ${persona.username}`, 'success');
	}

	/**
	 * Determine which items a persona should own
	 */
	private async determineOwnedItems(persona: Persona): Promise<Set<string>> {
		const owned = new Set<string>();

		// Special case: whales own everything
		if (persona.cosmetics.owned === 'all') {
			this.cosmeticItems.forEach((item, id) => {
				if (!item.effects?.special?.includes('admin_only') || persona.role === 'admin') {
					if (!item.effects?.special?.includes('mod_only') || ['admin', 'moderator'].includes(persona.role)) {
						owned.add(id);
					}
				}
			});
			return owned;
		}

		// Add specified items
		persona.cosmetics.owned.forEach(id => owned.add(id));

		// Add items based on persona type
		if (persona.role === 'admin') {
			owned.add('admin_crown');
			owned.add('rainbow_gradient_name');
			owned.add('golden_frame');
		}

		if (persona.role === 'moderator') {
			owned.add('mod_badge');
			owned.add('red_alert_frame');
			owned.add('ban_hammer_cursor');
		}

		// Add items based on stats
		if (persona.stats.level >= 40) {
			// Veterans get some rare items
			const veteranItems = Array.from(this.cosmeticItems.entries())
				.filter(([_, item]) => item.rarity === 'rare' && Math.random() < this.config.cosmetics.ownership.veteranRareItems)
				.map(([id]) => id);
			veteranItems.forEach(id => owned.add(id));
		}

		if (persona.stats.dgt > 10000) {
			// Rich users have expensive items
			const expensiveItems = Array.from(this.cosmeticItems.entries())
				.filter(([_, item]) => item.price > 1000 && Math.random() < 0.5)
				.map(([id]) => id);
			expensiveItems.forEach(id => owned.add(id));
		}

		// Newbies get starter pack
		if (persona.stats.level <= 5 && this.config.cosmetics.ownership.newbieStarterPack) {
			owned.add('starter_frame');
			owned.add('default_signature');
		}

		// Add random items based on rarity
		const randomCount = Math.floor(Math.random() * 10) + 5;
		const availableItems = Array.from(this.cosmeticItems.entries())
			.filter(([id]) => !owned.has(id));

		for (let i = 0; i < randomCount; i++) {
			const item = this.selectRandomByRarity(availableItems);
			if (item) owned.add(item[0]);
		}

		return owned;
	}

	/**
	 * Equip cosmetics for a user
	 */
	private async equipCosmeticsForUser(userId: UserId, persona: Persona): Promise<void> {
		const equipped = persona.cosmetics.equipped;
		const equippedData: Record<string, any> = {};

		// Check for set bonuses
		let activeSetBonus = null;
		for (const [setId, set] of this.cosmeticSets) {
			if (set.items.every(item => equipped.includes(item))) {
				activeSetBonus = set.bonus;
				this.log(`${persona.username} has complete ${set.name} set!`, 'success');
				break;
			}
		}

		// Build equipped configuration
		equipped.forEach(itemId => {
			const item = this.cosmeticItems.get(itemId);
			if (!item) return;

			switch (item.type) {
				case 'frame':
					equippedData.avatarFrame = itemId;
					break;
				case 'effect':
					equippedData.nameEffect = itemId;
					break;
				case 'signature':
					equippedData.signature = itemId;
					break;
				case 'cursor':
					equippedData.cursor = itemId;
					break;
				case 'background':
					equippedData.background = itemId;
					break;
				case 'badge':
					if (!equippedData.badges) equippedData.badges = [];
					equippedData.badges.push(itemId);
					break;
			}
		});

		if (activeSetBonus) {
			equippedData.setBonus = activeSetBonus;
		}

		// Chaos mode - random mismatched items
		if (Math.random() < this.config.cosmetics.combinations.chaosMode) {
			this.applyChaosMode(equippedData);
		}

		// Update user preferences
		await db.insert(schema.userPreferences).values({
			userId,
			cosmeticsConfig: equippedData,
			theme: persona.cosmetics.preferredTheme || 'default'
		}).onConflictDoUpdate({
			target: schema.userPreferences.userId,
			set: {
				cosmeticsConfig: equippedData,
				theme: persona.cosmetics.preferredTheme || 'default',
				updatedAt: new Date()
			}
		});
	}

	/**
	 * Apply chaos mode - random mismatched cosmetics
	 */
	private applyChaosMode(equippedData: Record<string, any>): void {
		const allItems = Array.from(this.cosmeticItems.entries());
		
		// Randomly swap some items
		if (Math.random() < 0.5 && equippedData.avatarFrame) {
			const randomFrame = allItems.find(([_, item]) => item.type === 'frame' && Math.random() < 0.3);
			if (randomFrame) equippedData.avatarFrame = randomFrame[0];
		}

		if (Math.random() < 0.5 && equippedData.nameEffect) {
			const randomEffect = allItems.find(([_, item]) => item.type === 'effect' && Math.random() < 0.3);
			if (randomEffect) equippedData.nameEffect = randomEffect[0];
		}

		equippedData.chaosMode = true;
		this.log('Applied chaos mode to cosmetics!', 'warn');
	}

	/**
	 * Select random item by rarity weight
	 */
	private selectRandomByRarity(items: Array<[string, CosmeticItem]>): [string, CosmeticItem] | null {
		const weighted = items.map(([id, item]) => ({
			id,
			item,
			weight: this.rarityWeights[item.rarity]
		}));

		const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
		let random = Math.random() * totalWeight;

		for (const w of weighted) {
			random -= w.weight;
			if (random <= 0) {
				return [w.id, w.item];
			}
		}

		return null;
	}

	/**
	 * Get acquisition source for an item
	 */
	private getAcquisitionSource(persona: Persona, item: CosmeticItem): string {
		if (item.effects?.special?.includes('admin_only')) return 'admin_grant';
		if (item.effects?.special?.includes('mod_only')) return 'mod_grant';
		if (item.price === 0) return 'starter';
		if (persona.stats.dgt > item.price * 10) return 'shop_purchase';
		if (item.rarity === 'legendary') return 'achievement_reward';
		if (Math.random() < 0.3) return 'event_reward';
		return 'shop_purchase';
	}

	/**
	 * Simulate shop purchases over time
	 */
	async simulateShopPurchases(userId: UserId, personaId: string, dayNumber: number): Promise<void> {
		const persona = personas[personaId];
		if (!persona) return;

		// Only spenders buy cosmetics
		if (persona.behavior.tipGenerosity === 'stingy') return;

		// Purchase probability based on day and persona
		const purchaseProbability = {
			generous: 0.1,
			normal: 0.05,
			whale: 0.3,
			stingy: 0
		}[persona.behavior.tipGenerosity];

		if (Math.random() > purchaseProbability) return;

		// Get user's current balance
		const [wallet] = await db
			.select()
			.from(schema.wallets)
			.where(eq(schema.wallets.userId, userId))
			.limit(1);

		if (!wallet || wallet.balance < 100) return;

		// Find affordable items not owned
		const ownedItems = await db
			.select({ itemId: schema.userInventory.itemId })
			.from(schema.userInventory)
			.where(eq(schema.userInventory.userId, userId));

		const ownedIds = new Set(ownedItems.map(o => o.itemId));
		const affordableItems = Array.from(this.cosmeticItems.entries())
			.filter(([id, item]) => !ownedIds.has(id) && item.price <= wallet.balance && item.price > 0);

		if (affordableItems.length === 0) return;

		// Select item to purchase
		const [itemId, item] = this.selectRandomByRarity(affordableItems) || affordableItems[0];

		// Process purchase
		await db.transaction(async (tx) => {
			// Deduct balance
			await tx
				.update(schema.wallets)
				.set({
					balance: sql`${schema.wallets.balance} - ${item.price}`
				})
				.where(eq(schema.wallets.userId, userId));

			// Add to inventory
			await tx.insert(schema.userInventory).values({
				userId,
				itemId,
				itemType: 'cosmetic',
				quantity: 1,
				metadata: {
					equipped: false,
					acquiredFrom: 'shop_purchase',
					purchasePrice: item.price
				},
				acquiredAt: new Date()
			});

			// Log transaction
			await tx.insert(schema.transactions).values({
				fromUserId: userId,
				toUserId: null,
				amount: item.price,
				currency: 'DGT',
				type: 'shop_purchase',
				status: 'completed',
				metadata: {
					itemId,
					itemName: item.name,
					itemType: item.type
				}
			});
		});

		this.log(`${persona.username} purchased ${item.name} for ${item.price} DGT`, 'success');

		// Sometimes equip immediately
		if (Math.random() < 0.5) {
			await this.equipNewItem(userId, itemId);
		}
	}

	/**
	 * Equip a newly purchased item
	 */
	private async equipNewItem(userId: UserId, itemId: string): Promise<void> {
		const item = this.cosmeticItems.get(itemId);
		if (!item) return;

		// Get current equipped items
		const [prefs] = await db
			.select()
			.from(schema.userPreferences)
			.where(eq(schema.userPreferences.userId, userId))
			.limit(1);

		const currentConfig = prefs?.cosmeticsConfig || {};

		// Update config based on item type
		switch (item.type) {
			case 'frame':
				currentConfig.avatarFrame = itemId;
				break;
			case 'effect':
				currentConfig.nameEffect = itemId;
				break;
			case 'signature':
				currentConfig.signature = itemId;
				break;
			case 'cursor':
				currentConfig.cursor = itemId;
				break;
			case 'background':
				currentConfig.background = itemId;
				break;
			case 'badge':
				if (!currentConfig.badges) currentConfig.badges = [];
				currentConfig.badges.push(itemId);
				break;
		}

		// Update preferences
		await db
			.update(schema.userPreferences)
			.set({
				cosmeticsConfig: currentConfig,
				updatedAt: new Date()
			})
			.where(eq(schema.userPreferences.userId, userId));

		// Update inventory metadata
		await db
			.update(schema.userInventory)
			.set({
				metadata: sql`jsonb_set(metadata, '{equipped}', 'true'::jsonb)`
			})
			.where(and(
				eq(schema.userInventory.userId, userId),
				eq(schema.userInventory.itemId, itemId)
			));
	}

	/**
	 * Generate cosmetics for all users
	 */
	async generateForAllUsers(users: Array<{ id: UserId; personaId: string }>): Promise<void> {
		this.log(`Generating cosmetics for ${users.length} users`, 'info');

		for (const user of users) {
			await this.generateUserCosmetics(user.id, user.personaId);
		}

		this.log('Cosmetics generation complete!', 'success');
	}
}