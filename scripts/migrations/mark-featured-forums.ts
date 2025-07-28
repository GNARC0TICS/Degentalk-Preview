import { db } from '../../db/index.js';
import { forumStructure } from '../../db/schema/forum/structure.js';
import { eq, inArray } from 'drizzle-orm';

/**
 * Migration: Mark Featured Forums
 * 
 * This migration marks certain forums as featured based on their purpose and theme.
 */

async function markFeaturedForums() {
  console.log('🌟 Marking featured forums...\n');

  try {
    // Define which forums should be featured
    const featuredForumSlugs = [
      // Trading themed
      'market-analysis',
      'live-trade-reacts', 
      'shill-zone',
      'alpha-channel',
      'trade-logs',
      
      // Casino themed
      'live-bets-results',
      'the-pit',
      'casino-floor',
      
      // Community/Official themed
      'announcements',
      'patch-notes',
      'suggestions',
      'bug-reports',
      
      // Mission themed
      'challenge-board',
      'strategy-scripts',
      
      // Archive themed
      'legendary-threads',
      'rugged-remembered',
      'cringe-museum'
    ];

    // Update forums to be featured
    const updateResult = await db.update(forumStructure)
      .set({ 
        isFeatured: true
      })
      .where(inArray(forumStructure.slug, featuredForumSlugs));

    console.log(`✅ Marked ${featuredForumSlugs.length} forums as featured`);

    // Set theme presets for featured forums
    const themeMapping: Record<string, string> = {
      // Trading theme
      'market-analysis': 'trading',
      'live-trade-reacts': 'trading',
      'shill-zone': 'trading',
      'alpha-channel': 'trading',
      'trade-logs': 'trading',
      
      // Casino theme
      'live-bets-results': 'casino',
      'the-pit': 'casino',
      'casino-floor': 'casino',
      
      // Community theme
      'announcements': 'community',
      'patch-notes': 'community',
      'suggestions': 'community',
      'bug-reports': 'community',
      
      // Mission theme
      'challenge-board': 'mission',
      'strategy-scripts': 'mission',
      
      // Archive theme
      'legendary-threads': 'archive',
      'rugged-remembered': 'archive',
      'cringe-museum': 'archive'
    };

    console.log('\n🎨 Setting theme presets...');
    for (const [slug, theme] of Object.entries(themeMapping)) {
      await db.update(forumStructure)
        .set({ 
          themePreset: theme
        })
        .where(eq(forumStructure.slug, slug));
    }

    // Update positions to group featured forums first
    console.log('\n🔢 Reordering forums...');
    
    // Get all forums ordered by featured status and name
    const allForums = await db.select({
      id: forumStructure.id,
      name: forumStructure.name,
      isFeatured: forumStructure.isFeatured
    }).from(forumStructure)
    .orderBy(forumStructure.isFeatured, forumStructure.name);

    // Update positions
    let position = 0;
    for (const forum of allForums) {
      await db.update(forumStructure)
        .set({ position })
        .where(eq(forumStructure.id, forum.id));
      position++;
    }

    // Final verification
    const allForumsAfter = await db.select({
      name: forumStructure.name,
      slug: forumStructure.slug,
      isFeatured: forumStructure.isFeatured,
      themePreset: forumStructure.themePreset
    }).from(forumStructure)
    .orderBy(forumStructure.isFeatured, forumStructure.position);

    const featuredCount = allForumsAfter.filter(f => f.isFeatured).length;
    const generalCount = allForumsAfter.filter(f => !f.isFeatured).length;

    console.log('\n✅ Migration completed successfully!');
    console.log('📊 Final stats:');
    console.log(`   - Featured: ${featuredCount} forums`);
    console.log(`   - General: ${generalCount} forums`);
    
    console.log('\n🌟 Featured forums:');
    allForumsAfter.filter(f => f.isFeatured).forEach(f => {
      console.log(`   - ${f.name} (${f.slug}) - Theme: ${f.themePreset || 'default'}`);
    });

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
markFeaturedForums()
  .then(() => {
    console.log('\n🎉 Featured forums marked successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration error:', error);
    process.exit(1);
  });