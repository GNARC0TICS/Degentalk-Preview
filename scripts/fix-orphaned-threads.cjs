const { Client } = require('pg');
require('dotenv').config();

async function fixOrphanedThreads() {
  const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;  
  const client = new Client({
    connectionString: connectionString,
    ssl: connectionString.includes('neon') ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('🔗 Connected to database');
    
    // Step 1: Get all current forum mappings (slug -> new ID)
    const forumMappings = await client.query(`
      SELECT id, slug, name, parent_id
      FROM forum_structure 
      ORDER BY slug
    `);
    
    console.log('\n=== Current Forum Structure ===');
    forumMappings.rows.forEach(row => {
      const level = row.parent_id ? '  📄' : '🏛️';
      console.log(`${level} ${row.name} (${row.slug}) - ID: ${row.id}`);
    });
    
    // Step 2: Check which forum slugs the orphaned threads should belong to
    // This requires some mapping based on thread titles or other data
    // For now, let's move them to appropriate forums based on content
    
    const threadMapping = [
      // Market analysis threads -> Market Analysis forum  
      { pattern: /market analysis|bull run|bear market|ETH vs SOL/i, targetSlug: 'market-analysis' },
      // Yield farming -> DeFi Laboratory
      { pattern: /yield farming|defi|protocol/i, targetSlug: 'defi-lab' },
      // General trading -> The Pit
      { pattern: /turned.*into|trading|journey/i, targetSlug: 'the-pit' },
      // GameFi -> NFT District  
      { pattern: /gamefi|nft/i, targetSlug: 'nft-district' }
    ];
    
    // Get orphaned threads
    const orphanedThreads = await client.query(`
      SELECT t.id, t.title, t.structure_id
      FROM threads t
      LEFT JOIN forum_structure fs ON t.structure_id = fs.id
      WHERE fs.id IS NULL
    `);
    
    console.log(`\n=== Fixing ${orphanedThreads.rowCount} Orphaned Threads ===`);
    
    let fixedCount = 0;
    let unmatchedCount = 0;
    
    for (const thread of orphanedThreads.rows) {
      let targetForumId = null;
      let targetSlug = null;
      
      // Try to match thread to appropriate forum
      for (const mapping of threadMapping) {
        if (mapping.pattern.test(thread.title)) {
          const forumMatch = forumMappings.rows.find(f => f.slug === mapping.targetSlug);
          if (forumMatch) {
            targetForumId = forumMatch.id;
            targetSlug = forumMatch.slug;
            break;
          }
        }
      }
      
      // Default fallback: move to The Pit (general discussion)
      if (!targetForumId) {
        const defaultForum = forumMappings.rows.find(f => f.slug === 'the-pit');
        if (defaultForum) {
          targetForumId = defaultForum.id;
          targetSlug = 'the-pit';
        }
      }
      
      if (targetForumId) {
        await client.query(`
          UPDATE threads 
          SET structure_id = $1 
          WHERE id = $2
        `, [targetForumId, thread.id]);
        
        console.log(`✅ Moved "${thread.title}" -> ${targetSlug}`);
        fixedCount++;
      } else {
        console.log(`❌ Could not fix "${thread.title}"`);
        unmatchedCount++;
      }
    }
    
    console.log(`\n📊 Results:`);
    console.log(`  - Fixed threads: ${fixedCount}`);
    console.log(`  - Unmatched threads: ${unmatchedCount}`);
    
    // Verify the fix
    const remainingOrphans = await client.query(`
      SELECT COUNT(*) as count
      FROM threads t
      LEFT JOIN forum_structure fs ON t.structure_id = fs.id
      WHERE fs.id IS NULL
    `);
    
    console.log(`  - Remaining orphans: ${remainingOrphans.rows[0].count}`);
    
    if (remainingOrphans.rows[0].count === '0') {
      console.log('\n🎉 All threads have been successfully mapped to forums!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✅ Done!');
  }
}

fixOrphanedThreads().catch(console.error);