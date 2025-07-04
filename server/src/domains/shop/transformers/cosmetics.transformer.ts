/**
 * Cosmetics Transformer
 * 
 * Specialized transformer for cosmetic items with equipment tracking
 * Handles avatar frames, username colors, titles, badges, effects, and themes
 * Follows security-first pattern with role-based data exposure
 */

import type {
  PublicCosmetic,
  OwnedCosmetic,
  AdminCosmetic
} from '../types';

import type { 
  UserId, 
  ItemId,
  DgtAmount, 
  ItemRarity
} from '@shared/types';

import { ShopTransformer } from './shop.transformer';

export class CosmeticsTransformer {
  
  // ==========================================
  // COSMETIC ITEM TRANSFORMERS
  // ==========================================

  /**
   * Transform cosmetic for public view (browsing, social proof)
   * Shows basic cosmetic info without user-specific data
   */
  static toPublicCosmetic(dbCosmetic: any): PublicCosmetic {
    return {
      id: dbCosmetic.id as ItemId,
      name: dbCosmetic.name,
      description: dbCosmetic.description || '',
      type: this.normalizeCosmeticType(dbCosmetic.type),
      rarity: dbCosmetic.rarity as ItemRarity,
      
      // Visual data
      previewUrl: this.generatePreviewUrl(dbCosmetic),
      thumbnailUrl: this.generateThumbnailUrl(dbCosmetic),
      colorHex: dbCosmetic.colorHex || this.extractColorFromMetadata(dbCosmetic),
      effectType: this.determineEffectType(dbCosmetic),
      
      // Metadata
      tags: dbCosmetic.tags || [],
      isAnimated: this.isAnimatedCosmetic(dbCosmetic),
      isLimited: dbCosmetic.isLimited === true,
      
      // Social proof metrics
      popularityScore: this.calculateCosmeticPopularity(dbCosmetic),
      equippedByCount: dbCosmetic.equippedByCount || 0
    };
  }

  /**
   * Transform cosmetic for owned view (equipment management)
   * Adds ownership status and equipment permissions
   */
  static toOwnedCosmetic(dbCosmetic: any, requestingUser: any, userInventory?: any[]): OwnedCosmetic {
    const publicData = this.toPublicCosmetic(dbCosmetic);
    
    // Check user ownership and equipment status
    const inventoryItem = this.findUserInventoryItem(dbCosmetic.id, userInventory);
    const isOwned = !!inventoryItem;
    const isEquipped = inventoryItem?.isEquipped === true;
    
    return {
      ...publicData,
      
      // Ownership status
      isOwned,
      isEquipped,
      acquiredAt: inventoryItem?.acquiredAt,
      
      // Equipment permissions
      canEquip: this.canUserEquipCosmetic(dbCosmetic, requestingUser, inventoryItem),
      canUnequip: this.canUserUnequipCosmetic(dbCosmetic, requestingUser, inventoryItem),
      conflictsWith: this.getCosmeticConflicts(dbCosmetic, userInventory),
      
      // Purchase info (if not owned)
      shopItemId: isOwned ? undefined : this.getShopItemId(dbCosmetic),
      price: isOwned ? undefined : this.getCosmeticPrice(dbCosmetic),
      canAfford: isOwned ? undefined : this.canUserAffordCosmetic(dbCosmetic, requestingUser),
      
      // Customization options
      customizations: this.getCosmeticCustomizations(dbCosmetic, requestingUser)
    };
  }

  /**
   * Transform cosmetic for admin view
   * Includes comprehensive analytics and management data
   */
  static toAdminCosmetic(dbCosmetic: any, analytics?: any): AdminCosmetic {
    // Get owned data with admin permissions
    const ownedData = this.toOwnedCosmetic(dbCosmetic, { role: 'admin', id: 'admin' });
    
    return {
      ...ownedData,
      
      // Usage analytics
      totalOwners: analytics?.totalOwners || 0,
      totalEquipped: analytics?.totalEquipped || 0,
      equipmentRate: this.calculateEquipmentRate(analytics),
      
      // Revenue data
      totalRevenue: this.sanitizeDgtAmount(analytics?.totalRevenue || 0),
      totalSales: analytics?.totalSales || 0,
      averageSalePrice: this.calculateAverageSalePrice(analytics),
      
      // Content management
      createdAt: dbCosmetic.createdAt.toISOString(),
      updatedAt: dbCosmetic.updatedAt.toISOString(),
      createdBy: dbCosmetic.createdBy as UserId,
      
      // File management
      assetUrl: dbCosmetic.assetUrl || '',
      assetSize: dbCosmetic.assetSize || 0,
      assetType: dbCosmetic.assetType || 'image/png',
      
      // Status
      isActive: dbCosmetic.isActive !== false,
      moderationStatus: dbCosmetic.moderationStatus || 'approved',
      
      // Performance metrics
      engagementScore: this.calculateEngagementScore(analytics),
      retentionRate: this.calculateRetentionRate(analytics),
      
      // System data
      version: dbCosmetic.version || 1,
      compatibilityFlags: dbCosmetic.compatibilityFlags || []
    };
  }

