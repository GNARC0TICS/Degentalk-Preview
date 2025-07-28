const { Client } = require('pg');
require('dotenv').config();

async function checkOrphanedThreads() {
  const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;  
  const client = new Client({
    connectionString: connectionString,
    ssl: connectionString.includes('neon') ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    
    // Check threads without valid forum references
    const orphanedResult = await client.query(`
      SELECT 
        t.id,
        t.title,
        t.structure_id,
        t.created_at
      FROM threads t
      LEFT JOIN forum_structure fs ON t.structure_id = fs.id
      WHERE fs.id IS NULL
      LIMIT 10
    `);
    
    console.log('=== Orphaned Threads ===');
    console.log(`Found ${orphanedResult.rowCount} threads with invalid forum references`);
    
    if (orphanedResult.rows.length > 0) {
      console.log('\nSample orphaned threads:');
      orphanedResult.rows.forEach(row => {
        console.log(`- "${row.title}" (ID: ${row.id}, Forum ID: ${row.structure_id})`);
      });
    }
    
    // Check total thread count
    const totalResult = await client.query('SELECT COUNT(*) as count FROM threads');
    console.log(`\nTotal threads in database: ${totalResult.rows[0].count}`);
    
    // Check forum structure count  
    const forumResult = await client.query('SELECT COUNT(*) as count FROM forum_structure');
    console.log(`Total forum structures: ${forumResult.rows[0].count}`);
    
    // Show current forum slugs
    const forumsResult = await client.query(`
      SELECT slug, name, id 
      FROM forum_structure 
      WHERE parent_id IS NULL 
      ORDER BY name
    `);
    
    console.log('\n=== Current Top-Level Forums ===');
    forumsResult.rows.forEach(row => {
      console.log(`- ${row.name} (${row.slug}) - ID: ${row.id}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkOrphanedThreads().catch(console.error);