const { Client } = require('pg');
require('dotenv').config();

async function fix() {
  const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
  console.log('Using connection:', connectionString?.includes('pooler') ? 'Pooled connection' : 'Direct connection');
  
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  
  console.log('Updating forum hierarchy...');

  // Update The Pit children
  await client.query(`
    UPDATE forum_structure
    SET parent_id = (SELECT id FROM forum_structure WHERE slug = 'the-pit')
    WHERE slug IN ('live-trade-reacts', 'shill-zone', 'rekt-histories')
    AND parent_id IS NULL
  `);

  // Update Mission Control children
  await client.query(`
    UPDATE forum_structure
    SET parent_id = (SELECT id FROM forum_structure WHERE slug = 'mission-control')
    WHERE slug IN ('market-analysis', 'trade-logs', 'strategy-scripts')
    AND parent_id IS NULL
  `);

  // Update Trading children
  await client.query(`
    UPDATE forum_structure
    SET parent_id = (SELECT id FROM forum_structure WHERE slug = 'trading')
    WHERE slug IN ('btc-analysis', 'altcoin-analysis', 'small-cap-gems', 'large-cap-alts')
    AND parent_id IS NULL
  `);

  // Update NFT District children
  await client.query(`
    UPDATE forum_structure
    SET parent_id = (SELECT id FROM forum_structure WHERE slug = 'nft-district')
    WHERE slug IN ('nft-calls', 'art-gallery')
    AND parent_id IS NULL
  `);

  // Update DeFi Laboratory children
  await client.query(`
    UPDATE forum_structure
    SET parent_id = (SELECT id FROM forum_structure WHERE slug = 'defi-laboratory')
    WHERE slug IN ('yield-farming', 'protocol-discussion', 'exploit-watch')
    AND parent_id IS NULL
  `);

  // Update Casino Floor children
  await client.query(`
    UPDATE forum_structure
    SET parent_id = (SELECT id FROM forum_structure WHERE slug = 'casino-floor')
    WHERE slug IN ('live-bets-results', 'challenge-board')
    AND parent_id IS NULL
  `);

  // Update DegenShop children
  await client.query(`
    UPDATE forum_structure
    SET parent_id = (SELECT id FROM forum_structure WHERE slug = 'degenshop')
    WHERE slug IN ('hot-items', 'cosmetics-grid', 'wishlist-queue')
    AND parent_id IS NULL
  `);

  const { rows } = await client.query(`
    SELECT p.name as parent, c.name as child
    FROM forum_structure c
    JOIN forum_structure p ON c.parent_id = p.id
    ORDER BY p.name
  `);

  console.log('✅ Fixed forum hierarchy. Current structure:');
  console.table(rows);
  
  await client.end();
}

fix().catch(console.error);