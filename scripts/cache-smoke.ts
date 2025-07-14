#!/usr/bin/env tsx
/**
 * Cache Smoke Test
 * 
 * Validates that the new caching system is working correctly
 * Tests both cache hits and misses with actual API endpoints
 */

import { performance } from 'perf_hooks';

interface SmokeTestResult {
  endpoint: string;
  firstCallMs: number;
  secondCallMs: number;
  cacheWorking: boolean;
  error?: string;
}

class CacheSmokeTest {
  private baseUrl: string;
  private results: SmokeTestResult[] = [];
  
  constructor() {
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:5001';
  }
  
  async run(): Promise<boolean> {
    console.log('🔧 Cache Smoke Test Starting...');
    console.log(`Target: ${this.baseUrl}`);
    
    // Enable caching for this test
    process.env.FEATURE_CACHING = 'true';
    
    const testEndpoints = [
      '/api/forum/stats',
      '/api/platform/stats', 
      '/api/admin/analytics/platform-stats'
    ];
    
    let allPassed = true;
    
    for (const endpoint of testEndpoints) {
      try {
        const result = await this.testEndpoint(endpoint);
        this.results.push(result);
        
        if (result.cacheWorking) {
          console.log(`✅ ${endpoint} - Cache working (${result.firstCallMs}ms → ${result.secondCallMs}ms)`);
        } else {
          console.log(`❌ ${endpoint} - Cache not working (${result.firstCallMs}ms → ${result.secondCallMs}ms)`);
          allPassed = false;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`❌ ${endpoint} - Test failed: ${errorMessage}`);
        this.results.push({
          endpoint,
          firstCallMs: 0,
          secondCallMs: 0,
          cacheWorking: false,
          error: errorMessage
        });
        allPassed = false;
      }
    }
    
    await this.printSummary();
    return allPassed;
  }
  
  private async testEndpoint(endpoint: string): Promise<SmokeTestResult> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // First call - should be slow (cache miss)
    const start1 = performance.now();
    const response1 = await this.makeRequest(url);
    const firstCallMs = Math.round(performance.now() - start1);
    
    if (!response1.ok) {
      throw new Error(`HTTP ${response1.status}: ${response1.statusText}`);
    }
    
    // Small delay to ensure cache has time to set
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Second call - should be fast (cache hit)
    const start2 = performance.now();
    const response2 = await this.makeRequest(url);
    const secondCallMs = Math.round(performance.now() - start2);
    
    if (!response2.ok) {
      throw new Error(`Second call failed - HTTP ${response2.status}: ${response2.statusText}`);
    }
    
    // Check if responses are identical (cache consistency)
    const data1 = await response1.text();
    const data2 = await response2.text();
    
    if (data1 !== data2) {
      throw new Error('Cache inconsistency: responses differ');
    }
    
    // Cache is working if second call is significantly faster
    // Allow some variance for network/processing time
    const speedupRatio = firstCallMs / Math.max(secondCallMs, 1);
    const cacheWorking = speedupRatio > 1.5 && secondCallMs < firstCallMs;
    
    return {
      endpoint,
      firstCallMs,
      secondCallMs,
      cacheWorking
    };
  }
  
  private async makeRequest(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CacheSmokeTest/1.0'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  
  private async printSummary(): Promise<void> {
    console.log('\n📊 Cache Smoke Test Summary:');
    console.log('=' + '='.repeat(60));
    
    const passed = this.results.filter(r => r.cacheWorking).length;
    const total = this.results.length;
    const failed = this.results.filter(r => r.error).length;
    
    console.log(`Tests Passed: ${passed}/${total}`);
    console.log(`Tests Failed: ${failed}/${total}`);
    
    if (this.results.length > 0) {
      const avgSpeedup = this.results
        .filter(r => r.cacheWorking)
        .reduce((sum, r) => sum + (r.firstCallMs / Math.max(r.secondCallMs, 1)), 0) / 
        Math.max(passed, 1);
      
      console.log(`Average Speedup: ${avgSpeedup.toFixed(1)}x`);
    }
    
    // Detailed results
    console.log('\n📈 Detailed Results:');
    this.results.forEach(result => {
      const status = result.error ? '❌ ERROR' : 
                    result.cacheWorking ? '✅ CACHED' : '⚠️  NO CACHE';
      const speedup = result.secondCallMs > 0 ? 
        `${(result.firstCallMs / result.secondCallMs).toFixed(1)}x` : 'N/A';
      
      console.log(`${status} ${result.endpoint}`);
      console.log(`       First: ${result.firstCallMs}ms | Second: ${result.secondCallMs}ms | Speedup: ${speedup}`);
      if (result.error) {
        console.log(`       Error: ${result.error}`);
      }
    });
    
    console.log('\n' + '='.repeat(62));
  }
}

// Health check mode - just verify server is running
async function healthCheck(): Promise<boolean> {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:5001';
  
  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      console.log('✅ Server health check passed');
      return true;
    } else {
      console.log(`❌ Server health check failed: HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Server health check failed: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

// Main execution
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const isHealthCheck = args.includes('--health');
  const isVerbose = args.includes('--verbose');
  
  if (isVerbose) {
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      API_BASE_URL: process.env.API_BASE_URL,
      FEATURE_CACHING: process.env.FEATURE_CACHING
    });
  }
  
  let success: boolean;
  
  if (isHealthCheck) {
    success = await healthCheck();
  } else {
    const tester = new CacheSmokeTest();
    success = await tester.run();
  }
  
  if (success) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n💥 Some tests failed!');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Smoke test crashed:', error);
    process.exit(1);
  });
}

export { CacheSmokeTest };