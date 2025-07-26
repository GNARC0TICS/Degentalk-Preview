// import { seedShopItems, addOGDripColorItem } from '../../server/utils/shop-utils'; // File doesn't exist
import { logger } from '../server/src/core/logger';

async function seedShop() {
  try {
    console.log('🛍️ Starting shop seeding process...');
    
    // Seed main shop items
    await seedShopItems();
    
    // Ensure OG Drip item exists
    await addOGDripColorItem();
    
    console.log('✅ Shop seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding shop:', error);
    logger.error('SHOP_SEED', 'Failed to seed shop', error);
    process.exit(1);
  }
}

// Run the seeding
seedShop(); 