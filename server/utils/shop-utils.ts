import { users, products, userInventory } from '@schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { pool } from '../src/core/db';
import { logger, LogLevel, LogAction } from '../src/core/logger';
import slugify from 'slugify';

// Mock shop items for when database items can't be fetched
export const shopItems = [
	{
		id: 'frame-gold',
		name: 'Gold Border Frame',
		description: 'A luxurious gold frame to showcase your profile with style.',
		category: 'frames',
		priceDGT: 2000,
		priceUSDT: 20,
		rarity: 'legendary',
		imageUrl: '/assets/shop/gold-frame.png'
	},
	{
		id: 'title-degen',
		name: 'True Degen Title',
		description: "Show everyone you're a true crypto degen with this exclusive title.",
		category: 'titles',
		priceDGT: 1000,
		priceUSDT: 10,
		rarity: 'rare',
		imageUrl: '/assets/shop/degen-title.png'
	},
	{
		id: 'badge-whale',
		name: 'Whale Badge',
		description: 'The coveted Whale badge marks you as a major player.',
		category: 'badges',
		priceDGT: 5000,
		priceUSDT: 50,
		rarity: 'legendary',
		imageUrl: '/assets/shop/whale-badge.png'
	},
	{
		id: 'color-emerald',
		name: 'Emerald Username Color',
		description: 'Change your username color to a brilliant emerald green.',
		category: 'colors',
		priceDGT: 500,
		priceUSDT: 5,
		rarity: 'common',
		imageUrl: '/assets/shop/emerald-color.png'
	},
	{
		id: 'effect-sparkle',
		name: 'Sparkle Effect',
		description: 'Add a sparkling effect to your avatar that follows your cursor.',
		category: 'effects',
		priceDGT: 1500,
		priceUSDT: 15,
		rarity: 'rare',
		imageUrl: '/assets/shop/sparkle-effect.png'
	}
];

/**
 * Helper function to add a shop item to the products table
 */
export async function addShopItem(item: {
	name: string;
	description: string;
	price: number;
	pointsPrice: number;
	category?: string;
	pluginReward?: string;
	stockLimit?: number | null;
	availableFrom?: Date | null;
	availableUntil?: Date | null;
	featuredUntil?: Date | null;
	promotionLabel?: string | null;
}) {
	try {
		const metadata = {
			name: item.name,
			description: item.description,
			price: item.price,
			pointsPrice: item.pointsPrice,
			category: item.category || 'other',
			type: item.pluginReward || null
		};

		const slug = slugify(item.name, { lower: true, strict: true });

		const result = await pool.query(
			`INSERT INTO products (
        name,
        slug,
        description,
        price,
        points_price,
        plugin_reward,
        stock_limit,
        available_from,
        available_until,
        featured_until,
        promotion_label
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
      RETURNING product_id`,
			[
				item.name,
				slug,
				item.description,
				item.price,
				item.pointsPrice,
				JSON.stringify(metadata),
				item.stockLimit || null,
				item.availableFrom || null,
				item.availableUntil || null,
				item.featuredUntil || null,
				item.promotionLabel || null
			]
		);

		return result.rows[0]?.product_id;
	} catch (error) {
		logger.error('SHOP', 'Error adding shop item', error);
		throw error;
	}
}

/**
 * Helper function to seed the shop with initial items
 */
export async function seedShopItems() {
	try {
		// Check if there are already items in the shop
		const existingItems = await pool.query('SELECT COUNT(*) FROM products');

		if (existingItems.rows[0].count > 0) {
			logger.info(
				'SHOP',
				`Shop already has ${existingItems.rows[0].count} items. Skipping seeding.`
			);
			return;
		}

		// Seed with initial items
		const items = [
			{
				name: 'Gold Frame',
				description: 'A luxurious gold frame for your avatar',
				price: 29.99,
				pointsPrice: 3000,
				category: 'frames',
				pluginReward: 'frame:gold',
				stockLimit: 50,
				promotionLabel: 'NEW!'
			},
			{
				name: 'VIP Title',
				description: 'Show off your status with this exclusive title',
				price: 49.99,
				pointsPrice: 5000,
				category: 'titles',
				pluginReward: 'title:vip',
				stockLimit: 25,
				featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Featured for 30 days
			},
			{
				name: 'XP Boost (7 days)',
				description: 'Double your XP earnings for 7 days',
				price: 19.99,
				pointsPrice: 2000,
				category: 'boosts',
				pluginReward: 'boost:xp',
				stockLimit: null // Unlimited stock
			},
			{
				name: 'Cyan Username',
				description: 'Make your username stand out with this unique color',
				price: 15.99,
				pointsPrice: 1500,
				category: 'colors',
				pluginReward: 'color:#00FFFF'
			},
			{
				name: 'OG Drip Username Color',
				description:
					'Beta tester exclusive: a charcoal colored username with a slight red gradient',
				price: 99.99,
				pointsPrice: 10000,
				category: 'colors',
				pluginReward: 'color:gradient:#333333:#990000',
				stockLimit: 100,
				promotionLabel: 'BETA EXCLUSIVE'
			},
			{
				name: 'Mystery Box',
				description: 'Contains a random rare item',
				price: 39.99,
				pointsPrice: 4000,
				category: 'mystery',
				stockLimit: 10
			}
		];

		for (const item of items) {
			await addShopItem(item);
		}

		logger.info('SHOP', `✅ Successfully seeded shop with ${items.length} items`);
	} catch (error) {
		logger.error('SHOP', 'Error seeding shop items', error);
	}
}

/**
 * Helper function to add "OG Drip" username color for beta testers
 * This ensures the item exists even if other shop items were already seeded
 */
export async function addOGDripColorItem() {
	try {
		// Check if the OG Drip item already exists by searching for its name or plugin_reward value
		const existingItem = await pool.query(
			`SELECT product_id FROM products 
       WHERE plugin_reward::text LIKE '%OG Drip Username Color%' 
       OR plugin_reward::text LIKE '%gradient:#333333:#990000%'`
		);

		if (existingItem.rows.length > 0) {
			logger.info('SHOP', 'OG Drip Username Color already exists in the shop. Skipping addition.');
			return existingItem.rows[0].product_id;
		}

		// Add the OG Drip item
		const ogDripItem = {
			name: 'OG Drip Username Color',
			description: 'Beta tester exclusive: a charcoal colored username with a slight red gradient',
			price: 99.99,
			pointsPrice: 10000,
			category: 'colors',
			pluginReward: 'color:gradient:#333333:#990000',
			stockLimit: 100,
			promotionLabel: 'BETA EXCLUSIVE'
		};

		const productId = await addShopItem(ogDripItem);
		logger.info('SHOP', `✅ Successfully added OG Drip Username Color to shop (ID: ${productId})`);

		return productId;
	} catch (error) {
		logger.error('SHOP', 'Error adding OG Drip Username Color', error);
		throw error;
	}
}
