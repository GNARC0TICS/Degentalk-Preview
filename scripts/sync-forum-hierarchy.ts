require('dotenv').config();
const { db } = require('../db/index.js');
const { forumStructure } = require('../db/schema/index.js');
const { eq } = require('drizzle-orm');
const { forumMap } = require('../shared/config/forum-map.config.js');

async function syncForumHierarchy() {
  console.log('Starting forum hierarchy sync...\n');
  
  // Get all forums from database
  const dbForums = await db.select().from(forumStructure);
  const forumsBySlug = new Map(dbForums.map(f => [f.slug, f]));
  
  let updateCount = 0;
  
  // Process each zone from config
  for (const zone of forumMap.forums) {
    const zoneRecord = forumsBySlug.get(zone.slug);
    if (!zoneRecord) {
      console.log(`⚠️  Zone not found in DB: ${zone.slug}`);
      continue;
    }
    
    console.log(`\n📁 Processing zone: ${zone.name}`);
    
    // Process forums under this zone
    if (zone.forums) {
      for (const forum of zone.forums) {
        const forumRecord = forumsBySlug.get(forum.slug);
        if (!forumRecord) {
          console.log(`  ⚠️  Forum not found in DB: ${forum.slug}`);
          continue;
        }
        
        // Check if this forum should be under the zone
        if (forumRecord.parentId !== zoneRecord.id) {
          console.log(`  ✅ Updating ${forum.name} to be under ${zone.name}`);
          await db.update(forumStructure)
            .set({ parentId: zoneRecord.id })
            .where(eq(forumStructure.id, forumRecord.id));
          updateCount++;
        } else {
          console.log(`  ⏭️  ${forum.name} already correctly parented`);
        }
        
        // Process subforums if any
        if (forum.forums) {
          for (const subforum of forum.forums) {
            const subforumRecord = forumsBySlug.get(subforum.slug);
            if (!subforumRecord) {
              console.log(`    ⚠️  Subforum not found in DB: ${subforum.slug}`);
              continue;
            }
            
            if (subforumRecord.parentId !== forumRecord.id) {
              console.log(`    ✅ Updating ${subforum.name} to be under ${forum.name}`);
              await db.update(forumStructure)
                .set({ parentId: forumRecord.id })
                .where(eq(forumStructure.id, subforumRecord.id));
              updateCount++;
            }
          }
        }
      }
    }
  }
  
  console.log(`\n✨ Sync complete! Updated ${updateCount} forum relationships.`);
  
  // Verify specific forums
  console.log('\n🔍 Verifying key relationships:');
  const thePit = await db.select().from(forumStructure).where(eq(forumStructure.slug, 'the-pit')).limit(1);
  const liveTradeReacts = await db.select().from(forumStructure).where(eq(forumStructure.slug, 'live-trade-reacts')).limit(1);
  
  if (thePit[0] && liveTradeReacts[0]) {
    console.log(`- The Pit ID: ${thePit[0].id}`);
    console.log(`- Live-Trade Reacts parent_id: ${liveTradeReacts[0].parentId}`);
    console.log(`- Relationship correct: ${liveTradeReacts[0].parentId === thePit[0].id ? '✅' : '❌'}`);
  }
  
  process.exit(0);
}

syncForumHierarchy().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});