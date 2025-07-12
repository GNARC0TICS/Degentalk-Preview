import { z } from 'zod';

/**
 * Shop Validation Schemas
 * 
 * Zod schemas for validating shop and commerce requests
 */

// Shop items listing validation
export const getShopItemsValidation = z.object({
  query: z.object({
    category: z.string().optional(),
    sort: z.enum(['popular', 'price_low', 'price_high', 'newest', 'rarity']).default('popular'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  })
});

// Single shop item validation
export const getShopItemValidation = z.object({
  params: z.object({
    id: z.string().min(1, 'Item ID is required')
  })
});

// Purchase validation schema (financial - critical security)
export const purchaseItemValidation = z.object({
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    paymentMethod: z.enum(['DGT', 'USDT'], {
      errorMap: () => ({ message: 'Payment method must be DGT or USDT' })
    }),
    // Optional fields for purchase metadata
    quantity: z.number().int().min(1).max(10).default(1).optional(),
    giftRecipient: z.string().uuid().optional() // For gifting items
  })
});

// User inventory validation
export const getUserInventoryValidation = z.object({
  query: z.object({
    category: z.string().optional(),
    equipped: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  })
});

// Item equip/unequip validation
export const equipItemValidation = z.object({
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    equipped: z.boolean()
  })
});

// Item use/consume validation
export const useItemValidation = z.object({
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    quantity: z.number().int().min(1).max(10).default(1).optional()
  })
});

// Trade validation (if trading is implemented)
export const tradeItemValidation = z.object({
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    recipientUserId: z.string().uuid('Invalid recipient user ID'),
    requestedItemId: z.string().optional(), // For item-for-item trades
    requestedAmount: z.number().positive().optional() // For item-for-currency trades
  })
});

// Gift item validation
export const giftItemValidation = z.object({
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    recipientUserId: z.string().uuid('Invalid recipient user ID'),
    message: z.string().max(200).optional()
  })
});

// Shop admin validation (for admin routes)
export const createShopItemValidation = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500),
    category: z.string().min(1),
    rarity: z.enum(['common', 'rare', 'epic', 'legendary', 'mythic']),
    priceDGT: z.number().positive().optional(),
    priceUSDT: z.number().positive().optional(),
    imageUrl: z.string().url().optional(),
    isActive: z.boolean().default(true),
    maxQuantity: z.number().int().positive().optional()
  }).refine(data => data.priceDGT || data.priceUSDT, {
    message: 'Item must have at least one price (DGT or USDT)'
  })
});

// Cosmetics validation schemas
export const browseCosmeticsValidation = z.object({
  query: z.object({
    type: z.string().optional(),
    rarity: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  })
});

export const equipCosmeticValidation = z.object({
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    action: z.enum(['equip', 'unequip'], {
      errorMap: () => ({ message: 'Action must be either equip or unequip' })
    })
  })
});

export const customizeCosmeticValidation = z.object({
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    customizations: z.record(z.any()),
    dgtCost: z.number().min(0).optional()
  })
});

export const previewCosmeticsValidation = z.object({
  params: z.object({
    itemIds: z.string().min(1, 'Item IDs are required')
  })
});

// Export for route usage
export const shopValidation = {
  getShopItems: getShopItemsValidation,
  getShopItem: getShopItemValidation,
  purchaseItem: purchaseItemValidation,
  getUserInventory: getUserInventoryValidation,
  equipItem: equipItemValidation,
  useItem: useItemValidation,
  tradeItem: tradeItemValidation,
  giftItem: giftItemValidation,
  createShopItem: createShopItemValidation,
  // Cosmetics validations
  browseCosmetics: browseCosmeticsValidation,
  equipCosmetic: equipCosmeticValidation,
  customizeCosmetic: customizeCosmeticValidation,
  previewCosmetics: previewCosmeticsValidation
};