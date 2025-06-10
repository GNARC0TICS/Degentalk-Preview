import {
	BaseVaultItem,
	VaultFrame,
	VaultTitle,
	VaultColor,
	VaultBoost,
	ItemCategory,
	ItemRarity,
	UnlockMethod,
	SeasonType,
	vaultItems
} from './rare-items-vault';

// Global interface for all admin operations on vault items
export interface VaultAdminService {
	// Item CRUD operations
	getItem(id: string): Promise<BaseVaultItem | null>;
	getAllItems(): Promise<BaseVaultItem[]>;
	getItemsByCategory(category: ItemCategory): Promise<BaseVaultItem[]>;
	getItemsByRarity(rarity: ItemRarity): Promise<BaseVaultItem[]>;
	createItem(item: Omit<BaseVaultItem, 'id'>): Promise<BaseVaultItem>;
	updateItem(id: string, updates: Partial<BaseVaultItem>): Promise<BaseVaultItem>;
	deleteItem(id: string): Promise<boolean>;

	// Specialized operations
	enableItem(id: string): Promise<BaseVaultItem>;
	disableItem(id: string): Promise<BaseVaultItem>;
	setItemRarity(id: string, rarity: ItemRarity): Promise<BaseVaultItem>;
	setItemPrice(id: string, dgtPrice: number, usdtPrice: number): Promise<BaseVaultItem>;
	addItemUnlockMethod(id: string, method: UnlockMethod): Promise<BaseVaultItem>;
	removeItemUnlockMethod(id: string, method: UnlockMethod): Promise<BaseVaultItem>;
	setItemXpRequirement(id: string, xp: number): Promise<BaseVaultItem>;

	// Seasonal management
	setItemSeason(id: string, season: SeasonType): Promise<BaseVaultItem>;
	setItemAvailabilityDates(
		id: string,
		releaseDateUtc: string,
		expiryDateUtc: string
	): Promise<BaseVaultItem>;
	getCurrentSeasonalItems(): Promise<BaseVaultItem[]>;

	// Lootbox management
	setItemDropChance(id: string, dropChance: number): Promise<BaseVaultItem>;
	getLootboxItems(): Promise<BaseVaultItem[]>;

	// Event management
	createEvent(name: string, startDate: string, endDate: string, itemIds: string[]): Promise<any>;
	getEvents(): Promise<any[]>;
	addItemToEvent(eventId: string, itemId: string): Promise<any>;

	// Admin audit
	getItemHistory(id: string): Promise<any[]>;
	getAdminActionLog(): Promise<any[]>;
}

// Mock implementation for demo purposes
export class MockVaultAdminService implements VaultAdminService {
	private items: BaseVaultItem[] = [
		...vaultItems.frames,
		...vaultItems.titles,
		...vaultItems.colors,
		...vaultItems.boosts,
		...vaultItems.exclusives
	];

	private events: any[] = [];
	private actionLog: any[] = [];
	private itemHistory: Record<string, any[]> = {};

	// Helper to log admin actions
	private logAction(action: string, itemId?: string, details?: any): void {
		const timestamp = new Date().toISOString();
		const logEntry = {
			timestamp,
			action,
			itemId,
			details,
			adminId: 'current-admin' // In a real implementation, this would be the actual admin ID
		};

		this.actionLog.push(logEntry);

		// Add to item history if applicable
		if (itemId) {
			if (!this.itemHistory[itemId]) {
				this.itemHistory[itemId] = [];
			}
			this.itemHistory[itemId].push(logEntry);
		}
	}

	// Item CRUD operations
	async getItem(id: string): Promise<BaseVaultItem | null> {
		const item = this.items.find((item) => item.id === id);
		return item || null;
	}

	async getAllItems(): Promise<BaseVaultItem[]> {
		return [...this.items];
	}

	async getItemsByCategory(category: ItemCategory): Promise<BaseVaultItem[]> {
		return this.items.filter((item) => item.category === category);
	}

	async getItemsByRarity(rarity: ItemRarity): Promise<BaseVaultItem[]> {
		return this.items.filter((item) => item.rarity === rarity);
	}

	async createItem(itemData: Omit<BaseVaultItem, 'id'>): Promise<BaseVaultItem> {
		// Generate a unique ID
		const id = `${itemData.category}-${Date.now()}`;
		const newItem = {
			...itemData,
			id,
			isEnabled: true
		} as BaseVaultItem;

		this.items.push(newItem);
		this.logAction('create_item', id, { item: newItem });

		return newItem;
	}

	async updateItem(id: string, updates: Partial<BaseVaultItem>): Promise<BaseVaultItem> {
		const index = this.items.findIndex((item) => item.id === id);
		if (index === -1) throw new Error(`Item with ID ${id} not found`);

		const updatedItem = {
			...this.items[index],
			...updates
		};

		this.items[index] = updatedItem;
		this.logAction('update_item', id, { updates, item: updatedItem });

		return updatedItem;
	}

