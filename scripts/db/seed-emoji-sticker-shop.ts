import { db } from '@db';
import { products } from '@schema';
import { logger } from '@core/logger';

/**
 * Script to seed emoji and sticker shop items based on cosmetics.config.ts
 * Run with: npm run seed:emoji-sticker-shop
 */

const EMOJI_STICKER_SHOP_ITEMS = [
    {
        name: "Diamond Hands Emoji",
        description: "Show your diamond hands with this animated Lottie emoji",
        price: 100,
        pointsPrice: 1000,
        stockLimit: null,
        status: 'published',
        pluginReward: {
            type: 'individualEmoji',
            emojiUnlocks: ['diamond_hands'],
            name: 'Diamond Hands',
            description: 'Unlocks the animated Diamond Hands emoji for posts and messages'
        },
        metadata: {
            category: 'emojis',
            rarity: 'premium',
            tags: ['crypto', 'animated', 'premium']
        }
    },
    {
        name: "Pepe Dance Emoji",
        description: "Classic Pepe dance GIF emoji for maximum meme power",
        price: 50,
        pointsPrice: 500,
        stockLimit: null,
        status: 'published',
        pluginReward: {
            type: 'individualEmoji',
            emojiUnlocks: ['pepe_dance'],
            name: 'Pepe Dance',
            description: 'Unlocks the animated Pepe Dance emoji'
        },
        metadata: {
            category: 'emojis',
            rarity: 'premium',
            tags: ['memes', 'pepe', 'animated']
        }
    },
    {
        name: "Doge Wow Sticker",
        description: "Such wow! Much sticker! Premium Doge meme sticker",
        price: 75,
        pointsPrice: 750,
        stockLimit: null,
        status: 'published',
        pluginReward: {
            type: 'individualSticker',
            stickerUnlocks: ['doge_wow'],
            name: 'Doge Wow',
            description: 'Unlocks the premium Doge Wow sticker for posts'
        },
        metadata: {
            category: 'stickers',
            rarity: 'premium',
            tags: ['memes', 'doge', 'premium']
        }
    },
    {
        name: "Moon Rocket Sticker",
        description: "Animated rocket sticker for when you're going to the moon",
        price: 150,
        pointsPrice: 1500,
        stockLimit: null,
        status: 'published',
        pluginReward: {
            type: 'individualSticker',
            stickerUnlocks: ['moon_rocket'],
            name: 'Moon Rocket',
            description: 'Unlocks the animated Moon Rocket sticker'
        },
        metadata: {
            category: 'stickers',
            rarity: 'premium',
            tags: ['crypto', 'moon', 'rocket', 'animated']
        }
    },
    {
        name: "Crypto Emoji Pack",
        description: "Essential crypto emojis for trading discussions",
        price: 180,
        pointsPrice: 1800,
        stockLimit: null,
        status: 'published',
        pluginReward: {
            type: 'emojiPack',
            emojiUnlocks: ['diamond_hands'],
            name: 'Crypto Emoji Pack',
            description: 'Unlocks premium crypto-themed emojis'
        },
        metadata: {
            category: 'emoji-packs',
            rarity: 'premium',
            tags: ['crypto', 'pack', 'premium']
        }
    },
    {
        name: "Ultimate Expression Bundle",
        description: "Complete emoji + sticker collection for maximum expression",
        price: 450,
        pointsPrice: 4500,
        stockLimit: 100,
        status: 'published',
        pluginReward: {
            type: 'emojiPack',
            emojiUnlocks: ['diamond_hands', 'pepe_dance'],
            stickerUnlocks: ['doge_wow', 'moon_rocket'],
            name: 'Ultimate Expression Bundle',
            description: 'Unlocks ALL premium emojis and stickers'
        },
        metadata: {
            category: 'bundles',
            rarity: 'legendary',
            tags: ['bundle', 'premium', 'discount', 'complete']
        }
    }
];

async function seedEmojiStickerShop() {
    try {
        console.log('😎 Starting emoji & sticker shop seeding...');

        let successCount = 0;
        let errorCount = 0;

        for (const item of EMOJI_STICKER_SHOP_ITEMS) {
            try {
                // Generate slug from name
                const slug = item.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

                await db.insert(products).values({
                    name: item.name,
                    slug: slug,
                    description: item.description,
                    price: item.price,
                    pointsPrice: item.pointsPrice,
                    stockLimit: item.stockLimit,
                    status: item.status as any,
                    pluginReward: item.pluginReward,
                    metadata: item.metadata,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

                console.log(`✅ Created: ${item.name} (${item.metadata.rarity})`);
                successCount++;
            } catch (error: any) {
                if (error.message?.includes('unique constraint')) {
                    console.log(`⚠️ Skipped: ${item.name} (already exists)`);
                } else {
                    console.error(`❌ Failed to create ${item.name}:`, error.message);
                    errorCount++;
                }
            }
        }

        console.log('\n📊 Emoji/Sticker Shop Seeding Summary:');
        console.log(`✅ Successfully created: ${successCount} products`);
        console.log(`❌ Failed: ${errorCount} products`);
        console.log(`📦 Total processed: ${EMOJI_STICKER_SHOP_ITEMS.length} products`);

        if (successCount > 0) {
            console.log('\n😎 Emoji & sticker shop items are now available!');
            console.log('💡 Users can purchase these from /shop to unlock premium emojis and stickers');
            console.log('🎯 Items unlock based on cosmetics.config.ts definitions');
            console.log('🛍️ Shop admins can manage these via /admin/shop');
        }

        console.log('\n✅ Emoji/sticker shop seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding emoji/sticker shop:', error);
        logger.error('EMOJI_STICKER_SHOP_SEED', 'Failed to seed emoji/sticker shop', error);
        process.exit(1);
    }
}

// Run the seeding
seedEmojiStickerShop(); 