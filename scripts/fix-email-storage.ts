#!/usr/bin/env tsx
// Script to fix email storage

import { config } from 'dotenv';
import { kv } from '@vercel/kv';

// Load environment variables
config({ path: '.env.local' });

async function fixEmailStorage() {
  try {
    // Clear the corrupted detail data
    await kv.del('waitlist_signups_detail');
    console.log('✅ Cleared corrupted signup details');
    
    // Get current emails
    const emails = await kv.smembers('waitlist_emails');
    console.log(`\n📧 Current emails: ${emails?.length || 0}`);
    
    if (emails && emails.length > 0) {
      // Re-add with proper timestamps
      for (const email of emails) {
        const timestamp = new Date().toISOString();
        await kv.hset('waitlist_signups_detail', { [email]: timestamp });
        console.log(`   ✅ Fixed: ${email} - ${timestamp}`);
      }
    }
    
    console.log('\n🎯 Email storage fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing email storage:', error);
  }
}

// Run the script
fixEmailStorage();