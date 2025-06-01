import fetch from 'node-fetch';
const { CookieJar } = require('tough-cookie');
const fetchCookie = require('fetch-cookie');

// In development mode, the server auto-authenticates as DevUser,
// so we just need to make the requests and the auth middleware will handle it
async function getCookie() {
  // First, make a request to any authenticated endpoint to get a session cookie
  try {
    const response = await fetch('http://localhost:5001/api/authenticated-endpoint', {
      credentials: 'include'
    });
    
    // Extract the cookie from the response
    const cookies = response.headers.get('set-cookie');
    return cookies;
  } catch (error) {
    console.error('Error getting cookie:', error);
    return null;
  }
}

async function testAdjustUserXp() {
  try {
    console.log('POST /api/admin/xp/adjust - Attempting to adjust user XP...');
    
    const response = await fetch('http://localhost:5001/api/admin/xp/adjust', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 1, // Replace with a valid user ID
        amount: 100,
        reason: 'Test adjustment',
        adjustmentType: 'add' // 'add', 'subtract', or 'set'
      })
    });

    const data = await response.text();
    console.log('Response status:', response.status);
    try {
      console.log('Response data:', JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log('Response text:', data);
    }
  } catch (error) {
    console.error('Error testing XP adjustment:', error);
  }
}

async function testGetAdjustmentLogs() {
  try {
    console.log('GET /api/admin/xp/adjustments-log - Fetching adjustment logs...');
    
    const response = await fetch('http://localhost:5001/api/admin/xp/adjustments-log');

    const data = await response.text();
    console.log('Response status:', response.status);
    try {
      console.log('Response data:', JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log('Response text:', data);
    }
  } catch (error) {
    console.error('Error testing XP adjustment logs:', error);
  }
}

// Run the tests
async function runTests() {
  console.log('=== Testing Admin XP Endpoints ===');
  console.log('Note: In development mode, the server should auto-authenticate as DevUser');
  
  await testAdjustUserXp();
  console.log('\n---\n');
  await testGetAdjustmentLogs();
}

runTests(); 