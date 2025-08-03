#!/usr/bin/env tsx
// Script to set initial values in Upstash KV

import { config } from 'dotenv';
import { kv } from '@vercel/kv';

// Load environment variables
config({ path: '.env.local' });

async function setInitialStats() {
  try {
    // Set initial page visits (adjust this number as needed)
    const initialPageVisits = 742; // matching the waitlist signups for relevance
    await kv.set('stats:page_visits', initialPageVisits);
    console.log(`✅ Set initial page visits to ${initialPageVisits}`);

    // Set initial waitlist signups (should be 134 as requested)
    const initialWaitlist = 134;
    await kv.set('stats:waitlist_signups', initialWaitlist);
    console.log(`✅ Set initial waitlist signups to ${initialWaitlist}`);

    // Verify the values
    const pageVisits = await kv.get('stats:page_visits');
    const waitlistSignups = await kv.get('stats:waitlist_signups');
    
    console.log('\n📊 Current values in KV:');
    console.log(`   Page visits: ${pageVisits}`);
    console.log(`   Waitlist signups: ${waitlistSignups}`);
  } catch (error) {
    console.error('❌ Error setting initial stats:', error);
  }
}

// Run the script
setInitialStats();