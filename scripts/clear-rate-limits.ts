import { db } from '../db/index.js';
import { rateLimits } from '../db/schema/index.js';

async function clearRateLimits() {
  try {
    // Delete all rate limit records
    const result = await db.delete(rateLimits);
    console.log('✅ Rate limits cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing rate limits:', error);
  }
}

clearRateLimits();