	async deleteItem(id: string): Promise<boolean> {
		const index = this.items.findIndex((item) => item.id === id);
		if (index === -1) return false;

		this.items.splice(index, 1);
		this.logAction('delete_item', id);

		return true;
	}

	// Specialized operations
	async enableItem(id: string): Promise<BaseVaultItem> {
		return this.updateItem(id, { isEnabled: true });
	}

	async disableItem(id: string): Promise<BaseVaultItem> {
		return this.updateItem(id, { isEnabled: false });
	}

	async setItemRarity(id: string, rarity: ItemRarity): Promise<BaseVaultItem> {
		return this.updateItem(id, { rarity });
	}

	async setItemPrice(id: string, dgtPrice: number, usdtPrice: number): Promise<BaseVaultItem> {
		return this.updateItem(id, { dgtPrice, usdtPrice });
	}

	async addItemUnlockMethod(id: string, method: UnlockMethod): Promise<BaseVaultItem> {
		const item = await this.getItem(id);
		if (!item) throw new Error(`Item with ID ${id} not found`);

		const unlockMethods = [...item.unlockMethods];
		if (!unlockMethods.includes(method)) {
			unlockMethods.push(method);
		}

		return this.updateItem(id, { unlockMethods });
	}

	async removeItemUnlockMethod(id: string, method: UnlockMethod): Promise<BaseVaultItem> {
		const item = await this.getItem(id);
		if (!item) throw new Error(`Item with ID ${id} not found`);

		const unlockMethods = item.unlockMethods.filter((m) => m !== method);

		return this.updateItem(id, { unlockMethods });
	}

	async setItemXpRequirement(id: string, xp: number): Promise<BaseVaultItem> {
		return this.updateItem(id, { xpRequirement: xp });
	}

	// Seasonal management
	async setItemSeason(id: string, season: SeasonType): Promise<BaseVaultItem> {
		const item = await this.getItem(id);
		if (!item) throw new Error(`Item with ID ${id} not found`);

		// If changing to seasonal, update rarity
		const updates: Partial<BaseVaultItem> = { season };
		if (item.rarity !== 'seasonal') {
			updates.rarity = 'seasonal';
		}

		return this.updateItem(id, updates);
	}

	async setItemAvailabilityDates(
		id: string,
		releaseDateUtc: string,
		expiryDateUtc: string
	): Promise<BaseVaultItem> {
		return this.updateItem(id, { releaseDateUtc, expiryDateUtc });
	}

	async getCurrentSeasonalItems(): Promise<BaseVaultItem[]> {
		const now = new Date();

		return this.items.filter((item) => {
			if (item.rarity !== 'seasonal') return false;
			if (!item.releaseDateUtc || !item.expiryDateUtc) return true;

			const releaseDate = new Date(item.releaseDateUtc);
			const expiryDate = new Date(item.expiryDateUtc);

			return now >= releaseDate && now <= expiryDate;
		});
	}

	// Lootbox management
	async setItemDropChance(id: string, dropChance: number): Promise<BaseVaultItem> {
		return this.updateItem(id, { dropChance });
	}

	async getLootboxItems(): Promise<BaseVaultItem[]> {
		return this.items.filter(
			(item) => item.unlockMethods.includes('lootbox') && item.dropChance !== undefined
		);
	}

	// Event management
	async createEvent(
		name: string,
		startDate: string,
		endDate: string,
		itemIds: string[]
	): Promise<any> {
		const event = {
			id: `event-${Date.now()}`,
			name,
			startDate,
			endDate,
			itemIds,
			isActive: new Date(startDate) <= new Date() && new Date(endDate) >= new Date()
		};

		this.events.push(event);
		this.logAction('create_event', undefined, { event });

		return event;
	}

	async getEvents(): Promise<any[]> {
		return [...this.events];
	}

	async addItemToEvent(eventId: string, itemId: string): Promise<any> {
		const eventIndex = this.events.findIndex((e) => e.id === eventId);
		if (eventIndex === -1) throw new Error(`Event with ID ${eventId} not found`);

		const event = this.events[eventIndex];
		if (!event.itemIds.includes(itemId)) {
			event.itemIds.push(itemId);
		}

		this.logAction('add_item_to_event', itemId, { eventId });

		return event;
	}

	// Admin audit
	async getItemHistory(id: string): Promise<any[]> {
		return this.itemHistory[id] || [];
	}

	async getAdminActionLog(): Promise<any[]> {
		return [...this.actionLog];
	}
}

// Create and export a singleton instance
export const vaultAdminService = new MockVaultAdminService();
