/**
 * Routes Migration Validation Script
 * 
 * This script tests all migrated API routes to ensure they function correctly post-migration.
 * - Performs HTTP requests to all endpoints
 * - Compares responses with expected patterns
 * - Generates a report of pass/fail statuses
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');

// Configure testing environment
const BASE_URL = 'http://localhost:3000/api';
const REPORT_PATH = path.join(__dirname, '../logs/route-validation-report.json');
const LOG_PATH = path.join(__dirname, '../logs/route-validation.log');

// Mock authentication token for testing authenticated routes
// This should be replaced with a real token for testing
const TEST_AUTH_TOKEN = 'test-token'; 

/**
 * Route definitions by domain
 * Each entry contains:
 * - path: API endpoint path
 * - method: HTTP method
 * - auth: Whether authentication is required
 * - expectData: Response should contain this data structure
 * - requestBody: Request body for POST/PUT requests
 */
const routeTests = {
  // Profile domain tests
  profile: [
    { 
      path: '/profile/testuser', 
      method: 'get',
      expectData: { username: true, id: true } 
    }
  ],
  
  // Social domain tests
  social: [
    { 
      path: '/relationships/1/followers', 
      method: 'get',
      expectData: { 0: { username: true } } 
    },
    { 
      path: '/relationships/1/following', 
      method: 'get',
      expectData: { 0: { username: true } } 
    },
    { 
      path: '/relationships/is-following/1', 
      method: 'get',
      auth: true,
      expectData: { isFollowing: true } 
    }
  ],
  
  // Messaging domain tests
  messaging: [
    { 
      path: '/messages/conversations', 
      method: 'get',
      auth: true,
      expectData: { 0: { username: true } } 
    },
    { 
      path: '/messages/unread-count', 
      method: 'get',
      auth: true,
      expectData: { total: true } 
    }
  ],
  
  // Wallet domain tests
  wallet: [
    { 
      path: '/wallet/balance', 
      method: 'get',
      auth: true,
      expectData: { dgtBalance: true } 
    },
    { 
      path: '/wallet/transactions', 
      method: 'get',
      auth: true,
      expectData: { transactions: true } 
    }
  ],
  
  // Engagement vault tests
  vault: [
    { 
      path: '/vault/1', 
      method: 'get',
      expectData: { 0: { userId: true } } 
    },
    { 
      path: '/vault/stats', 
      method: 'get',
      expectData: { totalLocked: true } 
    }
  ],
  
  // Forum domain tests
  forum: [
    { 
      path: '/forum/categories', 
      method: 'get',
      expectData: { categories: true } 
    },
    { 
      path: '/forum/trending', 
      method: 'get',
      expectData: { threads: true } 
    }
  ],
  
  // Settings domain tests
  settings: [
    { 
      path: '/settings/user', 
      method: 'get',
      auth: true,
      expectData: { theme: true } 
    }
  ],
  
  // XP domain tests
  xp: [
    { 
      path: '/xp/leaderboard', 
      method: 'get',
      expectData: { 0: { username: true, xp: true } } 
    }
  ],
  
  // Treasury domain tests
  treasury: [
    { 
      path: '/treasury/stats', 
      method: 'get',
      expectData: { totalBalance: true } 
    }
  ],
  
  // Editor domain tests
  editor: [
    { 
      path: '/editor/drafts', 
      method: 'get',
      auth: true,
      expectData: { drafts: true } 
    }
  ],
};

/**
 * Runs tests for all routes and generates a validation report
 */
