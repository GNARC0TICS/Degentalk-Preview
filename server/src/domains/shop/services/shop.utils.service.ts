/**
 * Shop Service Utilities
 *
 * This file contains utility functions for managing the shop,
 * such as seeding the database with initial items.
 */

import { db } from '@db';
import { products } from '@db/schema';
import { logger } from '@core/logger';
import slugify from 'slugify';

// Mock shop items for when database items can't be fetched
export const mockShopItems = [
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

export class ShopUtilsService {
	/**
	 * Helper function to add a shop item to the products table
	 */
	static async addShopItem(item: {
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
			const slug = slugify(item.name, { lower: true, strict: true });

			const [newItem] = await db
				.insert(products)
				.values({
					name: item.name,
					slug,
					description: item.description,
					price: item.price.toString(),
					pointsPrice: item.pointsPrice,
					category: item.category,
					pluginReward: item.pluginReward,
					stockLimit: item.stockLimit,
					availableFrom: item.availableFrom,
					availableUntil: item.availableUntil,
					featuredUntil: item.featuredUntil,
					promotionLabel: item.promotionLabel
				})
				.returning({ id: products.id });

			return newItem.id;
		} catch (error) {
			logger.error('SHOP', 'Error adding shop item', { error, item });
			throw error;
		}
	}

	/**
	 * Helper function to seed the shop with initial items
	 */
	static async seedShopItems() {
		try {
			// Check if there are already items in the shop
			const [existingItems] = await db.select({ count: products.id }).from(products).limit(1);

			if (existingItems && existingItems.count) {
				logger.info(
					'SHOP',
					`Shop already has items. Skipping seeding.`
				);
				return;
			}

			// Seed with initial items
			const itemsToSeed = [
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
			
			for (const item of itemsToSeed) {
				await this.addShopItem(item);
			}

			logger.info('SHOP', `Seeded shop with ${itemsToSeed.length} items.`);

		} catch (error) {
			logger.error('SHOP', 'Error seeding shop items', { error });
			throw error;
		}
	}
} 