#!/usr/bin/env node

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createTestUser() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  try {
    const result = await pool.query(
      `INSERT INTO users (username, email, password, role, xp, is_active, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (username) DO UPDATE
       SET password = $3, role = $4, xp = $5
       RETURNING id`,
      ['cryptoadmin', 'admin@degentalk.com', hashedPassword, 'admin', 99999, true, true]
    );
    
    console.log('✅ Test user created:', result.rows[0].id);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createTestUser();