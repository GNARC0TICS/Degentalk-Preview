#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { performance } = require('perf_hooks');

class HookRunner {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.hooksDir = path.join(this.projectRoot, '.claude/hooks');
    this.config = this.loadConfig();
    this.stats = {
      filesChecked: 0,
      errorsFound: 0,
      errorsFixed: 0,
      startTime: performance.now()
    };
  }

  loadConfig() {
    const configPath = path.join(this.hooksDir, 'hook-config.json');
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.error('Failed to load hook configuration:', error.message);
      process.exit(1);
    }
  }

  async runChecks(filePath, mode = 'check') {
    const fullPath = path.resolve(filePath);
    const relativePath = path.relative(this.projectRoot, fullPath);
    
    console.log(`Checking ${relativePath}...`);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found: ${fullPath}`);
      return [];
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const allErrors = [];
    let fixedContent = content;

    // Load and run all applicable hooks
    const hooks = this.loadHooks();
    
    for (const hook of hooks) {
      if (this.shouldRunHook(hook, relativePath)) {
        try {
          const errors = hook.check(relativePath, content);
          
          if (errors && errors.length > 0) {
            allErrors.push(...errors.map(err => ({ ...err, hook: hook.name })));
            
            // Auto-fix if in post-edit mode and hook supports it
            if (mode === 'post-edit' && hook.autoFix && this.config.rules[hook.name]?.autoFix) {
              fixedContent = hook.autoFix(relativePath, fixedContent, errors);
              this.stats.errorsFixed += errors.length;
            }
          }
        } catch (error) {
          console.error(`Hook ${hook.name} failed:`, error.message);
        }
      }
    }

    // Write fixed content if changes were made
    if (mode === 'post-edit' && fixedContent !== content) {
      fs.writeFileSync(fullPath, fixedContent, 'utf8');
      console.log(`Auto-fixed ${this.stats.errorsFixed} issues in ${relativePath}`);
    }

    this.stats.filesChecked++;
    this.stats.errorsFound += allErrors.length;

    return allErrors;
  }

  loadHooks() {
    const hooks = [];
    const hookDirs = ['react-app', 'shared', 'server'];
    
    hookDirs.forEach(dir => {
      const dirPath = path.join(this.hooksDir, dir);
      
      if (fs.existsSync(dirPath)) {
        const hookFiles = fs.readdirSync(dirPath)
          .filter(file => file.endsWith('.cjs'));
        
        hookFiles.forEach(file => {
          try {
            const hookPath = path.join(dirPath, file);
            delete require.cache[require.resolve(hookPath)]; // Clear cache
            const hook = require(hookPath);
            hooks.push(hook);
          } catch (error) {
            console.warn(`Failed to load hook ${file}:`, error.message);
          }
        });
      }
    });

    return hooks;
  }

  shouldRunHook(hook, filePath) {
    // Check file patterns
    if (hook.filePatterns) {
      const matches = hook.filePatterns.some(pattern => 
        this.matchesGlob(filePath, pattern)
      );
      if (!matches) return false;
    }

    // Check exclude patterns
    if (hook.excludePatterns) {
      const excluded = hook.excludePatterns.some(pattern => 
        this.matchesGlob(filePath, pattern)
      );
      if (excluded) return false;
    }

    return true;
  }

  matchesGlob(filePath, pattern) {
    // Handle brace expansion like {ts,tsx}
    if (pattern.includes('{') && pattern.includes('}')) {
      const braceMatch = pattern.match(/\{([^}]+)\}/);
      if (braceMatch) {
        const options = braceMatch[1].split(',');
        const basePattern = pattern.replace(braceMatch[0], 'BRACE_PLACEHOLDER');
        
        return options.some(option => {
          const expandedPattern = basePattern.replace('BRACE_PLACEHOLDER', option.trim());
          return this.matchesGlob(filePath, expandedPattern);
        });
      }
    }
    
    // Simple glob matching
    let regex = pattern;
    
    // Handle ** (matches any path including empty)
    regex = regex.replace(/\*\*\//g, '(?:.*/)?');
    regex = regex.replace(/\*\*/g, '.*');
    
    // Handle * (matches any filename characters except /)
    regex = regex.replace(/\*/g, '[^/]*');
    
    // Escape dots
    regex = regex.replace(/\./g, '\\.');
    
    return new RegExp(`^${regex}$`).test(filePath);
  }

  async runPreCommitChecks() {
    let stagedFiles;
    
    try {
      stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
        .split('\n')
        .filter(f => f.trim() !== '' && f.match(/\.(ts|tsx|js|jsx)$/));
    } catch (error) {
      console.error('Failed to get staged files:', error.message);
      return false;
    }

    if (stagedFiles.length === 0) {
      console.log('No TypeScript/JavaScript files staged for commit.');
      return true;
    }

    console.log(`Checking ${stagedFiles.length} staged files...`);
    
    let hasErrors = false;
    const allErrors = [];

    for (const file of stagedFiles) {
      const errors = await this.runChecks(file, 'pre-commit');
      
      if (errors.length > 0) {
        hasErrors = true;
        allErrors.push({ file, errors });
        
        console.error(`\\n❌ ${file}:`);
        errors.forEach(error => {
          console.error(`  Line ${error.line}: ${error.message} (${error.code || error.hook})`);
        });
      } else {
        console.log(`✅ ${file}`);
      }
    }

    if (hasErrors) {
      console.error(`\\n❌ Pre-commit checks failed!`);
      console.error(`Found ${allErrors.length} files with errors.`);
      console.error(`\\nTo skip checks temporarily: SKIP_HOOKS=1 git commit`);
      return false;
    }

    console.log(`\\n✅ All ${stagedFiles.length} files passed pre-commit checks!`);
    return true;
  }

  printStats() {
    const duration = performance.now() - this.stats.startTime;
    console.log(`\\n📊 Hook Statistics:`);
    console.log(`   Files checked: ${this.stats.filesChecked}`);
    console.log(`   Errors found: ${this.stats.errorsFound}`);
    console.log(`   Errors fixed: ${this.stats.errorsFixed}`);
    console.log(`   Duration: ${Math.round(duration)}ms`);
  }
}

// Main execution
async function main() {
  // Check for SKIP_HOOKS environment variable
  if (process.env.SKIP_HOOKS === '1') {
    console.log('Hooks skipped due to SKIP_HOOKS=1');
    process.exit(0);
  }

  const args = process.argv.slice(2);
  
  // Parse arguments
  let mode = 'check';
  let filePath = null;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--mode' && args[i + 1]) {
      mode = args[i + 1];
      i++;
    } else if (args[i] === '--file' && args[i + 1]) {
      filePath = args[i + 1];
      i++;
    } else if (args[i].startsWith('--mode=')) {
      mode = args[i].split('=')[1];
    } else if (args[i].startsWith('--file=')) {
      filePath = args[i].split('=')[1];
    }
  }

  const runner = new HookRunner();
  
  try {
    if (mode === 'pre-commit') {
      const success = await runner.runPreCommitChecks();
      runner.printStats();
      process.exit(success ? 0 : 1);
    } else if (filePath) {
      const errors = await runner.runChecks(filePath, mode);
      
      if (errors.length > 0 && mode === 'pre-edit') {
        console.error(`\\n❌ Found ${errors.length} issues:`);
        errors.forEach(error => {
          console.error(`  Line ${error.line}: ${error.message} (${error.code || error.hook})`);
        });
        runner.printStats();
        process.exit(1);
      } else if (errors.length === 0) {
        console.log('✅ No issues found');
      }
      
      runner.printStats();
      process.exit(0);
    } else {
      console.error('Usage: node run-checks.js --mode <pre-edit|post-edit|pre-commit> [--file <path>]');
      process.exit(1);
    }
  } catch (error) {
    console.error('Hook runner failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { HookRunner };