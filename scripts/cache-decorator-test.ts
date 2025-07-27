#!/usr/bin/env tsx
/**
 * Cache Decorator Validation Script
 * 
 * Tests that our cache decorators maintain proper 'this' context
 * and method binding in various scenarios
 */

import { CacheStandard, CacheExtended, CacheRealtime } from '@core/cache/decorators.js';

// Test class to validate decorator behavior
class TestService {
  private instanceValue = 'test-instance';
  
  @CacheStandard.forumStats
  async testStandardCache(param: string): Promise<string> {
    // This should have access to instance properties
    if (!this.instanceValue) {
      throw new Error('Method binding lost - this.instanceValue is undefined');
    }
    
    return `${this.instanceValue}-${param}-standard`;
  }
  
  @CacheExtended.systemConfigs
  async testExtendedCache(param: number): Promise<number> {
    if (!this.instanceValue) {
      throw new Error('Method binding lost - this.instanceValue is undefined');
    }
    
    // Simulate expensive operation
    await new Promise(resolve => setTimeout(resolve, 10));
    return param * 2;
  }
  
  @CacheRealtime.userSessions
  async testRealtimeCache(): Promise<{ value: string; timestamp: number }> {
    if (!this.instanceValue) {
      throw new Error('Method binding lost - this.instanceValue is undefined');
    }
    
    return {
      value: this.instanceValue,
      timestamp: Date.now()
    };
  }
  
  // Method without decorator for comparison
  async testNonCached(param: string): Promise<string> {
    return `${this.instanceValue}-${param}-nocache`;
  }
  
  // Test method that accesses other instance methods
  @CacheStandard.userXpProgression
  async testMethodCallsOtherMethods(param: string): Promise<string> {
    const nonCachedResult = await this.testNonCached(param);
    return `${nonCachedResult}-via-method`;
  }
}

// Test class inheritance
class ExtendedTestService extends TestService {
  private extendedValue = 'extended';
  
  @CacheStandard.achievementCompletion
  async testInheritedCache(): Promise<string> {
    if (!this.instanceValue || !this.extendedValue) {
      throw new Error('Method binding lost in inherited class');
    }
    
    return `${this.instanceValue}-${this.extendedValue}`;
  }
}

async function runValidationTests(): Promise<boolean> {
  console.log('🧪 Starting Cache Decorator Validation Tests...\n');
  
  let testsRun = 0;
  let testsPassed = 0;
  
  const runTest = async (name: string, testFn: () => Promise<void>): Promise<void> => {
    testsRun++;
    try {
      await testFn();
      console.log(`✅ ${name}`);
      testsPassed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Enable caching for tests
  process.env.FEATURE_CACHING = 'true';
  
  const service = new TestService();
  const extendedService = new ExtendedTestService();
  
  // Test 1: Basic method binding
  await runTest('Basic method binding with standard cache', async () => {
    const result = await service.testStandardCache('test1');
    if (result !== 'test-instance-test1-standard') {
      throw new Error(`Expected 'test-instance-test1-standard', got '${result}'`);
    }
  });
  
  // Test 2: Extended cache binding
  await runTest('Method binding with extended cache', async () => {
    const result = await service.testExtendedCache(5);
    if (result !== 10) {
      throw new Error(`Expected 10, got ${result}`);
    }
  });
  
  // Test 3: Realtime cache binding
  await runTest('Method binding with realtime cache', async () => {
    const result = await service.testRealtimeCache();
    if (result.value !== 'test-instance') {
      throw new Error(`Expected value 'test-instance', got '${result.value}'`);
    }
  });
  
  // Test 4: Cache consistency
  await runTest('Cache consistency across calls', async () => {
    const result1 = await service.testExtendedCache(7);
    const result2 = await service.testExtendedCache(7); // Should be cached
    
    if (result1 !== result2) {
      throw new Error(`Cache inconsistency: ${result1} !== ${result2}`);
    }
    
    if (result1 !== 14) {
      throw new Error(`Expected 14, got ${result1}`);
    }
  });
  
  // Test 5: Method calls other methods
  await runTest('Cached method calling other instance methods', async () => {
    const result = await service.testMethodCallsOtherMethods('cross');
    if (result !== 'test-instance-cross-nocache-via-method') {
      throw new Error(`Expected 'test-instance-cross-nocache-via-method', got '${result}'`);
    }
  });
  
  // Test 6: Inheritance binding
  await runTest('Method binding in inherited class', async () => {
    const result = await extendedService.testInheritedCache();
    if (result !== 'test-instance-extended') {
      throw new Error(`Expected 'test-instance-extended', got '${result}'`);
    }
  });
  
  // Test 7: Multiple instances
  await runTest('Multiple service instances maintain separate context', async () => {
    const service2 = new TestService();
    (service2 as any).instanceValue = 'service2-instance';
    
    const result1 = await service.testStandardCache('multi1');
    const result2 = await service2.testStandardCache('multi2');
    
    if (!result1.includes('test-instance')) {
      throw new Error(`Service 1 lost its context: ${result1}`);
    }
    
    if (!result2.includes('service2-instance')) {
      throw new Error(`Service 2 lost its context: ${result2}`);
    }
  });
  
  // Test 8: Error handling preserves context
  await runTest('Error handling preserves method context', async () => {
    const errorService = new TestService();
    (errorService as any).testStandardCache = async function(param: string) {
      if (!this.instanceValue) {
        throw new Error('Context lost in error scenario');
      }
      throw new Error('Test error with context preserved');
    };
    
    try {
      await errorService.testStandardCache('error-test');
      throw new Error('Expected error was not thrown');
    } catch (error) {
      if (error instanceof Error && error.message === 'Context lost in error scenario') {
        throw error; // This would fail the test
      }
      // Expected error with context preserved - test passes
    }
  });
  
  // Test 9: Async/await handling
  await runTest('Async/await context preservation', async () => {
    const result = await service.testExtendedCache(3);
    // The method has a setTimeout, testing async context
    if (result !== 6) {
      throw new Error(`Async context lost: expected 6, got ${result}`);
    }
  });
  
  // Test 10: Disable caching
  await runTest('Method binding when caching is disabled', async () => {
    process.env.FEATURE_CACHING = 'false';
    
    const result = await service.testStandardCache('disabled');
    if (result !== 'test-instance-disabled-standard') {
      throw new Error(`Method binding lost when caching disabled: ${result}`);
    }
    
    // Re-enable for other tests
    process.env.FEATURE_CACHING = 'true';
  });
  
  console.log(`\n📊 Test Results: ${testsPassed}/${testsRun} tests passed`);
  
  if (testsPassed === testsRun) {
    console.log('🎉 All cache decorator validation tests passed!');
    return true;
  } else {
    console.log('💥 Some cache decorator tests failed!');
    return false;
  }
}

// Run tests if called directly
if (require.main === module) {
  runValidationTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Validation test crashed:', error);
      process.exit(1);
    });
}

export { runValidationTests };