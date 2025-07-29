import * as z from 'zod';
export const baseTitleSchema = z.object({
    name: z.string().min(1, 'Title name is required').max(100),
    description: z.string().optional().nullable(),
    iconUrl: z.string().url().optional().nullable(),
    rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']).default('common'),
    // Enhanced title customization fields
    emoji: z.string().optional().nullable(),
    fontFamily: z.string().optional().nullable(),
    fontSize: z.number().optional().nullable(),
    fontWeight: z
        .enum([
        'normal',
        'bold',
        'bolder',
        '100',
        '200',
        '300',
        '400',
        '500',
        '600',
        '700',
        '800',
        '900'
    ])
        .optional()
        .nullable(),
    textColor: z.string().optional().nullable(),
    backgroundColor: z.string().optional().nullable(),
    borderColor: z.string().optional().nullable(),
    borderWidth: z.number().optional().nullable(),
    borderStyle: z
        .enum(['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset'])
        .optional()
        .nullable(),
    borderRadius: z.number().optional().nullable(),
    glowColor: z.string().optional().nullable(),
    glowIntensity: z.number().min(0).max(100).optional().nullable(),
    shadowColor: z.string().optional().nullable(),
    shadowBlur: z.number().optional().nullable(),
    shadowOffsetX: z.number().optional().nullable(),
    shadowOffsetY: z.number().optional().nullable(),
    gradientStart: z.string().optional().nullable(),
    gradientEnd: z.string().optional().nullable(),
    gradientDirection: z
        .enum([
        'to-right',
        'to-left',
        'to-top',
        'to-bottom',
        'to-top-right',
        'to-top-left',
        'to-bottom-right',
        'to-bottom-left'
    ])
        .optional()
        .nullable(),
    animation: z.enum(['none', 'pulse', 'bounce', 'shake', 'glow', 'rainbow']).optional().nullable(),
    animationDuration: z.number().optional().nullable(),
    // Role binding
    roleId: z.string().optional().nullable(),
    // Metadata
    isShopItem: z.boolean().default(false),
    isUnlockable: z.boolean().default(false),
    unlockConditions: z.record(z.any()).optional().nullable(),
    shopPrice: z.number().optional().nullable(),
    shopCurrency: z.enum(['DGT', 'XP', 'USD']).optional().nullable()
});
export const createTitleSchema = baseTitleSchema;
export const updateTitleSchema = baseTitleSchema.partial();