async function validateRoutes() {
  console.log(colors.cyan('🧪 Starting route validation tests...'));
  
  const results = {};
  const startTime = Date.now();
  let totalTests = 0;
  let passedTests = 0;
  let skippedTests = 0;
  
  // Create log directory if it doesn't exist
  const logDir = path.dirname(LOG_PATH);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // Append to log file
  const logStream = fs.createWriteStream(LOG_PATH, { flags: 'a' });
  logStream.write(`\n\n==== Route Validation Test: ${new Date().toISOString()} ====\n`);
  
  // Test each domain
  for (const [domain, tests] of Object.entries(routeTests)) {
    console.log(colors.yellow(`\nTesting ${domain} domain routes...`));
    logStream.write(`\n-- Testing ${domain} domain routes --\n`);
    
    results[domain] = { pass: 0, fail: 0, skip: 0, tests: {} };
    
    // Run each test in the domain
    for (const test of tests) {
      totalTests++;
      const testName = `${test.method.toUpperCase()} ${test.path}`;
      process.stdout.write(`  - ${testName}... `);
      logStream.write(`  ${testName}: `);
      
      // Skip authentication required tests if no token provided
      if (test.auth && !TEST_AUTH_TOKEN) {
        process.stdout.write(colors.yellow('SKIPPED (requires auth)\n'));
        logStream.write('SKIPPED (requires auth)\n');
        results[domain].skip++;
        skippedTests++;
        continue;
      }
      
      try {
        // Prepare request options
        const options = {
          method: test.method,
          url: `${BASE_URL}${test.path}`,
          headers: test.auth ? { 'Authorization': `Bearer ${TEST_AUTH_TOKEN}` } : {},
          timeout: 5000
        };
        
        // Add request body for POST/PUT requests
        if (test.requestBody && (test.method === 'post' || test.method === 'put')) {
          options.data = test.requestBody;
        }
        
        // Execute request
        const response = await axios(options);
        
        // Validate response data matches expected structure
        let dataValid = true;
        if (test.expectData) {
          dataValid = validateResponseData(response.data, test.expectData);
        }
        
        if (response.status >= 200 && response.status < 300 && dataValid) {
          process.stdout.write(colors.green('PASS\n'));
          logStream.write('PASS\n');
          results[domain].pass++;
          passedTests++;
        } else {
          process.stdout.write(colors.red(`FAIL (Status: ${response.status}, Data valid: ${dataValid})\n`));
          logStream.write(`FAIL (Status: ${response.status}, Data valid: ${dataValid})\n`);
          results[domain].fail++;
        }
        
        // Store test details
        results[domain].tests[testName] = {
          status: response.status,
          dataValid,
          endpoint: test.path
        };
      } catch (error) {
        process.stdout.write(colors.red(`FAIL (${error.message})\n`));
        logStream.write(`FAIL (${error.message})\n`);
        results[domain].fail++;
        
        // Store test error details
        results[domain].tests[testName] = {
          status: error.response?.status || 0,
          error: error.message,
          endpoint: test.path
        };
      }
    }
  }
  
  // Calculate results
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  const totalDomains = Object.keys(routeTests).length;
  const successfulDomains = Object.values(results).filter(r => r.fail === 0).length;
  
  // Generate summary
  const summary = {
    timestamp: new Date().toISOString(),
    stats: {
      totalDomains,
      successfulDomains,
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests - skippedTests,
      skippedTests,
      successRate: `${Math.round((passedTests / (totalTests - skippedTests)) * 100)}%`,
      duration: `${duration.toFixed(2)}s`
    },
    domainResults: results
  };
  
  // Save report
  fs.writeFileSync(REPORT_PATH, JSON.stringify(summary, null, 2));
  
  // Print summary
  console.log(colors.cyan('\n📊 Route Validation Summary:'));
  console.log(colors.white(`  Total Domains: ${totalDomains}`));
  console.log(colors.white(`  Successful Domains: ${successfulDomains}`));
  console.log(colors.white(`  Total Tests: ${totalTests}`));
  console.log(colors.white(`  Passed Tests: ${passedTests}`));
  console.log(colors.white(`  Failed Tests: ${totalTests - passedTests - skippedTests}`));
  console.log(colors.white(`  Skipped Tests: ${skippedTests}`));
  console.log(colors.white(`  Success Rate: ${Math.round((passedTests / (totalTests - skippedTests)) * 100)}%`));
  console.log(colors.white(`  Duration: ${duration.toFixed(2)}s`));
  console.log(colors.white(`  Report saved to: ${REPORT_PATH}`));
  
  // Close log file
  logStream.write(`\n-- Summary --\n`);
  logStream.write(`Total Tests: ${totalTests}\n`);
  logStream.write(`Passed: ${passedTests}\n`);
  logStream.write(`Failed: ${totalTests - passedTests - skippedTests}\n`);
  logStream.write(`Skipped: ${skippedTests}\n`);
  logStream.write(`Success Rate: ${Math.round((passedTests / (totalTests - skippedTests)) * 100)}%\n`);
  logStream.write(`Duration: ${duration.toFixed(2)}s\n`);
  logStream.end();
  
  return summary;
}

/**
 * Validates response data against expected structure
 * 
 * @param {any} data - The response data
 * @param {object} expectedPattern - Expected data pattern
 * @returns {boolean} - Whether data matches expected pattern
 */
function validateResponseData(data, expectedPattern) {
  if (!data) return false;
  
  // Handle array patterns
  if (Number.isInteger(parseInt(Object.keys(expectedPattern)[0]))) {
    if (!Array.isArray(data) || data.length === 0) return false;
    
    const firstItemPattern = expectedPattern[0];
    if (typeof firstItemPattern !== 'object') return true;
    
    return validateResponseData(data[0], firstItemPattern);
  }
  
  // Handle object patterns
  for (const [key, expected] of Object.entries(expectedPattern)) {
    if (expected === true) {
      // Key must exist
      if (data[key] === undefined) return false;
    } else if (typeof expected === 'object') {
      // Nested validation
      if (!validateResponseData(data[key], expected)) return false;
    }
  }
  
  return true;
}

// Run validation if script is executed directly
if (require.main === module) {
  validateRoutes()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(colors.red(`Error running validation: ${err.message}`));
      process.exit(1);
    });
}

module.exports = { validateRoutes }; 