  // ==========================================
  // COSMETIC-SPECIFIC UTILITY METHODS
  // ==========================================

  private static normalizeCosmeticType(type: string): 'avatar_frame' | 'username_color' | 'title' | 'badge' | 'signature_effect' | 'emoji_pack' | 'theme' {
    const typeMap = {
      'frame': 'avatar_frame',
      'avatar_frame': 'avatar_frame',
      'color': 'username_color',
      'username_color': 'username_color',
      'title': 'title',
      'badge': 'badge',
      'effect': 'signature_effect',
      'signature_effect': 'signature_effect',
      'emoji': 'emoji_pack',
      'emoji_pack': 'emoji_pack',
      'theme': 'theme'
    };
    return typeMap[type as keyof typeof typeMap] || 'badge';
  }

  private static generatePreviewUrl(dbCosmetic: any): string {
    // Generate preview URLs based on cosmetic type
    const baseUrl = '/api/cosmetics/preview';
    const type = this.normalizeCosmeticType(dbCosmetic.type);
    
    switch (type) {
      case 'avatar_frame':
        return `${baseUrl}/frame/${dbCosmetic.id}`;
      case 'username_color':
        return `${baseUrl}/color/${dbCosmetic.id}`;
      case 'title':
        return `${baseUrl}/title/${dbCosmetic.id}`;
      case 'badge':
        return `${baseUrl}/badge/${dbCosmetic.id}`;
      case 'signature_effect':
        return `${baseUrl}/signature/${dbCosmetic.id}`;
      case 'emoji_pack':
        return `${baseUrl}/emoji/${dbCosmetic.id}`;
      case 'theme':
        return `${baseUrl}/theme/${dbCosmetic.id}`;
      default:
        return `${baseUrl}/generic/${dbCosmetic.id}`;
    }
  }

  private static generateThumbnailUrl(dbCosmetic: any): string | undefined {
    if (!dbCosmetic.thumbnailUrl && !dbCosmetic.id) return undefined;
    return dbCosmetic.thumbnailUrl || `/api/cosmetics/thumbnail/${dbCosmetic.id}`;
  }

  private static extractColorFromMetadata(dbCosmetic: any): string | undefined {
    // Extract primary color from cosmetic metadata
    if (dbCosmetic.metadata?.primaryColor) return dbCosmetic.metadata.primaryColor;
    if (dbCosmetic.metadata?.colors?.primary) return dbCosmetic.metadata.colors.primary;
    
    // Type-specific color extraction
    const type = this.normalizeCosmeticType(dbCosmetic.type);
    if (type === 'username_color' && dbCosmetic.metadata?.hex) {
      return dbCosmetic.metadata.hex;
    }
    
    return undefined;
  }

  private static determineEffectType(dbCosmetic: any): 'glow' | 'particle' | 'animation' | 'gradient' | undefined {
    if (dbCosmetic.effectType) return dbCosmetic.effectType;
    
    // Infer from metadata
    if (dbCosmetic.metadata?.hasGlow) return 'glow';
    if (dbCosmetic.metadata?.hasParticles) return 'particle';
    if (dbCosmetic.metadata?.isAnimated) return 'animation';
    if (dbCosmetic.metadata?.hasGradient) return 'gradient';
    
    // Infer from cosmetic type
    const type = this.normalizeCosmeticType(dbCosmetic.type);
    if (type === 'signature_effect') return 'particle';
    if (type === 'avatar_frame' && dbCosmetic.rarity !== 'common') return 'glow';
    
    return undefined;
  }

