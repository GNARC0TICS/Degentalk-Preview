import { z } from 'zod';
import { ItemIdSchema, UserIdSchema } from '../shared/branded-ids';

/**
 * Shop Item Schema
 */
export const ShopItemSchema = z.object({
  id: ItemIdSchema,
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  category: z.string(),
  icon: z.string().optional(),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']).optional(),
  quantity: z.number().optional(),
  metadata: z.record(z.unknown()).optional()
});

export type ShopItem = z.infer<typeof ShopItemSchema>;

/**
 * Shop Ownership Check Response
 */
export const ShopOwnershipResponseSchema = z.object({
  owned: z.boolean(),
  items: z.array(ShopItemSchema).default([]),
  groupedItems: z.record(z.array(ShopItemSchema)).default({})
});

export type ShopOwnershipResponse = z.infer<typeof ShopOwnershipResponseSchema>;

/**
 * User Inventory Response
 */
export const UserInventoryResponseSchema = z.object({
  items: z.array(
    z.object({
      id: ItemIdSchema,
      userId: UserIdSchema,
      itemId: ItemIdSchema,
      quantity: z.number(),
      purchasedAt: z.string(),
      item: ShopItemSchema.optional()
    })
  ),
  groupedItems: z.record(
    z.array(
      z.object({
        itemId: ItemIdSchema,
        quantity: z.number(),
        item: ShopItemSchema
      })
    )
  ).optional(),
  totalValue: z.number().optional()
});

export type UserInventoryResponse = z.infer<typeof UserInventoryResponseSchema>;

/**
 * Purchase Response
 */
export const PurchaseResponseSchema = z.object({
  success: z.boolean(),
  transactionId: z.string(),
  item: ShopItemSchema,
  newBalance: z.number().optional(),
  message: z.string().optional()
});

export type PurchaseResponse = z.infer<typeof PurchaseResponseSchema>;