#!/usr/bin/env tsx
// Script to test email signup functionality

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function testEmailSignup() {
  try {
    const testEmail = 'degen@example.com';
    
    console.log(`\n🧪 Testing signup with email: ${testEmail}`);
    
    // Make the API request
    const response = await fetch('http://localhost:3500/api/visitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'incrementWaitlist',
        email: testEmail 
      })
    });
    
    const data = await response.json();
    console.log('\n📤 API Response:', data);
    
    // Check the updated stats
    const statsResponse = await fetch('http://localhost:3500/api/visitors');
    const stats = await statsResponse.json();
    console.log('\n📊 Updated Stats:', stats);
    
  } catch (error) {
    console.error('❌ Error testing signup:', error);
  }
}

// Run the test
testEmailSignup();