  private static isAnimatedCosmetic(dbCosmetic: any): boolean {
    if (dbCosmetic.isAnimated !== undefined) return dbCosmetic.isAnimated;
    if (dbCosmetic.metadata?.isAnimated) return true;
    if (dbCosmetic.assetType?.includes('gif')) return true;
    if (dbCosmetic.effectType === 'animation') return true;
    return false;
  }

  private static calculateCosmeticPopularity(dbCosmetic: any): number {
    // Different weighting for cosmetics vs general shop items
    const equipped = dbCosmetic.equippedByCount || 0;
    const owned = dbCosmetic.ownedByCount || 0;
    const views = dbCosmetic.viewCount || 0;
    
    // Cosmetics are about being equipped and shown off
    const equipScore = Math.min(equipped / 100, 0.5) * 100;
    const ownedScore = Math.min(owned / 200, 0.3) * 100;
    const viewScore = Math.min(views / 1000, 0.2) * 100;
    
    return Math.round(equipScore + ownedScore + viewScore);
  }

  private static findUserInventoryItem(cosmeticId: any, userInventory?: any[]): any | undefined {
    if (!userInventory) return undefined;
    return userInventory.find(item => item.itemId === cosmeticId);
  }

  private static canUserEquipCosmetic(dbCosmetic: any, user: any, inventoryItem?: any): boolean {
    // Must own the cosmetic
    if (!inventoryItem) return false;
    
    // Already equipped
    if (inventoryItem.isEquipped) return false;
    
    // Check level requirements
    if (dbCosmetic.requiredLevel && user.level < dbCosmetic.requiredLevel) return false;
    
    // Check for equipment conflicts
    const type = this.normalizeCosmeticType(dbCosmetic.type);
    if (this.hasEquipmentConflict(type, user.currentEquipment)) return false;
    
    return true;
  }

  private static canUserUnequipCosmetic(dbCosmetic: any, user: any, inventoryItem?: any): boolean {
    // Must be equipped to unequip
    return inventoryItem?.isEquipped === true;
  }

  private static getCosmeticConflicts(dbCosmetic: any, userInventory?: any[]): ItemId[] {
    const type = this.normalizeCosmeticType(dbCosmetic.type);
    const conflicts: ItemId[] = [];
    
    if (!userInventory) return conflicts;
    
    // Find conflicting equipped items
    for (const item of userInventory) {
      if (item.isEquipped && this.typesConflict(type, this.normalizeCosmeticType(item.type))) {
        conflicts.push(item.itemId as ItemId);
      }
    }
    
    return conflicts;
  }

  private static typesConflict(type1: string, type2: string): boolean {
    // Define which cosmetic types conflict with each other
    const conflicts = {
      'avatar_frame': ['avatar_frame'], // Only one frame at a time
      'username_color': ['username_color'], // Only one color at a time
      'title': ['title'], // Only one title at a time
      'signature_effect': ['signature_effect'], // Only one signature effect
      'theme': ['theme'] // Only one theme at a time
    };
    
    return conflicts[type1 as keyof typeof conflicts]?.includes(type2) || false;
  }

  private static hasEquipmentConflict(type: string, currentEquipment: any): boolean {
    if (!currentEquipment) return false;
    
    // Check if user already has this type equipped
    return currentEquipment[type] !== undefined;
  }

  private static getShopItemId(dbCosmetic: any): ItemId | undefined {
    // In a real system, cosmetics might be linked to shop items
    return dbCosmetic.shopItemId as ItemId || undefined;
  }

  private static getCosmeticPrice(dbCosmetic: any): DgtAmount | undefined {
    // Get price from linked shop item or cosmetic metadata
    if (dbCosmetic.price) return this.sanitizeDgtAmount(dbCosmetic.price);
    if (dbCosmetic.shopItem?.price) return this.sanitizeDgtAmount(dbCosmetic.shopItem.price);
    return undefined;
  }

  private static canUserAffordCosmetic(dbCosmetic: any, user: any): boolean | undefined {
    const price = this.getCosmeticPrice(dbCosmetic);
    if (!price) return undefined;
    
    const userBalance = this.sanitizeDgtAmount(user.dgtBalance || 0);
    return userBalance >= price;
  }

