import { db } from '@db';
import { forumStructure } from '@db/schema';
import { isNotNull, eq } from 'drizzle-orm';

async function checkForumParents() {
  // Check forums with parent_id
  const withParents = await db.select({ 
    name: forumStructure.name, 
    parentId: forumStructure.parentId,
    slug: forumStructure.slug 
  })
  .from(forumStructure)
  .where(isNotNull(forumStructure.parentId))
  .limit(10);

  console.log('Forums with parent_id:', withParents.length);
  withParents.forEach(f => console.log(`  - ${f.name} (parent: ${f.parentId})`));
  
  // Check specific forums
  const thePit = await db.select().from(forumStructure).where(eq(forumStructure.slug, 'the-pit')).limit(1);
  const liveTradeReacts = await db.select().from(forumStructure).where(eq(forumStructure.slug, 'live-trade-reacts')).limit(1);
  
  console.log('\nThe Pit ID:', thePit[0]?.id);
  console.log('Live-Trade Reacts:', liveTradeReacts[0]?.name, 'parent_id:', liveTradeReacts[0]?.parentId);
  
  // Check if Live-Trade Reacts should be under The Pit
  console.log('\nChecking forum config...');
  const forumMap = await import('@shared/config/forum-map.config');
  const pitConfig = forumMap.forumMap.forums.find(f => f.slug === 'the-pit');
  console.log('The Pit config has subforums:', pitConfig?.forums?.map(f => f.slug));
  
  process.exit(0);
}

checkForumParents().catch(console.error);