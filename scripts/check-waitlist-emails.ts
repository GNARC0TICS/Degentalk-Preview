#!/usr/bin/env tsx
// Script to check stored waitlist emails in Upstash KV

import { config } from 'dotenv';
import { kv } from '@vercel/kv';

// Load environment variables
config({ path: '.env.local' });

async function checkWaitlistEmails() {
  try {
    // Get all stored emails (now plain text)
    const emails = await kv.smembers('waitlist_emails');
    
    console.log('\n📧 Waitlist Email Status:');
    console.log(`   Total unique emails stored: ${emails?.length || 0}`);
    
    if (emails && emails.length > 0) {
      console.log('\n   Stored emails:');
      emails.forEach((email, index) => {
        console.log(`   ${index + 1}. ${email}`);
      });
    }
    
    // Check signup details (with timestamps)
    const details = await kv.hgetall('waitlist_signups_detail');
    if (details && Object.keys(details).length > 0) {
      console.log('\n   Signup timestamps:');
      Object.entries(details).forEach(([email, timestamp]) => {
        console.log(`   ${email} - ${timestamp}`);
      });
    }
    
    // Also check the current stats
    const pageVisits = await kv.get('stats:page_visits');
    const waitlistSignups = await kv.get('stats:waitlist_signups');
    
    console.log('\n📊 Current Stats:');
    console.log(`   Page visits: ${pageVisits}`);
    console.log(`   Waitlist signups: ${waitlistSignups}`);
    console.log(`   Unique emails: ${emails?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Error checking waitlist emails:', error);
  }
}

// Run the script
checkWaitlistEmails();