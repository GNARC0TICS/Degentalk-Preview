#!/usr/bin/env tsx
// Reset to clean starting state

import { config } from 'dotenv';
import { kv } from '@vercel/kv';

// Load environment variables
config({ path: '.env.local' });

async function resetToCleanState() {
  try {
    // Clear all emails
    await kv.del('waitlist_emails');
    await kv.del('waitlist_signups_detail');
    console.log('✅ Cleared all test emails');
    
    // Reset stats to desired starting point
    await kv.set('stats:page_visits', 742);
    await kv.set('stats:waitlist_signups', 134);
    console.log('✅ Reset stats to: 742 visits, 134 signups');
    
    console.log('\n🎯 Clean slate! Ready for production.');
    console.log('   - Page visits will start at 742');
    console.log('   - Waitlist signups will start at 134');
    console.log('   - Emails will be stored in plain text');
    console.log('   - No Google Form redirect');
    
  } catch (error) {
    console.error('❌ Error resetting:', error);
  }
}

// Run the script
resetToCleanState();