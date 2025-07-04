/**
 * Cosmetics Routes
 * 
 * Enhanced cosmetics management with equipment tracking and vanity analytics
 * Showcases CosmeticsTransformer for role-based cosmetic data exposure
 */

import { Router } from 'express';
import { userService } from '@server/src/core/services/user.service';
import { isAuthenticated } from '../auth/middleware/auth.middleware';
import { logger } from '../../core/logger';
import { db } from '@db';
import { userInventory, transactions } from '@schema';
import { eq, and, inArray } from 'drizzle-orm';
import { CosmeticsTransformer } from './transformers/cosmetics.transformer';
import { vanitySinkAnalyzer } from './services/vanity-sink.analyzer';
import { z } from 'zod';
import type { UserId, ItemId } from '@shared/types';

const router = Router();

// Validation schemas
const equipCosmeticSchema = z.object({
  itemId: z.string(),
  action: z.enum(['equip', 'unequip'])
});

const customizeCosmeticSchema = z.object({
  itemId: z.string(),
  customizations: z.record(z.any()),
  dgtCost: z.number().min(0).optional()
});

/**
 * GET /api/cosmetics/browse
 * Browse available cosmetics with enhanced social proof
 */
router.get('/browse', async (req, res) => {
  try {
    const { type, rarity, page = 1, limit = 20 } = req.query;
    const requestingUser = userService.getUserFromRequest(req);

    // Mock cosmetics data (in real implementation, this would come from database)
    const cosmetics = [
      {
        id: 'cosmic_frame_001',
        name: 'Cosmic Nebula Frame',
        description: 'A shimmering frame with cosmic particle effects',
        type: 'avatar_frame',
        rarity: 'legendary',
        colorHex: '#4338ca',
        effectType: 'particle',
        isAnimated: true,
        isLimited: true,
        popularityScore: 85,
        equippedByCount: 1247,
        tags: ['cosmic', 'particles', 'premium'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        createdBy: 'admin'
      },
      {
        id: 'golden_username_001',
        name: 'Golden Radiance',
        description: 'Luxurious golden username color with subtle glow',
        type: 'username_color',
        rarity: 'epic',
        colorHex: '#fbbf24',
        effectType: 'glow',
        isAnimated: false,
        isLimited: false,
        popularityScore: 92,
        equippedByCount: 3421,
        tags: ['gold', 'luxury', 'glow'],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        createdBy: 'admin'
      },
      {
        id: 'degen_champion_title',
        name: 'Degen Champion',
        description: 'Exclusive title for top community contributors',
        type: 'title',
        rarity: 'mythic',
        colorHex: '#ef4444',
        effectType: 'glow',
        isAnimated: false,
        isLimited: true,
        popularityScore: 98,
        equippedByCount: 127,
        tags: ['exclusive', 'champion', 'limited'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        createdBy: 'admin'
      }
    ];

    // Filter cosmetics
    let filteredCosmetics = cosmetics;
    
    if (type && type !== 'all') {
      filteredCosmetics = filteredCosmetics.filter(c => c.type === type);
    }
    
    if (rarity && rarity !== 'all') {
      filteredCosmetics = filteredCosmetics.filter(c => c.rarity === rarity);
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedCosmetics = filteredCosmetics.slice(startIndex, endIndex);

    // Transform cosmetics based on user authentication
    let transformedCosmetics;
    if (requestingUser) {
      // Get user inventory for ownership checking
      const userInventoryData = await db
        .select()
        .from(userInventory)
        .where(eq(userInventory.userId, requestingUser.id));

      transformedCosmetics = paginatedCosmetics.map(cosmetic => 
        CosmeticsTransformer.toOwnedCosmetic(cosmetic, requestingUser, userInventoryData)
      );
    } else {
      transformedCosmetics = paginatedCosmetics.map(cosmetic => 
        CosmeticsTransformer.toPublicCosmetic(cosmetic)
      );
    }

    res.json({
      cosmetics: transformedCosmetics,
      total: filteredCosmetics.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filteredCosmetics.length / limitNum),
      filters: {
        type: type || 'all',
        rarity: rarity || 'all'
      },
      user: requestingUser ? {
        isAuthenticated: true,
        equippedCosmetics: CosmeticsTransformer.getUserEquippedCosmetics(
          await db.select().from(userInventory).where(and(
            eq(userInventory.userId, requestingUser.id),
            eq(userInventory.isEquipped, true)
          ))
        )
      } : { isAuthenticated: false }
    });

  } catch (error) {
    logger.error('CosmeticsController', 'Error browsing cosmetics', { error });
    res.status(500).json({ error: 'Failed to browse cosmetics' });
  }
});

/**
 * GET /api/cosmetics/equipped
 * Get user's currently equipped cosmetics
 */
router.get('/equipped', isAuthenticated, async (req, res) => {
  try {
    const requestingUser = userService.getUserFromRequest(req);
    if (!requestingUser?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get equipped cosmetics
    const equippedItems = await db
      .select()
      .from(userInventory)
      .where(and(
        eq(userInventory.userId, requestingUser.id),
        eq(userInventory.isEquipped, true)
      ));

    // Group by cosmetic type
    const equippedCosmetics = CosmeticsTransformer.getUserEquippedCosmetics(equippedItems);

    // Get cosmetic details for each equipped item (mock data for now)
    const cosmeticsWithDetails = Object.entries(equippedCosmetics).map(([type, item]) => ({
      type,
      itemId: item.itemId,
      name: item.name || 'Unknown Item',
      equippedAt: item.equippedAt,
      customizations: item.customizations || {}
    }));

    res.json({
      equippedCosmetics: cosmeticsWithDetails,
      totalEquipped: cosmeticsWithDetails.length,
      availableSlots: {
        avatar_frame: !equippedCosmetics.avatar_frame,
        username_color: !equippedCosmetics.username_color,
        title: !equippedCosmetics.title,
        badge: !equippedCosmetics.badge,
        signature_effect: !equippedCosmetics.signature_effect,
        theme: !equippedCosmetics.theme
      }
    });

  } catch (error) {
    logger.error('CosmeticsController', 'Error getting equipped cosmetics', {
      error,
      userId: userService.getUserFromRequest(req)?.id
    });
    res.status(500).json({ error: 'Failed to get equipped cosmetics' });
  }
});

/**
 * POST /api/cosmetics/equip
 * Equip or unequip a cosmetic item
 */
router.post('/equip', isAuthenticated, async (req, res) => {
  try {
    const requestingUser = userService.getUserFromRequest(req);
    if (!requestingUser?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { itemId, action } = equipCosmeticSchema.parse(req.body);
    const userId = requestingUser.id;

    // Verify user owns the item
    const ownedItem = await db
      .select()
      .from(userInventory)
      .where(and(
        eq(userInventory.userId, userId),
        eq(userInventory.itemId, itemId)
      ))
      .limit(1);

    if (ownedItem.length === 0) {
      return res.status(400).json({ error: 'You do not own this cosmetic item' });
    }

    const inventoryItem = ownedItem[0];

    if (action === 'equip') {
      // Check if already equipped
      if (inventoryItem.isEquipped) {
        return res.status(400).json({ error: 'Item is already equipped' });
      }

      // Get user's current inventory for conflict checking
      const userInventoryData = await db
        .select()
        .from(userInventory)
        .where(eq(userInventory.userId, userId));

      // Mock cosmetic data for validation
      const cosmeticData = {
        id: itemId,
        type: inventoryItem.itemType || 'badge',
        name: inventoryItem.itemId // Simplified
      };

      // Validate equipment change
      const validation = CosmeticsTransformer.validateEquipmentChange(cosmeticData, userInventoryData);
      
      if (!validation.canEquip) {
        return res.status(400).json({ 
          error: 'Cannot equip this item',
          reason: validation.reason,
          conflicts: validation.conflicts
        });
      }

      // Unequip conflicting items first
      if (validation.conflicts.length > 0) {
        await db
          .update(userInventory)
          .set({ isEquipped: false, equippedAt: null })
          .where(and(
            eq(userInventory.userId, userId),
            inArray(userInventory.itemId, validation.conflicts)
          ));
      }

      // Equip the item
      await db
        .update(userInventory)
        .set({ isEquipped: true, equippedAt: new Date() })
        .where(and(
          eq(userInventory.userId, userId),
          eq(userInventory.itemId, itemId)
        ));

      logger.info('CosmeticsController', 'Cosmetic equipped', {
        userId,
        itemId,
        conflicts: validation.conflicts
      });

      res.json({
        success: true,
        message: 'Cosmetic equipped successfully',
        itemId,
        action: 'equipped',
        unequippedConflicts: validation.conflicts
      });

    } else { // unequip
      if (!inventoryItem.isEquipped) {
        return res.status(400).json({ error: 'Item is not currently equipped' });
      }

      // Unequip the item
      await db
        .update(userInventory)
        .set({ isEquipped: false, equippedAt: null })
        .where(and(
          eq(userInventory.userId, userId),
          eq(userInventory.itemId, itemId)
        ));

      logger.info('CosmeticsController', 'Cosmetic unequipped', {
        userId,
        itemId
      });

      res.json({
        success: true,
        message: 'Cosmetic unequipped successfully',
        itemId,
        action: 'unequipped'
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: error.errors 
      });
    }

    logger.error('CosmeticsController', 'Error equipping/unequipping cosmetic', {
      error,
      userId: userService.getUserFromRequest(req)?.id
    });
    res.status(500).json({ error: 'Failed to update cosmetic equipment' });
  }
});

/**
 * POST /api/cosmetics/customize
 * Customize a cosmetic item (may cost DGT for premium customizations)
 */
router.post('/customize', isAuthenticated, async (req, res) => {
  try {
    const requestingUser = userService.getUserFromRequest(req);
    if (!requestingUser?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { itemId, customizations, dgtCost } = customizeCosmeticSchema.parse(req.body);
    const userId = requestingUser.id;

    // Verify user owns the item
    const ownedItem = await db
      .select()
      .from(userInventory)
      .where(and(
        eq(userInventory.userId, userId),
        eq(userInventory.itemId, itemId)
      ))
      .limit(1);

    if (ownedItem.length === 0) {
      return res.status(400).json({ error: 'You do not own this cosmetic item' });
    }

    // Handle DGT cost for premium customizations
    if (dgtCost && dgtCost > 0) {
      // Track as vanity sink event
      await vanitySinkAnalyzer.trackCosmeticUpgrade({
        userId: userId as UserId,
        itemId: itemId as ItemId,
        dgtAmount: dgtCost as any,
        upgradeType: 'color_change', // This would be determined by customizations
        metadata: {
          customizations,
          originalItemType: ownedItem[0].itemType
        }
      });
    }

    // Update item customizations
    await db
      .update(userInventory)
      .set({ 
        customizations: customizations,
        updatedAt: new Date()
      })
      .where(and(
        eq(userInventory.userId, userId),
        eq(userInventory.itemId, itemId)
      ));

    logger.info('CosmeticsController', 'Cosmetic customized', {
      userId,
      itemId,
      dgtCost,
      customizations: Object.keys(customizations)
    });

    res.json({
      success: true,
      message: 'Cosmetic customized successfully',
      itemId,
      customizations,
      dgtCost: dgtCost || 0,
      vanityMetrics: dgtCost ? {
        dgtBurned: dgtCost,
        burnType: 'customization',
        contributesToDeflation: true
      } : undefined
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: error.errors 
      });
    }

    logger.error('CosmeticsController', 'Error customizing cosmetic', {
      error,
      userId: userService.getUserFromRequest(req)?.id
    });
    res.status(500).json({ error: 'Failed to customize cosmetic' });
  }
});

/**
 * GET /api/cosmetics/preview/:itemIds
 * Generate equipment preview with multiple cosmetics
 */
router.get('/preview/:itemIds', async (req, res) => {
  try {
    const { itemIds } = req.params;
    const requestingUser = userService.getUserFromRequest(req);

    if (!itemIds) {
      return res.status(400).json({ error: 'Item IDs required' });
    }

    const itemIdArray = itemIds.split(',');

    // Mock cosmetic data for preview generation
    const mockCosmetics = itemIdArray.map(id => ({
      id,
      name: `Item ${id}`,
      type: 'badge', // This would be looked up from database
      previewUrl: `/api/cosmetics/preview/item/${id}`
    }));

    // Generate composite preview
    const preview = CosmeticsTransformer.generateEquipmentPreview(
      mockCosmetics[0], // Target cosmetic
      mockCosmetics.slice(1) // Current equipment
    );

    res.json({
      previewUrl: preview.previewUrl,
      equipmentSet: preview.equipmentSet,
      user: requestingUser ? {
        isAuthenticated: true,
        canPreview: true
      } : { isAuthenticated: false, canPreview: true }
    });

  } catch (error) {
    logger.error('CosmeticsController', 'Error generating cosmetic preview', {
      error,
      itemIds: req.params.itemIds
    });
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

/**
 * GET /api/cosmetics/analytics
 * Get cosmetics usage analytics (admin only)
 */
router.get('/analytics', isAuthenticated, async (req, res) => {
  try {
    const requestingUser = userService.getUserFromRequest(req);
    
    // Basic role check (in real implementation, this would be more sophisticated)
    if (requestingUser?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get real-time vanity sink metrics
    const vanitySinkMetrics = await vanitySinkAnalyzer.getRealTimeMetrics();

    // Mock additional cosmetics analytics
    const cosmeticsAnalytics = {
      totalCosmetics: 156,
      totalOwned: 2847,
      totalEquipped: 1923,
      averageEquipmentRate: 67.5,
      topCategories: [
        { category: 'avatar_frame', popularity: 89, equipped: 1247 },
        { category: 'username_color', popularity: 92, equipped: 887 },
        { category: 'title', popularity: 78, equipped: 234 },
        { category: 'badge', popularity: 85, equipped: 445 }
      ],
      recentTrends: {
        equipmentGrowth: 12.3, // % increase in equipment rate
        newOwnersGrowth: 8.7,   // % increase in cosmetic owners
        customizationRevenue: 15420 // DGT spent on customizations
      }
    };

    res.json({
      vanitySink: vanitySinkMetrics,
      cosmetics: cosmeticsAnalytics,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    logger.error('CosmeticsController', 'Error getting cosmetics analytics', {
      error,
      userId: userService.getUserFromRequest(req)?.id
    });
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

export default router;