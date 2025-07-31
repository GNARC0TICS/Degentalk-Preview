#!/usr/bin/env node

/**
 * Fast TypeScript type checking using project references
 * Achieves <5s incremental builds by leveraging tsbuildinfo caches
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import ora from 'ora';

const ROOT_DIR = process.cwd();
const CACHE_DIR = join(ROOT_DIR, '.tscache');

// Ensure cache directory exists
if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

const projects = [
  { name: 'shared', path: './shared/tsconfig.json' },
  { name: 'db', path: './db/tsconfig.json' },
  { name: 'server', path: './server/tsconfig.json' },
  { name: 'client', path: './client/tsconfig.json' },
  { name: 'scripts', path: './scripts/tsconfig.json' }
];

async function checkProject(project) {
  const spinner = ora(`Checking ${project.name}...`).start();
  
  try {
    const start = Date.now();
    
    // Use project references for fast incremental builds
    execSync(`npx tsc -b ${project.path}`, {
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    const duration = Date.now() - start;
    spinner.succeed(chalk.green(`✓ ${project.name} (${duration}ms)`));
    
    return { success: true, duration };
  } catch (error) {
    spinner.fail(chalk.red(`✗ ${project.name}`));
    
    // Extract and format TypeScript errors
    const output = error.stdout || error.stderr || error.toString();
    console.error(chalk.red(output));
    
    return { success: false, error: output };
  }
}

async function main() {
  console.log(chalk.blue('\n🚀 Fast TypeScript Type Checking\n'));
  
  const startTime = Date.now();
  const results = [];
  
  // Check shared first as it's a dependency
  results.push(await checkProject(projects[0]));
  
  // Check db and other projects in parallel
  const parallelResults = await Promise.all(
    projects.slice(1).map(checkProject)
  );
  
  results.push(...parallelResults);
  
  const totalDuration = Date.now() - startTime;
  const hasErrors = results.some(r => !r.success);
  
  console.log(chalk.blue(`\n⏱️  Total time: ${totalDuration}ms`));
  
  if (hasErrors) {
    console.log(chalk.red('\n❌ Type checking failed!\n'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All type checks passed!\n'));
    
    // Show individual timings
    console.log(chalk.gray('Individual timings:'));
    results.forEach((result, i) => {
      if (result.success) {
        console.log(chalk.gray(`  - ${projects[i].name}: ${result.duration}ms`));
      }
    });
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\nType checking interrupted.'));
  process.exit(1);
});

main().catch(error => {
  console.error(chalk.red('Unexpected error:'), error);
  process.exit(1);
});