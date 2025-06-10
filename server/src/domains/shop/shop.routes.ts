import { Router } from 'express';
import { shopItems } from '../../../utils/shop-utils';
import { db } from '@db';
import { products } from '@schema';
import { eq, isNull, or, and, gte, lte } from 'drizzle-orm';

const router = Router();

// GET /api/shop/items
router.get('/items', async (req, res) => {
	try {
		const { category } = req.query;

		// TODO: Switch to database query once seeded
		// For now, we'll use mock data but transform it to match ShopItem interface

		// Example database query (commented out until DB is seeded):
		/*
    const now = new Date();
    const dbItems = await db.select().from(products)
      .where(and(
        eq(products.status, 'published'),
        eq(products.isDeleted, false),
        or(
          isNull(products.availableFrom),
          lte(products.availableFrom, now)
        ),
        or(
          isNull(products.availableUntil),
          gte(products.availableUntil, now)
        )
      ));
    */

		// Transform mock items to match ShopItem interface expected by frontend
		const transformedItems = shopItems.map((item) => ({
			...item,
			// These fields are already in mock data
			id: item.id,
			name: item.name,
			description: item.description,
			category: item.category,
			priceDGT: item.priceDGT,
			priceUSDT: item.priceUSDT,
			rarity: item.rarity,
			imageUrl: item.imageUrl,

			// Add missing fields with defaults
			isOwned: false,
			isEquipped: false,
			isLocked: false,
			requiredXP: null,
			expiresAt: null,
			availableFrom: null,
			availableUntil: null,
			stockLimit: null,
			stockLeft: null,
			isFeatured: false,
			featuredUntil: null,
			promotionLabel: null
		}));

		// Filter by category if provided
		if (category && category !== 'all') {
			const filtered = transformedItems.filter((item) => item.category === category);
			return res.json(filtered);
		}

		res.json(transformedItems);
	} catch (error) {
		console.error('Error fetching shop items:', error);
		const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
		res.status(500).json({ message: 'Error fetching shop items', error: errorMessage });
	}
});

// GET /api/shop/items/:id
router.get('/items/:id', async (req, res) => {
	try {
		const { id } = req.params;

		// Find in mock data for now
		const item = shopItems.find((item) => item.id === id);

		if (!item) {
			return res.status(404).json({ message: 'Item not found' });
		}

		// Transform to match ShopItem interface
		const transformedItem = {
			...item,
			isOwned: false,
			isEquipped: false,
			isLocked: false,
			requiredXP: null,
			expiresAt: null,
			availableFrom: null,
			availableUntil: null,
			stockLimit: null,
			stockLeft: null,
			isFeatured: false,
			featuredUntil: null,
			promotionLabel: null
		};

		res.json(transformedItem);
	} catch (error) {
		console.error('Error fetching shop item:', error);
		const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
		res.status(500).json({ message: 'Error fetching shop item', error: errorMessage });
	}
});

// TODO: Add purchase endpoint
// POST /api/shop/purchase

export default router;
