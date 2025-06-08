/**
 * XP Actions Test Script
 * 
 * This script tests the XP action award system by sending requests to the
 * admin test endpoint for different actions and users.
 * 
 * Usage:
 * node scripts/test-xp-actions.js
 */

const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:5001/api/admin/xp/test-action';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'dev_admin_token'; // Set your admin token here or use environment variable
const TEST_USER_ID = process.env.TEST_USER_ID || 4; // Default to DevUser ID 4

// XP Actions to test
const XP_ACTIONS = [
  'post_created',
  'thread_created',
  'received_like',
  'daily_login',
  'user_mentioned',
  'reply_received',
  'profile_completed'
];

// Helper function to make API requests
async function callApi(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ADMIN_TOKEN}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(endpoint, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${data.message || 'Unknown error'}`);
    }
    
    return data;
  } catch (error) {
    console.error(`Error calling API (${endpoint}):`, error.message);
    return null;
  }
}

// Test a single XP action
async function testXpAction(userId, action) {
  console.log(`\n🧪 Testing action: ${action} for user ID: ${userId}`);

  try {
    const metadata = { testRun: true, timestamp: new Date().toISOString() };
    const result = await callApi(API_URL, 'POST', { userId, action, metadata });
    
    if (!result) {
      console.log(`❌ Test failed for ${action}`);
      return;
    }
    
    console.log(`✅ Action test result:`);
    console.log(`   - XP awarded: ${result.result?.xpChange || 'none'}`);
    console.log(`   - New total XP: ${result.result?.newXp}`);
    
    if (result.limits) {
      console.log(`   - Limit count: ${result.limits.current.count}/${result.limits.config.maxPerDay || '∞'}`);
      
      if (result.limits.config.cooldownSeconds) {
        console.log(`   - Cooldown: ${result.limits.current.onCooldown ? 
          `Active (${result.limits.current.cooldownRemaining}s remaining)` : 
          'Inactive'}`);
      }
    }
  } catch (error) {
    console.error(`Error testing ${action}:`, error);
  }
}

// Test the cooldown and limit system by repeatedly calling the same action
async function testLimitsAndCooldowns(userId, action, iterations = 5) {
  console.log(`\n🔄 Testing limits/cooldowns for action: ${action}`);
  
  for (let i = 0; i < iterations; i++) {
    console.log(`\n➡️ Attempt ${i + 1} of ${iterations}`);
    await testXpAction(userId, action);
    
    // Small delay between calls
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Main function
async function main() {
  console.log('🚀 Starting XP actions test script');
  
  // 1. Test all actions once
  console.log('\n=== Testing all XP actions ===');
  for (const action of XP_ACTIONS) {
    await testXpAction(TEST_USER_ID, action);
  }
  
  // 2. Test limits and cooldowns
  console.log('\n=== Testing limits and cooldowns ===');
  // Test an action with a cooldown (daily_login)
  await testLimitsAndCooldowns(TEST_USER_ID, 'daily_login', 3);
  
  // Test an action with maxPerDay (post_created)
  await testLimitsAndCooldowns(TEST_USER_ID, 'post_created', 3);
  
  console.log('\n✅ XP actions test script completed');
}

// Run the tests
main().catch(console.error); 