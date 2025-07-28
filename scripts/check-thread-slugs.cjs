const { Client } = require('pg');
require('dotenv').config();

async function checkThreadSlugs() {
  const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;  
  const client = new Client({
    connectionString: connectionString,
    ssl: connectionString.includes('neon') ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    
    // Get all threads with their slugs
    const threadsResult = await client.query(`
      SELECT 
        t.id,
        t.title,
        t.slug,
        t.structure_id,
        fs.name as forum_name
      FROM threads t
      LEFT JOIN forum_structure fs ON t.structure_id = fs.id
      ORDER BY t.title
    `);
    
    console.log('=== All Thread Slugs ===');
    console.log(`Found ${threadsResult.rows.length} threads:`);
    
    threadsResult.rows.forEach(row => {
      console.log(`- "${row.title}"`);
      console.log(`  Slug: ${row.slug}`);
      console.log(`  Forum: ${row.forum_name || 'Unknown'}`);
      console.log(`  ID: ${row.id}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkThreadSlugs().catch(console.error);