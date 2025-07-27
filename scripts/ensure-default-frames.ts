#!/usr/bin/env tsx
/**
 * Ensures default avatar frames have corresponding products in the database
 * Run this before starting dev server to guarantee frames show up in shop
 */

import { db } from '@db/client';
import { products, avatarFrames } from '@schema';
import { defaultFrames } from '@shared/config/default-frames.config';
import { eq, and } from 'drizzle-orm';
import { logger } from '@core/logger';
import type { FrameId, ProductId } from '@shared/types/ids';

async function ensureDefaultFrames() {
  logger.info('EnsureFrames', 'Checking default avatar frames...');
  
  let createdCount = 0;
  let existingCount = 0;

  for (const frame of defaultFrames) {
    try {
      // Check if frame exists in database
      const [existingFrame] = await db
        .select()
        .from(avatarFrames)
        .where(eq(avatarFrames.id, frame.id))
        .limit(1);

      if (!existingFrame) {
        // Create frame in database
        await db.insert(avatarFrames).values({
          id: frame.id,
          name: frame.name,
          imageUrl: frame.imageUrl,
          rarity: frame.rarity,
          animated: frame.animated
        });
        logger.info('EnsureFrames', `Created frame: ${frame.name}`);
      }

      // Check if product exists for this frame
      const [existingProduct] = await db
        .select()
        .from(products)
        .where(eq(products.frameId, frame.id))
        .limit(1);

      if (!existingProduct) {
        // Create product for frame
        await db.insert(products).values({
          id: `frame-product-${frame.id}` as ProductId,
          name: frame.name,
          description: frame.description || `${frame.name} avatar frame`,
          categoryId: 'cosmetics', // Assuming this category exists
          price: frame.price,
          frameId: frame.id,
          status: 'published',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        createdCount++;
        logger.info('EnsureFrames', `Created product for frame: ${frame.name} (${frame.price} DGT)`);
      } else {
        existingCount++;
      }
    } catch (error) {
      logger.error('EnsureFrames', `Failed to ensure frame ${frame.name}:`, error);
    }
  }

  logger.info('EnsureFrames', `Complete! Created ${createdCount} products, ${existingCount} already existed`);
  
  // Exit successfully
  process.exit(0);
}

// Run the script
ensureDefaultFrames().catch((error) => {
  logger.error('EnsureFrames', 'Fatal error:', error);
  process.exit(1);
});