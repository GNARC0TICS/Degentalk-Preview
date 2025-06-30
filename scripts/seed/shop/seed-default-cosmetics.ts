/**
 * Seed Default Cosmetics
 * Seeds the database with default shop items from the configuration
 */

import { db } from '../../../server/src/core/db';
import { products } from '../../../db/schema/shop/products';
import { defaultShopItems, isUsernameColorItem, isAvatarFrameItem, isUserTitleItem } from '../../../client/src/config/shop-items.config';
import { sql } from 'drizzle-orm';
import { fileURLToPath } from 'url';

export async function seedDefaultCosmetics() {
  console.log('🎨 Seeding default cosmetic shop items...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const item of defaultShopItems) {
    try {
      // Generate a slug from the ID
      const slug = item.id;
      
      // Prepare plugin reward data based on item type
      const pluginReward: any = {
        type: item.type,
        rarity: item.rarity,
        label: item.name
      };

      // Add type-specific data
      if (isUsernameColorItem(item)) {
        pluginReward.value = item.hex;
      } else if (isAvatarFrameItem(item)) {
        pluginReward.cssClass = item.cssClass;
      } else if (isUserTitleItem(item)) {
        pluginReward.titleText = item.titleText;
      }

      // Prepare metadata
      const metadata = {
        rarity: item.rarity,
        type: item.type,
        isAlwaysAvailable: item.isAlwaysAvailable
      };

      // Insert the product
      await db.insert(products).values({
        name: item.name,
        slug: slug,
        description: item.description || `${item.name} - ${item.type}`,
        price: item.price,
        status: 'published',
        pluginReward: pluginReward,
        isDigital: true,
        stockLimit: null, // Unlimited stock for default items
        metadata: metadata,
        createdAt: sql`now()`,
        updatedAt: sql`now()`
      }).onConflictDoUpdate({
        target: products.slug,
        set: {
          name: item.name,
          description: item.description || `${item.name} - ${item.type}`,
          price: item.price,
          pluginReward: pluginReward,
          metadata: metadata,
          updatedAt: sql`now()`
        }
      });
      
      console.log(`✅ Created/Updated: ${item.name} (${item.type})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to create ${item.name}:`, error);
      errorCount++;
    }
  }
  
  console.log(`\n🎨 Default cosmetics seeding complete!`);
  console.log(`✅ Success: ${successCount} items`);
  console.log(`❌ Errors: ${errorCount} items`);
  console.log(`📦 Total items processed: ${defaultShopItems.length}`);
}

// Main execution (ESM-friendly)
const isExecutedDirectly = process.argv[1] === fileURLToPath(import.meta.url);

if (isExecutedDirectly) {
  seedDefaultCosmetics()
    .then(() => {
      console.log('✨ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

// Export for use in other seed scripts
export default seedDefaultCosmetics;
