#!/usr/bin/env tsx
/**
 * Ensures default avatar frames have corresponding products in the database
 * Run this before starting dev server to guarantee frames show up in shop
 */

import { db } from '@db';
import { products, avatarFrames } from '@db/schema';
import { defaultFrames } from '@shared/config/default-frames.config';
import { eq, and } from 'drizzle-orm';
import { v5 as uuidv5 } from 'uuid';

// Simple console logger for scripts
const logger = {
	info: (...args: any[]) => console.log('[INFO]', ...args),
	error: (...args: any[]) => console.error('[ERROR]', ...args),
	warn: (...args: any[]) => console.warn('[WARN]', ...args)
};
import type { FrameId, ProductId } from '@shared/types/ids';

// Namespace UUID for generating deterministic UUIDs from string IDs
const FRAME_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

// Convert string frame ID to UUID
function frameIdToUuid(frameId: string): string {
	return uuidv5(frameId, FRAME_NAMESPACE);
}

async function ensureDefaultFrames() {
  logger.info('EnsureFrames', 'Checking default avatar frames...');
  
  let createdCount = 0;
  let existingCount = 0;

  for (const frame of defaultFrames) {
    try {
      // Convert string ID to UUID
      const frameUuid = frameIdToUuid(frame.id);
      
      // Check if frame exists in database
      const [existingFrame] = await db
        .select()
        .from(avatarFrames)
        .where(eq(avatarFrames.id, frameUuid))
        .limit(1);

      if (!existingFrame) {
        // Create frame in database
        await db.insert(avatarFrames).values({
          id: frameUuid,
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
        .where(eq(products.frameId, frameUuid))
        .limit(1);

      if (!existingProduct) {
        // Create product for frame
        const productUuid = frameIdToUuid(`frame-product-${frame.id}`);
        await db.insert(products).values({
          id: productUuid as ProductId,
          name: frame.name,
          description: frame.description || `${frame.name} avatar frame`,
          categoryId: 'cosmetics', // Assuming this category exists
          price: frame.price,
          frameId: frameUuid,
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