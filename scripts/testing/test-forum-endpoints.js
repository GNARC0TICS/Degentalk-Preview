// Test script for forum endpoints
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001'; // Change this if your server runs on a different port

// Helper function for API requests
async function testEndpoint(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`Testing ${method} ${endpoint}...`);
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const json = await response.json();
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log('Response:', JSON.stringify(json, null, 2).slice(0, 300) + '...');
    } else {
      const text = await response.text();
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log('Response:', text.slice(0, 100) + '...');
    }
    console.log('-----------------------------------');
    return response;
  } catch (error) {
    console.error(`Error testing ${endpoint}:`, error.message);
    console.log('-----------------------------------');
    return null;
  }
}

async function runTests() {
  console.log('FORUM ENDPOINT TESTS\n');

  // Test categories
  await testEndpoint('/api/forum/categories');
  await testEndpoint('/api/forum/categories/tree');
  
  // Test thread search
  await testEndpoint('/api/forum/threads/search?page=1&limit=10');
  await testEndpoint('/api/forum/threads/search?categoryId=1&page=1&limit=10');
  
  // Test categories by slug
  // Replace 'general' with an actual category slug from your database
  await testEndpoint('/api/forum/categories/general');
  
  // Test prefixes
  await testEndpoint('/api/forum/prefixes');
  await testEndpoint('/api/forum/prefixes?categoryId=1');
  
  // Test tags
  await testEndpoint('/api/forum/tags');
  
  console.log('Tests completed!');
}

runTests().catch(console.error); 