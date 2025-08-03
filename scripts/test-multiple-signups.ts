#!/usr/bin/env tsx
// Test multiple signups including duplicates

import { config } from 'dotenv';
config({ path: '.env.local' });

async function testMultipleSignups() {
  const emails = [
    'alice@degentalk.com',
    'bob@degentalk.com',
    'degen@example.com', // duplicate from earlier test
    'alice@degentalk.com', // duplicate
    'charlie@degentalk.com'
  ];
  
  console.log('🧪 Testing multiple signups...\n');
  
  for (const email of emails) {
    try {
      const response = await fetch('http://localhost:3500/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'incrementWaitlist',
          email 
        })
      });
      
      const data = await response.json();
      console.log(`✅ ${email} -> Count: ${data.newCount}`);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Error with ${email}:`, error);
    }
  }
}

testMultipleSignups();