  private static getCosmeticCustomizations(dbCosmetic: any, user: any): any | undefined {
    const type = this.normalizeCosmeticType(dbCosmetic.type);
    
    // Return type-specific customization options
    switch (type) {
      case 'username_color':
        return {
          colorOptions: dbCosmetic.metadata?.availableColors || [dbCosmetic.colorHex],
          gradientOptions: dbCosmetic.metadata?.gradientOptions
        };
      
      case 'avatar_frame':
        return {
          sizeOptions: ['small', 'medium', 'large'],
          animationSpeed: dbCosmetic.isAnimated ? 1.0 : undefined
        };
      
      case 'signature_effect':
        return {
          intensityOptions: ['low', 'medium', 'high'],
          colorOptions: dbCosmetic.metadata?.effectColors
        };
      
      default:
        return undefined;
    }
  }

  private static calculateEquipmentRate(analytics: any): number {
    if (!analytics?.totalOwners || analytics.totalOwners === 0) return 0;
    return Math.round((analytics.totalEquipped / analytics.totalOwners) * 100 * 100) / 100;
  }

  private static calculateEngagementScore(analytics: any): number {
    // Complex engagement calculation for cosmetics
    const equipmentRate = this.calculateEquipmentRate(analytics);
    const retentionRate = this.calculateRetentionRate(analytics);
    const popularityScore = analytics?.popularityScore || 0;
    
    // Weighted average
    return Math.round((equipmentRate * 0.4 + retentionRate * 0.4 + popularityScore * 0.2));
  }

  private static calculateRetentionRate(analytics: any): number {
    // Percentage of users who keep cosmetic equipped after 7 days
    if (!analytics?.retentionData) return 0;
    return Math.round(analytics.retentionData.sevenDayRetention * 100) / 100;
  }

  private static sanitizeDgtAmount(amount: any): DgtAmount {
    const parsed = parseFloat(amount?.toString() || '0');
    return (isNaN(parsed) ? 0 : Math.max(0, parsed)) as DgtAmount;
  }

  private static calculateAverageSalePrice(analytics: any): DgtAmount {
    if (!analytics?.totalSales || analytics.totalSales === 0) return 0 as DgtAmount;
    return this.sanitizeDgtAmount(analytics.totalRevenue / analytics.totalSales);
  }

  // ==========================================
  // EQUIPMENT MANAGEMENT UTILITIES
  // ==========================================

  /**
   * Get user's currently equipped cosmetics by type
   */
  static getUserEquippedCosmetics(userInventory: any[]): Record<string, any> {
    const equipped: Record<string, any> = {};
    
    for (const item of userInventory) {
      if (item.isEquipped) {
        const type = this.normalizeCosmeticType(item.type);
        equipped[type] = item;
      }
    }
    
    return equipped;
  }

  /**
   * Validate equipment change for conflicts
   */
  static validateEquipmentChange(
    cosmeticToEquip: any, 
    userInventory: any[]
  ): { canEquip: boolean; conflicts: ItemId[]; reason?: string } {
    const type = this.normalizeCosmeticType(cosmeticToEquip.type);
    const equipped = this.getUserEquippedCosmetics(userInventory);
    const conflicts: ItemId[] = [];
    
    // Check for type conflicts
    if (equipped[type]) {
      conflicts.push(equipped[type].itemId as ItemId);
    }
    
    // Special conflict rules (e.g., certain combinations don't work)
    // This would be expanded based on game design requirements
    
    return {
      canEquip: conflicts.length === 0,
      conflicts,
      reason: conflicts.length > 0 ? `Conflicts with equipped ${type}` : undefined
    };
  }

  /**
   * Generate cosmetic preview with current user equipment
   */
  static generateEquipmentPreview(
    targetCosmetic: any,
    currentEquipment: any[]
  ): {
    previewUrl: string;
    equipmentSet: Array<{ type: string; itemId: ItemId; name: string; }>;
  } {
    const type = this.normalizeCosmeticType(targetCosmetic.type);
    const equipmentSet = currentEquipment
      .filter(item => item.isEquipped && this.normalizeCosmeticType(item.type) !== type)
      .map(item => ({
        type: this.normalizeCosmeticType(item.type),
        itemId: item.itemId as ItemId,
        name: item.name
      }));
    
    // Add the target cosmetic
    equipmentSet.push({
      type,
      itemId: targetCosmetic.id as ItemId,
      name: targetCosmetic.name
    });
    
    // Generate preview URL with equipment set
    const equipmentIds = equipmentSet.map(e => e.itemId).join(',');
    const previewUrl = `/api/cosmetics/preview/composite/${equipmentIds}`;
    
    return { previewUrl, equipmentSet };
  }
}