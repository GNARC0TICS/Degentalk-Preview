import {
	BaseVaultItem,
	VaultFrame,
	VaultTitle,
	VaultColor,
	VaultBoost,
	vaultItems
} from './rare-items-vault';
import type {
	ItemCategory,
	ItemRarity,
	UnlockMethod,
	SeasonType,
	VaultEvent,
	AdminActionLog,
	ItemHistory,
	VaultAdminService
} from '@/types/vault.types';

// Mock implementation for demo purposes
export class MockVaultAdminService implements VaultAdminService {
	private items: BaseVaultItem[] = [
		...vaultItems.frames,
		...vaultItems.titles,
		...vaultItems.colors,
		...vaultItems.boosts,
		...vaultItems.exclusives
	];

	private events: VaultEvent[] = [];
	private actionLog: AdminActionLog[] = [];
	private itemHistory: Record<string, ItemHistory[]> = {};

	// Helper to log admin actions
	private logAction(action: VaultAdminAction, itemId?: string, details?: VaultActionDetails): void {
		const timestamp = new Date().toISOString();
		const logEntry: AdminActionLog = {
			id: `log-${Date.now()}`,
			timestamp,
			adminId: 'current-admin', // In a real implementation, this would be the actual admin ID
			action,
			targetType: itemId ? 'item' : 'system',
			targetId: itemId || 'system',
			details
		};

		this.actionLog.push(logEntry);

		// Add to item history if applicable
		if (itemId) {
			if (!this.itemHistory[itemId]) {
				this.itemHistory[itemId] = [];
			}
			const historyEntry: ItemHistory = {
				id: `history-${Date.now()}`,
				itemId,
				action: this.mapActionToHistoryAction(action),
				timestamp,
				adminId: 'current-admin',
				changes: details.newState,
				metadata: details.metadata
			};
			this.itemHistory[itemId].push(historyEntry);
		}
	}

	// Helper to map vault admin actions to item history actions
	private mapActionToHistoryAction(action: VaultAdminAction): ItemHistory['action'] {
		switch (action) {
			case 'create_item':
				return 'created';
			case 'update_item':
			case 'enable_item':
			case 'disable_item':
				return 'updated';
			case 'grant_item':
				return 'granted';
			default:
				return 'updated';
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
		this.logAction('create_item', id, {
			newState: { item: newItem },
			metadata: { category: itemData.category, rarity: itemData.rarity }
		});

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
		this.logAction('update_item', id, {
			previousState: { item: this.items[index] },
			newState: { item: updatedItem, updates },
			metadata: { fieldsUpdated: Object.keys(updates) }
		});

		return updatedItem;
	}

	async deleteItem(id: string): Promise<boolean> {
		const index = this.items.findIndex((item) => item.id === id);
		if (index === -1) return false;

		const deletedItem = this.items[index];
		this.items.splice(index, 1);
		this.logAction('delete_item', id, {
			previousState: { item: deletedItem },
			metadata: { operation: 'permanent_deletion' }
		});

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

	async setItemPrice(id: string, prices: { dgt?: number; usdt?: number }): Promise<BaseVaultItem> {
		return this.updateItem(id, {
			dgtPrice: prices.dgt,
			usdtPrice: prices.usdt
		});
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
	async createEvent(eventData: Omit<VaultEvent, 'id'>): Promise<VaultEvent> {
		const event: VaultEvent = {
			...eventData,
			id: `event-${Date.now()}`,
			isActive:
				new Date(eventData.startDate) <= new Date() && new Date(eventData.endDate) >= new Date()
		};

		this.events.push(event);
		this.logAction('create_event', undefined, {
			newState: { event },
			metadata: { eventType: 'vault_event' }
		});

		return event;
	}

	async getEvents(): Promise<VaultEvent[]> {
		return [...this.events];
	}

	async addItemToEvent(eventId: string, itemId: string): Promise<VaultEvent> {
		const eventIndex = this.events.findIndex((e) => e.id === eventId);
		if (eventIndex === -1) throw new Error(`Event with ID ${eventId} not found`);

		const event = this.events[eventIndex];
		if (!event.itemIds.includes(itemId)) {
			event.itemIds.push(itemId);
		}

		this.logAction('grant_item', itemId, {
			newState: { eventId, addedToEvent: true },
			metadata: { operation: 'add_item_to_event' }
		});

		return event;
	}

	// Admin audit
	async getItemHistory(id: string): Promise<ItemHistory[]> {
		return this.itemHistory[id] || [];
	}

	async getAdminActionLog(): Promise<AdminActionLog[]> {
		return [...this.actionLog];
	}
}

// Create and export a singleton instance
export const vaultAdminService = new MockVaultAdminService();
