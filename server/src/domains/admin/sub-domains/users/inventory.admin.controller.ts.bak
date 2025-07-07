import { db } from '@db'; // Adjust
import { userInventory, products } from '@schema'; // Adjust
import { eq, and, getTableColumns } from 'drizzle-orm';
import { logger } from "../../../../core/logger";

export const userInventoryAdminController = {
	// View a user's inventory
	async viewInventory(req, res) {
		const { userId } = req.params;
		const inventoryItems = await db
			.select({
				...getTableColumns(userInventory),
				productName: products.name, // Include product name for readability
				productPluginReward: products.pluginReward
			})
			.from(userInventory)
			.leftJoin(products, eq(userInventory.productId, products.id))
			.where(eq(userInventory.userId, userId));
		res.json(inventoryItems);
	},

	// Grant an item to a user
	async grantItem(req, res) {
		const { userId } = req.params;
		const { productId, quantity = 1, metadata } = req.body;

		if (!productId) {
			return res.status(400).json({ message: 'Product ID is required.' });
		}

		try {
			// Check if user already has this item (non-stackable unique items like cosmetics)
			// For stackable items, you would update quantity.
			// This example assumes unique items for now.
			const existingItem = await db
				.select()
				.from(userInventory)
				.where(
					and(eq(userInventory.userId, userId), eq(userInventory.productId, productId))
				)
				.limit(1);

			if (existingItem.length > 0) {
				// Optionally, update quantity if item is stackable, or just return info
				return res
					.status(409)
					.json({ message: 'User already owns this item.', item: existingItem[0] });
			}

			const newItem = await db
				.insert(userInventory)
				.values({
					userId,
					productId,
					quantity,
					metadata,
					acquiredAt: new Date()
				})
				.returning();
			res.status(201).json(newItem[0]);
		} catch (error) {
			logger.error('Error granting item:', error);
			res.status(500).json({ message: 'Error granting item', error: error.message });
		}
	},

	// Force equip an item for a user
	async equipItem(req, res) {
		const { userId, inventoryItemId } = req.params;

		try {
			await db.transaction(async (tx) => {
				const itemToEquipResult = await tx
					.select({
						id: userInventory.id,
						productId: userInventory.productId,
						userId: userInventory.userId,
						// Assuming pluginReward is stored as a JSON string or object
						// Adjust the type assertion as per your actual schema definition if it's already an object
						pluginRewardString: products.pluginReward
					})
					.from(userInventory)
					.leftJoin(products, eq(userInventory.productId, products.id))
					.where(
						and(
							eq(userInventory.id, inventoryItemId),
							eq(userInventory.userId, userId)
						)
					)
					.limit(1);

				if (itemToEquipResult.length === 0) {
					throw new Error('Inventory item not found or not owned by user.');
				}

				const itemToEquip = itemToEquipResult[0];
				let currentItemType: string | undefined = undefined;

				try {
					// Ensure pluginRewardString is treated as a string before parsing
					const pluginRewardString = itemToEquip.pluginRewardString as string | null;
					if (pluginRewardString) {
						const parsedPluginReward = JSON.parse(pluginRewardString);
						currentItemType = parsedPluginReward?.type;
					}
				} catch (e) {
					logger.error('Failed to parse pluginReward for item to equip:', itemToEquip.id, e);
					// Decide if this is a critical error. If type is essential for equip logic,
					// you might want to throw an error or handle it gracefully.
					// For now, we'll proceed, and it won't unequip others if type is unknown.
				}

				if (currentItemType) {
					// Find all other equipped items for this user
					const allEquippedItems = await tx
						.select({
							inventoryId: userInventory.id,
							pluginRewardString: products.pluginReward // Assuming it's a string
						})
						.from(userInventory)
						.leftJoin(products, eq(userInventory.productId, products.id))
						.where(
							and(
								eq(userInventory.userId, userId),
								eq(userInventory.equipped, true),
								// Exclude the item we are about to equip
								eq(userInventory.id, inventoryItemId).not()
							)
						);

					const itemsToUnequipIds: number[] = [];
					for (const equippedItem of allEquippedItems) {
						try {
							// Ensure pluginRewardString is treated as a string before parsing
							const pluginRewardStr = equippedItem.pluginRewardString as string | null;
							if (pluginRewardStr) {
								const parsedReward = JSON.parse(pluginRewardStr);
								if (parsedReward?.type === currentItemType) {
									itemsToUnequipIds.push(equippedItem.inventoryId);
								}
							}
						} catch (e) {
							logger.error('Failed to parse pluginReward for an equipped item:', equippedItem.inventoryId, e);
							// Continue to the next item, don't let one bad JSON break the loop
						}
					}

					if (itemsToUnequipIds.length > 0) {
						await tx
							.update(userInventory)
							.set({ equipped: false, updatedAt: new Date() })
							.where(
								and(
									eq(userInventory.userId, userId),
									userInventory.id.in(itemsToUnequipIds)
								)
							);
					}
				}

				// Now equip the target item
				const updateResult = await tx
					.update(userInventory)
					.set({ equipped: true, updatedAt: new Date() })
					.where(eq(userInventory.id, inventoryItemId))
					.returning();

				if (updateResult.length === 0) {
					throw new Error('Failed to equip the item after transaction.');
				}
			});

			const finalEquippedItem = await db
				.select()
				.from(userInventory)
				.where(eq(userInventory.id, inventoryItemId))
				.limit(1);

			res.json({
				success: true,
				message: 'Item equipped successfully',
				item: finalEquippedItem[0]
			});
		} catch (error) {
			logger.error('Error equipping item:', error);
			res.status(500).json({
				success: false,
				message: error.message || 'Error equipping item'
			});
		}
	},

	// Force unequip an item for a user
	async unequipItem(req, res) {
		const { userId, inventoryItemId } = req.params;
		try {
			const unequippedItem = await db
				.update(userInventory)
				.set({ equipped: false, updatedAt: new Date() })
				.where(
					and(
						eq(userInventory.id, inventoryItemId),
						eq(userInventory.userId, userId)
					)
				)
				.returning();

			if (unequippedItem.length === 0) {
				return res.status(404).json({ message: 'Inventory item not found or not owned by user.' });
			}
			res.json(unequippedItem[0]);
		} catch (error) {
			logger.error('Error unequipping item:', error);
			res.status(500).json({ message: 'Error unequipping item', error: error.message });
		}
	}
};
