const { performance } = require('perf_hooks');
const { HookRunner } = require('./tools/claude-hooks/run-checks.cjs');

async function benchmark() {
  const runner = new HookRunner();
  
  // Test files from the actual project
  const testFiles = [
    'client/src/components/ui/enhanced-button.tsx',
    'server/src/domains/gamification/services/achievement.service.ts', 
    'shared/types/ids.ts'
  ];
  
  console.log('=== Performance Benchmark ===');
  
  // Single file tests
  console.log('\nSingle file checks:');
  const singleFileResults = [];
  
  for (const file of testFiles) {
    const start = performance.now();
    try {
      const errors = await runner.runChecks(file, 'check');
      const end = performance.now();
      const duration = Math.round(end - start);
      console.log(`${file}: ${duration}ms (${errors.length} errors)`);
      singleFileResults.push({ file, duration, errors: errors.length });
    } catch (error) {
      console.log(`${file}: FAILED - ${error.message}`);
    }
  }
  
  // Parallel test
  console.log('\nParallel checks:');
  const parallelStart = performance.now();
  const parallelPromises = testFiles.map(file => {
    const runner = new HookRunner();
    return runner.runChecks(file, 'check').catch(err => ({ error: err.message }));
  });
  
  const parallelResults = await Promise.all(parallelPromises);
  const parallelEnd = performance.now();
  const parallelDuration = Math.round(parallelEnd - parallelStart);
  
  console.log(`All files parallel: ${parallelDuration}ms`);
  
  // Performance analysis
  console.log('\n=== Performance Analysis ===');
  const avgSingleTime = singleFileResults.reduce((sum, r) => sum + r.duration, 0) / singleFileResults.length;
  const totalSingleTime = singleFileResults.reduce((sum, r) => sum + r.duration, 0);
  
  console.log(`Average single file: ${Math.round(avgSingleTime)}ms`);
  console.log(`Total sequential: ${totalSingleTime}ms`);
  console.log(`Total parallel: ${parallelDuration}ms`);
  console.log(`Speedup: ${Math.round(totalSingleTime / parallelDuration * 100) / 100}x`);
  
  // Performance requirements check
  console.log('\n=== Requirements Check ===');
  const meetsFileReq = avgSingleTime < 2000;
  const meetsCommitReq = parallelDuration < 5000;
  
  console.log(`✅ Single file <2s: ${meetsFileReq ? 'PASS' : 'FAIL'} (${Math.round(avgSingleTime)}ms)`);
  console.log(`✅ Commit check <5s: ${meetsCommitReq ? 'PASS' : 'FAIL'} (${parallelDuration}ms)`);
  
  return {
    avgSingleTime,
    parallelTime: parallelDuration,
    meetsRequirements: meetsFileReq && meetsCommitReq
  };
}

// Run benchmark
benchmark().catch(console.error);