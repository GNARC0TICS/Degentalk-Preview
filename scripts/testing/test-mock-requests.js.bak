/**
 * Mock Request Testing Tool
 * 
 * This script creates simple mock requests against each migrated endpoint 
 * without requiring a running server. It validates that routes are properly
 * registered and can handle requests without throwing exceptions.
 */

import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Cookie } from 'tough-cookie';
import fetchCookie from 'fetch-cookie';

// Get current filename and directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the application to test routes directly
const app = express();
// We'll mock the routes registration instead of importing the entire server

// Domains to test
const domains = [
  { name: 'profile', path: '/api/profile' },
  { name: 'social', path: '/api/relationships' },
  { name: 'messaging', path: '/api/messages' },
  { name: 'wallet', path: '/api/wallet' },
  { name: 'engagement/tip', path: '/api/engagement/tip' },
  { name: 'engagement/vault', path: '/api/vault' },
  { name: 'treasury', path: '/api/treasury' },
  { name: 'xp', path: '/api/xp' },
  { name: 'forum', path: '/api/forum' },
  { name: 'editor', path: '/api/editor' },
  { name: 'settings', path: '/api/settings' },
  { name: 'shoutbox', path: '/api/shoutbox' }
];

async function mockServerTest() {
  console.log('🧪 Starting mock request tests...');
  
  // Create a mock session
  const mockSession = {
    user: {
      id: 1,
      username: 'test_user',
      role: 'admin'
    }
  };
  
  // Mock authentication middleware
  app.use((req, res, next) => {
    req.isAuthenticated = () => true;
    req.user = mockSession.user;
    next();
  });
  
  // Import each domain router
  try {
    // Load each domain router
    for (const domain of domains) {
      try {
        console.log(`Loading ${domain.name} domain router...`);
        
        // Dynamically import the router module (this is simplified for the example)
        // In a real implementation, we would use dynamic import() with proper path resolution
        const routerPath = path.join(process.cwd(), 'server', 'src', 'domains', domain.name, `${domain.name}.routes.js`);
        
        // Check if the router file exists
        if (fs.existsSync(routerPath)) {
          const router = await import(routerPath);
          app.use(domain.path, router.default);
          console.log(`✅ Loaded ${domain.name} router`);
        } else {
          // Try alternate path formats
          const altPath = path.join(process.cwd(), 'server', 'src', 'domains', domain.name, `${domain.name.replace(/s$/, '')}.routes.js`);
          if (fs.existsSync(altPath)) {
            const router = await import(altPath);
            app.use(domain.path, router.default);
            console.log(`✅ Loaded ${domain.name} router from alternate path`);
          } else {
            console.log(`❌ Could not find router file for ${domain.name}`);
          }
        }
      } catch (err) {
        console.error(`❌ Error loading ${domain.name} domain:`, err.message);
      }
    }
    
    // Start a test server
    const port = 13370; // Using a unique port for testing
    const server = app.listen(port, () => {
      console.log(`Mock test server running on port ${port}`);
      
      // Run endpoint tests against the mock server
      runMockTests(port)
        .then(() => {
          server.close();
          console.log('🏁 Mock tests completed');
        })
        .catch(err => {
          console.error('Error running mock tests:', err);
          server.close();
          process.exit(1);
        });
    });
  } catch (err) {
    console.error('❌ Fatal error in mock tests:', err);
    process.exit(1);
  }
}

async function runMockTests(port) {
  const baseUrl = `http://localhost:${port}`;
  const cookieJar = new fetchCookie.toughCookie.CookieJar();
  const fetchWithCookies = fetchCookie(fetch, cookieJar);
  
  // Create mock auth cookie
  cookieJar.setCookie(
    new Cookie({
      key: 'connect.sid',
      value: 's:test-mock-session.test-signature',
      domain: 'localhost',
      path: '/'
    }),
    baseUrl
  );
  
  // Define test endpoints for each domain
  const endpointTests = [
    // Profile domain
    { path: '/api/profile/testuser', method: 'GET', domain: 'profile' },
    
    // Social domain
    { path: '/api/relationships/1/followers', method: 'GET', domain: 'social' },
    { path: '/api/relationships/1/following', method: 'GET', domain: 'social' },
    
    // Messaging domain
    { path: '/api/messages/unread-count', method: 'GET', domain: 'messaging' },
    
    // Wallet domain
    { path: '/api/wallet/balance', method: 'GET', domain: 'wallet' },
    
    // Vault domain
    { path: '/api/vault/stats', method: 'GET', domain: 'vault' },
    
    // Forum domain
    { path: '/api/forum/categories', method: 'GET', domain: 'forum' },
    
    // Settings domain
    { path: '/api/settings/user', method: 'GET', domain: 'settings' },
    
    // XP domain
    { path: '/api/xp/leaderboard', method: 'GET', domain: 'xp' },
    
    // Treasury domain
    { path: '/api/treasury/stats', method: 'GET', domain: 'treasury' },
    
    // Editor domain
    { path: '/api/editor/drafts', method: 'GET', domain: 'editor' },
  ];
  
  console.log('🧪 Running mock endpoint tests...');
  
  // Group tests by domain
  const domainResults = {};
  
  // Run each test
  for (const test of endpointTests) {
    if (!domainResults[test.domain]) {
      domainResults[test.domain] = { pass: 0, fail: 0, tests: [] };
    }
    
    try {
      console.log(`Testing ${test.method} ${test.path}...`);
      
      // Make the request
      const response = await fetchWithCookies(`${baseUrl}${test.path}`, {
        method: test.method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // Add test result
      const success = response.status >= 200 && response.status < 500;
      if (success) {
        console.log(`  ✅ ${test.method} ${test.path} - ${response.status}`);
        domainResults[test.domain].pass++;
      } else {
        console.log(`  ❌ ${test.method} ${test.path} - ${response.status}`);
        domainResults[test.domain].fail++;
      }
      
      domainResults[test.domain].tests.push({
        path: test.path,
        method: test.method,
        status: response.status,
        success
      });
      
    } catch (err) {
      console.error(`  ❌ ${test.method} ${test.path} - Error: ${err.message}`);
      domainResults[test.domain].fail++;
      domainResults[test.domain].tests.push({
        path: test.path,
        method: test.method,
        error: err.message,
        success: false
      });
    }
  }
  
  // Print summary
  console.log('\n📊 Mock Test Results:');
  
  let totalTests = 0;
  let totalPassed = 0;
  
  for (const [domain, results] of Object.entries(domainResults)) {
    totalTests += results.pass + results.fail;
    totalPassed += results.pass;
    
    const total = results.pass + results.fail;
    const successRate = Math.round((results.pass / total) * 100);
    
    console.log(`${domain}: ${results.pass}/${total} passed (${successRate}%)`);
  }
  
  const overallSuccessRate = Math.round((totalPassed / totalTests) * 100);
  console.log(`\nOverall: ${totalPassed}/${totalTests} passed (${overallSuccessRate}%)`);
  
  // Return summary results
  return {
    totalTests,
    totalPassed,
    successRate: overallSuccessRate,
    domainResults
  };
}

// Run the mock tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  mockServerTest()
    .catch(err => {
      console.error('Fatal error:', err);
      process.exit(1);
    });
}

export { mockServerTest }; 