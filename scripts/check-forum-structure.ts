import { db } from '../db/index.js';
import { forumStructure } from '../db/schema/forum/structure.js';

async function checkForumStructure() {
  const structures = await db.select({
    id: forumStructure.id,
    name: forumStructure.name,
    slug: forumStructure.slug,
    type: forumStructure.type,
    parentId: forumStructure.parentId,
    isFeatured: forumStructure.isFeatured
  }).from(forumStructure)
  .orderBy(forumStructure.type, forumStructure.name);

  console.log('\n=== Current Forum Structure ===');
  console.log(`Total structures: ${structures.length}`);
  
  const zones = structures.filter(s => s.type === 'zone');
  const forums = structures.filter(s => s.type === 'forum');
  
  console.log(`\nZones: ${zones.length}`);
  zones.forEach(z => {
    console.log(`  - ${z.name} (${z.slug})`);
  });
  
  console.log(`\nForums: ${forums.length}`);
  forums.forEach(f => {
    console.log(`  - ${f.name} (${f.slug}) - Featured: ${f.isFeatured}, Parent: ${f.parentId ? 'Yes' : 'No'}`);
  });
}

checkForumStructure().catch(console.error);