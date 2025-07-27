import '@server/config/loadEnv'; // Load environment variables like the server does
import { forumService } from '@server/src/domains/forum/forum.service';

async function testForumService() {
  console.log('🔍 Testing forum service methods...\n');
  
  try {
    console.log('1️⃣ Testing getCategoriesWithStats...');
    const categories = await forumService.getCategoriesWithStats();
    console.log(`✅ getCategoriesWithStats successful! Found ${categories.length} categories`);
    
    console.log('\n2️⃣ Testing getForumStructure...');
    const structure = await forumService.getForumStructure();
    console.log('✅ getForumStructure successful!');
    console.log(`- Zones: ${structure.zones.length}`);
    console.log(`- Categories: ${structure.categories.length}`);
    console.log(`- Forums: ${structure.forums.length}`);
    
    // Show sample zone
    if (structure.zones.length > 0) {
      const sampleZone = structure.zones[0];
      console.log('\nSample zone:', {
        name: sampleZone.name,
        type: sampleZone.type,
        isPrimary: sampleZone.isPrimary,
        features: sampleZone.features,
        customComponents: sampleZone.customComponents
      });
    }
    
  } catch (error) {
    console.error('❌ Service method failed:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
  
  process.exit(0);
}

testForumService().catch(console.error); 