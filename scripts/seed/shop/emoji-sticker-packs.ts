/**
 * Seed data for emoji and sticker shop items
 * References items defined in cosmetics.config.ts
 */

export interface EmojiStickerShopProduct {
    name: string;
    description: string;
    price: number; // DGT price
    pointsPrice?: number; // Optional points price
    stockLimit: number | null; // null = unlimited
    status: 'published' | 'draft' | 'archived';
    pluginReward: {
        type: 'emojiPack' | 'stickerPack' | 'individualEmoji' | 'individualSticker';
        value?: any; // For legacy compatibility
        emojiUnlocks?: string[]; // Config emoji IDs to unlock
        stickerUnlocks?: string[]; // Config sticker IDs to unlock
        name: string;
        description: string;
    };
    metadata: {
        category: 'emojis' | 'stickers' | 'mixed';
        rarity: string;
        tags?: string[];
    };
}

export const EMOJI_STICKER_SHOP_PRODUCTS: EmojiStickerShopProduct[] = [
    // Individual Premium Emojis
    {
        name: "Diamond Hands Emoji",
        description: "Show your diamond hands with this animated Lottie emoji",
        price: 100,
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

    // Individual Premium Stickers
    {
        name: "Doge Wow Sticker",
        description: "Such wow! Much sticker! Premium Doge meme sticker",
        price: 75,
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

    // Emoji Packs
    {
        name: "Crypto Emoji Pack",
        description: "Essential crypto emojis: Diamond Hands + future crypto emojis",
        price: 180, // Slight discount vs buying individually
        pointsPrice: 1800,
        stockLimit: null,
        status: 'published',
        pluginReward: {
            type: 'emojiPack',
            value: {
                // Legacy format for compatibility
                diamond_hands: '/emojis/diamond_hands.json',
                // Future crypto emojis would go here
            },
            emojiUnlocks: ['diamond_hands'], // New format
            name: 'Crypto Emoji Pack',
            description: 'Unlocks premium crypto-themed emojis for trading discussions'
        },
        metadata: {
            category: 'emojis',
            rarity: 'premium',
            tags: ['crypto', 'pack', 'premium']
        }
    },
    {
        name: "Meme Emoji Pack",
        description: "Essential meme emojis for maximum degeneracy",
        price: 90,
        pointsPrice: 900,
        stockLimit: null,
        status: 'published',
        pluginReward: {
            type: 'emojiPack',
            value: {
                pepe_dance: '/emojis/pepe_dance.gif',
            },
            emojiUnlocks: ['pepe_dance'],
            name: 'Meme Emoji Pack',
            description: 'Unlocks premium meme emojis for maximum expression'
        },
        metadata: {
            category: 'emojis',
            rarity: 'premium',
            tags: ['memes', 'pack', 'pepe']
        }
    },

    // Sticker Packs
    {
        name: "Reaction Sticker Pack",
        description: "Essential reaction stickers for posts and messages",
        price: 120,
        pointsPrice: 1200,
        stockLimit: null,
        status: 'published',
        pluginReward: {
            type: 'stickerPack',
            value: {
                doge_wow: '/stickers/doge_wow.webp',
            },
            stickerUnlocks: ['doge_wow'],
            name: 'Reaction Sticker Pack',
            description: 'Unlocks premium reaction stickers for posts'
        },
        metadata: {
            category: 'stickers',
            rarity: 'premium',
            tags: ['reactions', 'pack', 'premium']
        }
    },
    {
        name: "Crypto Sticker Pack",
        description: "Premium crypto-themed stickers for moon missions",
        price: 200,
        pointsPrice: 2000,
        stockLimit: null,
        status: 'published',
        pluginReward: {
            type: 'stickerPack',
            value: {
                moon_rocket: '/stickers/moon_rocket.json',
            },
            stickerUnlocks: ['moon_rocket'],
            name: 'Crypto Sticker Pack',
            description: 'Unlocks premium crypto stickers for trading posts'
        },
        metadata: {
            category: 'stickers',
            rarity: 'premium',
            tags: ['crypto', 'pack', 'animated']
        }
    },

    // Bundle Deals
    {
        name: "Ultimate Expression Bundle",
        description: "Complete emoji + sticker collection for maximum expression",
        price: 450, // Significant discount vs buying separately
        pointsPrice: 4500,
        stockLimit: 100, // Limited availability
        status: 'published',
        pluginReward: {
            type: 'emojiPack', // Handles both emojis and stickers
            value: {
                diamond_hands: '/emojis/diamond_hands.json',
                pepe_dance: '/emojis/pepe_dance.gif',
                doge_wow: '/stickers/doge_wow.webp',
                moon_rocket: '/stickers/moon_rocket.json',
            },
            emojiUnlocks: ['diamond_hands', 'pepe_dance'],
            stickerUnlocks: ['doge_wow', 'moon_rocket'],
            name: 'Ultimate Expression Bundle',
            description: 'Unlocks ALL premium emojis and stickers in one package'
        },
        metadata: {
            category: 'mixed',
            rarity: 'legendary',
            tags: ['bundle', 'premium', 'discount', 'complete']
        }
    },

    // Limited/Seasonal Items
    {
        name: "Golden Pepe (Limited)",
        description: "Rare animated golden Pepe emoji - limited availability!",
        price: 500,
        stockLimit: 50, // Very limited
        status: 'published',
        pluginReward: {
            type: 'individualEmoji',
            emojiUnlocks: ['golden_pepe'],
            name: 'Golden Pepe',
            description: 'Unlocks the rare Golden Pepe emoji (Limited Edition)'
        },
        metadata: {
            category: 'emojis',
            rarity: 'legendary',
            tags: ['rare', 'limited', 'golden', 'pepe', 'exclusive']
        }
    }
];

// Helper function to seed emoji/sticker shop items
export async function seedEmojiStickerShopItems(db: any) {
    console.log('😎 Seeding emoji & sticker shop items...');

    let successCount = 0;
    let errorCount = 0;

    for (const product of EMOJI_STICKER_SHOP_PRODUCTS) {
        try {
            await db.insert('products').values({
                name: product.name,
                description: product.description,
                price: product.price,
                pointsPrice: product.pointsPrice,
                stockLimit: product.stockLimit,
                status: product.status,
                pluginReward: JSON.stringify(product.pluginReward),
                metadata: JSON.stringify(product.metadata),
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log(`✅ Created: ${product.name} (${product.metadata.rarity})`);
            successCount++;
        } catch (error: any) {
            console.error(`❌ Failed to create ${product.name}:`, error.message);
            errorCount++;
        }
    }

    console.log('\n📊 Emoji/Sticker Shop Seeding Summary:');
    console.log(`✅ Successfully created: ${successCount} products`);
    console.log(`❌ Failed: ${errorCount} products`);
    console.log(`📦 Total processed: ${EMOJI_STICKER_SHOP_PRODUCTS.length} products`);

    if (successCount > 0) {
        console.log('\n😎 Emoji & sticker shop items are now available!');
        console.log('💡 Users can purchase these from /shop to unlock premium emojis and stickers');
        console.log('🎯 Items unlock based on cosmetics.config.ts definitions');
    }
} 