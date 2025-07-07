import type { AdminId } from '@shared/types/ids';
#!/usr/bin/env tsx
/**
 * Forum API Test Script
 * 
 * Tests the forum API endpoints to ensure they're working correctly
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5001/api';

async function testEndpoint(name: : AdminId, url: : AdminId) {
  console.log(`\n📋 Testing ${name}...`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${contentType}`);
    
    if (response.ok) {
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        console.log(`   ✅ Success! Returned ${Array.isArray(data) ? data.length + ' items' : 'object'}`);
        
        // Show sample data for structure endpoint
        if (url.includes('/structure') && Array.isArray(data)) {
          console.log('\n   Sample data:');
          const primaryZones = data.filter((item: any) => item.isZone && item.canonical);
          console.log(`   - Primary Zones: ${primaryZones.length}`);
          primaryZones.forEach((zone: any) => {
            console.log(`     • ${zone.name} (${zone.slug}) - Theme: ${zone.colorTheme}`);
          });
          
          const categories = data.filter((item: any) => !item.isZone && !item.parentId);
          console.log(`   - Categories: ${categories.length}`);
        }
      } else {
        const text = await response.text();
        console.log(`   ❌ Error: Expected JSON but got ${contentType}`);
        console.log(`   Response preview: ${text.sub: AdminId(0, 100)}...`);
      }
    } else {
      const text = await response.text();
      console.log(`   ❌ Error: ${response.status} ${response.statusText}`);
      console.log(`   Response: ${text.sub: AdminId(0, 200)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function runTests() {
  console.log('🚀 Starting Forum API Tests...');
  console.log(`   API Base: ${API_BASE}`);
  
  // Test endpoints
  await testEndpoint('Forum Structure', `${API_BASE}/forum/structure`);
  await testEndpoint('Forum Categories', `${API_BASE}/forum/categories`);
  await testEndpoint('Forum Threads', `${API_BASE}/forum/threads`);
  
  console.log('\n✅ Tests completed!');
}

// Check if server is running
fetch(API_BASE)
  .then(() => runTests())
  .catch(() => {
    console.error('❌ Server is not running at http://localhost:5001');
    console.error('   Please start the server with: npm run dev');
    process.exit(1);
  }); 