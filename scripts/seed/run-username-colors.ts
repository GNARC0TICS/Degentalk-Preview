import { db } from '@db';
import { products } from '../../shared/schema';
import { USERNAME_COLOR_PRODUCTS } from './shop/username-colors';

async function seedUsernameColors() {
  console.log('🎨 Starting username color seeding...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const colorProduct of USERNAME_COLOR_PRODUCTS) {
    try {
      await db.insert(products).values({
        name: colorProduct.name,
        description: colorProduct.description,
        price: colorProduct.price,
        pointsPrice: colorProduct.pointsPrice || null,
        stockLimit: colorProduct.stockLimit,
        status: colorProduct.status,
        pluginReward: JSON.stringify(colorProduct.pluginReward),
        metadata: JSON.stringify(colorProduct.metadata),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Created: ${colorProduct.name} (${colorProduct.pluginReward.rarity})`);
      successCount++;
    } catch (error: any) {
      console.error(`❌ Failed to create ${colorProduct.name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 Seeding Summary:');
  console.log(`✅ Successfully created: ${successCount} colors`);
  console.log(`❌ Failed: ${errorCount} colors`);
  console.log(`📦 Total processed: ${USERNAME_COLOR_PRODUCTS.length} colors`);
  
  if (successCount > 0) {
    console.log('\n🎨 Username colors are now available in the shop!');
    console.log('💡 Users can purchase these from /shop or be granted them via /admin/users/:userId');
  }
}

// Run the seeder
seedUsernameColors()
  .then(() => {
    console.log('\n✨ Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  }); 