#!/usr/bin/env tsx
// Script to clear old hashed emails from KV

import { config } from 'dotenv';
import { kv } from '@vercel/kv';

// Load environment variables
config({ path: '.env.local' });

async function clearOldEmails() {
  try {
    // Get all current members (these will be hashes)
    const hashedEmails = await kv.smembers('waitlist_emails');
    console.log(`\n🧹 Found ${hashedEmails?.length || 0} hashed emails to clear`);
    
    if (hashedEmails && hashedEmails.length > 0) {
      // Clear all old hashed emails
      await kv.del('waitlist_emails');
      console.log('✅ Cleared all hashed emails');
    }
    
    // Also clear any old detail entries if they exist
    const details = await kv.hgetall('waitlist_signups_detail');
    if (details && Object.keys(details).length > 0) {
      await kv.del('waitlist_signups_detail');
      console.log('✅ Cleared old signup details');
    }
    
    console.log('\n🎯 Ready for plain email storage!');
    
  } catch (error) {
    console.error('❌ Error clearing old emails:', error);
  }
}

// Run the script
clearOldEmails();