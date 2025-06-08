// ... (existing XpRewardsSchema, XpProgressionSchema, DgtConfigSchema)

// -------------------- Shop Section --------------------
/**
 * DGT packages available for purchase.
 */
export const DgtPackageSchema = z.object({
    /** Unique ID for the package */
    id: z.string(),
    /** Display name of the package */
    name: z.string(),
    /** Amount of DGT in this package */
    dgtAmount: z.number().positive(),
    /** Price in USD */
    usdPrice: z.number().positive(),
    /** Optional discount percentage */
    discountPercentage: z.number().min(0).max(100).optional(),
    /** Icon or image for the package (optional) */
    icon: z.string().optional(),
    /** Is this package featured? (optional) */
    isFeatured: z.boolean().optional(),
});
export type DgtPackage = z.infer<typeof DgtPackageSchema>;

/**
 * Shop item prices and vanity item costs.
 */
export const ShopConfigSchema = z.object({
    /** Vanity item prices by type */
    vanityItemPrices: z.record(z.string(), z.number()),
    /** DGT packages */
    dgtPackages: z.array(DgtPackageSchema),
});

// ... (existing TipRainConfigSchema)

// -------------------- Main Economy Config --------------------
// ... (existing EconomyConfigSchema, ensure shop: ShopConfigSchema is updated)

/**
 * Default economy config reflecting current hardcoded values.
 */
export const economyConfig = {
    // ... (existing xp, progression, dgt sections)
    shop: {
        vanityItemPrices: {
            animatedFlair: 500,
            signatureFont: 250,
            // TODO: Add more from shop UI/config
        },
        dgtPackages: [
            {
                id: 'starter',
                name: 'Starter Pack',
                dgtAmount: 100,
                usdPrice: 9.99,
                icon: '💎',
            },
            {
                id: 'degen_special',
                name: 'Degen Special',
                dgtAmount: 500,
                usdPrice: 44.99,
                discountPercentage: 10,
                icon: '✨',
                isFeatured: true,
            },
            {
                id: 'whale_kit',
                name: 'Whale Kit',
                dgtAmount: 1500,
                usdPrice: 119.99,
                discountPercentage: 20,
                icon: '🚀',
            },
            {
                id: 'giga_chad_stash',
                name: 'Giga Chad Stash',
                dgtAmount: 5000,
                usdPrice: 374.99,
                discountPercentage: 25,
                icon: '👑',
                isFeatured: true,
            },
        ],
    },
    // ... (existing tipRain section)
} as const; 