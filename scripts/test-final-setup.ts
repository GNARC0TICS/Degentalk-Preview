#!/usr/bin/env tsx
// Final test of the email signup system

import { config } from 'dotenv';
config({ path: '.env.local' });

async function testFinalSetup() {
  const testEmails = [
    'early_bird@degentalk.com',
    'crypto_enthusiast@web3.com',
    'degen@example.com' // duplicate to test deduplication
  ];
  
  console.log('🧪 Testing final email signup setup...\n');
  
  for (const email of testEmails) {
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
      console.log(`✅ ${email} -> Waitlist count: ${data.newCount}`);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Error with ${email}:`, error);
    }
  }
  
  console.log('\n📊 Final stats check...');
  const statsResponse = await fetch('http://localhost:3500/api/visitors');
  const stats = await statsResponse.json();
  console.log(stats);
}

testFinalSetup();