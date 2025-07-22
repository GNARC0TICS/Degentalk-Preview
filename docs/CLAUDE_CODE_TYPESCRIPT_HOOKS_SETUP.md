# Cloud Code TypeScript Hooks Integration Plan

## Overview

This document provides a comprehensive plan for integrating the Cloud Code TypeScript Hooks extension from [github.com/bartolli/claude-code-typescript-hooks](https://github.com/bartolli/claude-code-typescript-hooks) into DegenTalk's development workflow. This extension will provide automated code quality checks and prevent common TypeScript errors before runtime.

## Integration Benefits

1. **Automated Type Safety**: Real-time detection of branded ID mismatches
2. **Code Quality**: Enforce DegenTalk's strict coding standards
3. **Prevention**: Stop common errors (console.*, any types) before commit
4. **Consistency**: Ensure all code follows project conventions
5. **Productivity**: Fix trivial issues automatically

## Prerequisites Checklist

- [ ] Node.js v18+ installed
- [ ] TypeScript 5.0+ in all workspaces
- [ ] ESLint configuration present
- [ ] Prettier configuration present
- [ ] `.claude/settings.local.json` exists
- [ ] Git repository initialized

## Phase 1: Installation & Configuration

### 1.1 Clone and Install Extension

```bash
# Clone the extension to a tools directory
mkdir -p tools/claude-hooks
cd tools/claude-hooks
git clone https://github.com/bartolli/claude-code-typescript-hooks.git .

# Install dependencies
pnpm install
```

### 1.2 Create Hook Directory Structure

```bash
# Create Claude hooks directory
mkdir -p .claude/hooks/react-app
mkdir -p .claude/hooks/shared
mkdir -p .claude/hooks/server
```

### 1.3 Configure Extension Settings

Create `.claude/hooks/hook-config.json`:

```json
{
  "typescript": {
    "enabled": true,
    "strict": true,
    "checkBrandedIds": true,
    "configCache": ".claude/hooks/.tscache"
  },
  "eslint": {
    "enabled": true,
    "autoFix": true,
    "extensions": [".ts", ".tsx"],
    "ignorePatterns": ["*.test.ts", "*.spec.ts"]
  },
  "prettier": {
    "enabled": true,
    "autoFormat": true
  },
  "rules": {
    "noConsole": {
      "enabled": true,
      "severity": "error",
      "autoFix": true,
      "replacement": "logger"
    },
    "noAny": {
      "enabled": true,
      "severity": "error",
      "allowExplicit": false
    },
    "brandedIds": {
      "enabled": true,
      "severity": "error",
      "importFrom": "@shared/types/ids"
    },
    "imports": {
      "enforceAliases": true,
      "noRelativeImports": true,
      "allowedAliases": ["@/", "@shared/", "@config/"]
    }
  },
  "projectType": "monorepo",
  "workspaces": {
    "client": {
      "type": "react-app",
      "tsconfig": "./client/tsconfig.json"
    },
    "server": {
      "type": "node-app",
      "tsconfig": "./server/tsconfig.json"
    },
    "shared": {
      "type": "library",
      "tsconfig": "./shared/tsconfig.json"
    }
  }
}
```

## Phase 2: DegenTalk-Specific Rules

### 2.1 Branded ID Validation Hook

Create `.claude/hooks/react-app/check-branded-ids.js`:

```javascript
const { readFileSync } = require('fs');
const ts = require('typescript');

module.exports = {
  name: 'check-branded-ids',
  description: 'Validate branded ID usage in DegenTalk',
  filePatterns: ['**/*.{ts,tsx}'],
  
  check(filePath, content) {
    const errors = [];
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true
    );
    
    // Check for numeric ID comparisons
    const numericComparisons = content.match(/\b(userId|forumId|threadId|postId)\s*[><=]\s*\d+/g);
    if (numericComparisons) {
      errors.push({
        line: 0, // Would need proper line calculation
        message: 'Use isValidId() for ID validation instead of numeric comparison',
        severity: 'error',
        fix: (match) => match.replace(/(\w+)\s*>\s*0/, 'isValidId($1)')
      });
    }
    
    // Check for useState<number> with ID types
    const useStateErrors = content.match(/useState<number>\s*\([^)]*\).*(?:setDraftId|setForumId|setThreadId)/g);
    if (useStateErrors) {
      errors.push({
        line: 0,
        message: 'Use branded ID type instead of number',
        severity: 'error'
      });
    }
    
    return errors;
  }
};
```

### 2.2 Console Statement Hook

Create `.claude/hooks/shared/no-console.js`:

```javascript
module.exports = {
  name: 'no-console',
  description: 'Replace console.* with logger.*',
  filePatterns: ['**/*.{ts,tsx,js,jsx}'],
  excludePatterns: ['**/*.test.*', '**/*.spec.*', '**/scripts/**'],
  
  check(filePath, content) {
    const errors = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const consoleMatch = line.match(/console\.(log|error|warn|info|debug)/);
      if (consoleMatch) {
        const method = consoleMatch[1];
        errors.push({
          line: index + 1,
          column: consoleMatch.index,
          message: `Use logger.${method} instead of console.${method}`,
          severity: 'error',
          fix: () => line.replace(`console.${method}`, `logger.${method}`)
        });
      }
    });
    
    return errors;
  }
};
```

### 2.3 Import Validation Hook

Create `.claude/hooks/shared/validate-imports.js`:

```javascript
module.exports = {
  name: 'validate-imports',
  description: 'Enforce import conventions',
  filePatterns: ['**/*.{ts,tsx}'],
  
  check(filePath, content) {
    const errors = [];
    const lines = content.split('\n');
    
    // Check for @db/types imports (forbidden)
    if (content.includes("from '@db/types'")) {
      errors.push({
        line: 0,
        message: 'Import from @shared/types/ids instead of @db/types',
        severity: 'error'
      });
    }
    
    // Check for relative imports crossing boundaries
    const relativeImports = content.match(/from ['"]\.\.\/\.\.\//g);
    if (relativeImports && filePath.includes('/src/')) {
      errors.push({
        line: 0,
        message: 'Use path aliases instead of relative imports',
        severity: 'warning'
      });
    }
    
    return errors;
  }
};
```

## Phase 3: Integration with Claude Settings

### 3.1 Update Claude Settings

Update `.claude/settings.local.json`:

```json
{
  "permissions": {
    "allow": [
      // ... existing permissions ...
      "Bash(node tools/claude-hooks/run-checks.js:*)"
    ]
  },
  "hooks": {
    "beforeEdit": [
      "node tools/claude-hooks/run-checks.js --file {file} --mode pre-edit"
    ],
    "afterEdit": [
      "node tools/claude-hooks/run-checks.js --file {file} --mode post-edit"
    ],
    "beforeCommit": [
      "node tools/claude-hooks/run-checks.js --mode pre-commit"
    ]
  }
}
```

### 3.2 Create Hook Runner Script

Create `tools/claude-hooks/run-checks.js`:

```javascript
#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const mode = args.find(arg => arg.startsWith('--mode=')).split('=')[1];
const file = args.find(arg => arg.startsWith('--file='))?.split('=')[1];

const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../.claude/hooks/hook-config.json'), 'utf8')
);

function runChecks(filePath) {
  const errors = [];
  
  // Run TypeScript check
  if (config.typescript.enabled) {
    try {
      execSync(`npx tsc --noEmit ${filePath}`, { stdio: 'pipe' });
    } catch (error) {
      errors.push({
        tool: 'typescript',
        message: error.stdout.toString()
      });
    }
  }
  
  // Run ESLint
  if (config.eslint.enabled) {
    try {
      const eslintCmd = config.eslint.autoFix 
        ? `npx eslint --fix ${filePath}`
        : `npx eslint ${filePath}`;
      execSync(eslintCmd, { stdio: 'pipe' });
    } catch (error) {
      errors.push({
        tool: 'eslint',
        message: error.stdout.toString()
      });
    }
  }
  
  // Run custom hooks
  const hooksDir = path.join(__dirname, '../../.claude/hooks');
  const customHooks = fs.readdirSync(hooksDir)
    .filter(f => f.endsWith('.js') && f !== 'hook-config.json');
  
  customHooks.forEach(hookFile => {
    const hook = require(path.join(hooksDir, hookFile));
    const content = fs.readFileSync(filePath, 'utf8');
    const hookErrors = hook.check(filePath, content);
    
    if (hookErrors.length > 0) {
      errors.push({
        tool: hook.name,
        errors: hookErrors
      });
    }
  });
  
  return errors;
}

// Main execution
if (mode === 'pre-edit' && file) {
  const errors = runChecks(file);
  if (errors.length > 0) {
    console.error('Pre-edit checks failed:', JSON.stringify(errors, null, 2));
    process.exit(1);
  }
} else if (mode === 'post-edit' && file) {
  const errors = runChecks(file);
  // Auto-fix if possible
  if (errors.length > 0) {
    console.log('Running auto-fixes...');
    // Apply fixes
  }
} else if (mode === 'pre-commit') {
  // Run on all staged files
  const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
    .split('\n')
    .filter(f => f.match(/\.(ts|tsx|js|jsx)$/));
  
  let hasErrors = false;
  stagedFiles.forEach(file => {
    const errors = runChecks(file);
    if (errors.length > 0) {
      hasErrors = true;
      console.error(`Errors in ${file}:`, errors);
    }
  });
  
  if (hasErrors) {
    process.exit(1);
  }
}
```

## Phase 4: Performance Optimizations

### 4.1 TypeScript Config Cache

Create `.claude/hooks/.tscache/config.json`:

```json
{
  "lastCheck": null,
  "configHashes": {},
  "compilationCache": {}
}
```

### 4.2 Parallel Processing

Update hook runner for parallel checks:

```javascript
const { Worker } = require('worker_threads');

async function runChecksParallel(files) {
  const workers = [];
  const numWorkers = Math.min(files.length, 4); // Max 4 workers
  
  for (let i = 0; i < numWorkers; i++) {
    workers.push(new Worker('./check-worker.js'));
  }
  
  // Distribute files among workers
  const results = await Promise.all(
    files.map((file, index) => {
      const worker = workers[index % numWorkers];
      return new Promise((resolve) => {
        worker.postMessage({ file });
        worker.once('message', resolve);
      });
    })
  );
  
  // Cleanup workers
  workers.forEach(w => w.terminate());
  
  return results;
}
```

## Phase 5: Validation & Testing

### 5.1 Test Suite

Create `tools/claude-hooks/test-hooks.js`:

```javascript
const assert = require('assert');
const { runChecks } = require('./run-checks');

// Test branded ID detection
const testBrandedIds = () => {
  const testContent = `
    const [draftId, setDraftId] = useState<number>(0);
    if (forumId > 0) { /* should error */ }
  `;
  
  const errors = runChecks('test.tsx', testContent);
  assert(errors.some(e => e.message.includes('branded ID')));
  console.log('✓ Branded ID detection working');
};

// Test console detection
const testConsole = () => {
  const testContent = `console.log('test');`;
  const errors = runChecks('test.ts', testContent);
  assert(errors.some(e => e.message.includes('logger')));
  console.log('✓ Console detection working');
};

// Run all tests
testBrandedIds();
testConsole();
console.log('All tests passed!');
```

### 5.2 Integration Test

```bash
# Test pre-commit hook
echo "console.log('test')" > test-file.ts
git add test-file.ts
git commit -m "Test hooks" # Should fail

# Test auto-fix
node tools/claude-hooks/run-checks.js --file test-file.ts --mode post-edit
cat test-file.ts # Should show logger.log
```

## Phase 6: Documentation & Training

### 6.1 Developer Guide

Create `.claude/hooks/README.md`:

```markdown
# DegenTalk TypeScript Hooks

## Overview
Automated code quality checks for DegenTalk development.

## What Gets Checked
- Branded ID usage (no numeric comparisons)
- Console statements (use logger instead)
- Import patterns (enforce aliases)
- TypeScript strict mode
- ESLint rules
- Prettier formatting

## Manual Override
If you need to bypass hooks temporarily:
```bash
SKIP_HOOKS=1 git commit -m "Emergency fix"
```

## Adding New Rules
1. Create `.claude/hooks/your-rule.js`
2. Export check function
3. Test with `npm test`
```

### 6.2 Error Messages Guide

```javascript
// Helpful error messages
const ERROR_MESSAGES = {
  BRANDED_ID: `
    Error: Using numeric comparison with branded ID
    
    ❌ Bad:  if (forumId > 0)
    ✅ Good: if (isValidId(forumId))
    
    Import: import { isValidId } from '@shared/utils/id';
  `,
  
  CONSOLE: `
    Error: Direct console usage detected
    
    ❌ Bad:  console.log('debug', data)
    ✅ Good: logger.debug('debug', data)
    
    Import: import { logger } from '@/lib/logger';
  `
};
```

## Implementation Checklist

### Week 1: Setup & Basic Hooks
- [ ] Clone and configure extension
- [ ] Create hook directory structure
- [ ] Implement branded ID validation
- [ ] Implement console replacement
- [ ] Test with sample files

### Week 2: Integration & Testing
- [ ] Update Claude settings
- [ ] Create hook runner script
- [ ] Add pre-commit integration
- [ ] Test on real codebase
- [ ] Fix any performance issues

### Week 3: Advanced Rules & Optimization
- [ ] Add import validation
- [ ] Implement caching
- [ ] Add parallel processing
- [ ] Create comprehensive tests
- [ ] Document all features

### Week 4: Rollout & Training
- [ ] Team documentation
- [ ] Error message improvements
- [ ] Performance monitoring
- [ ] Gradual rollout (opt-in → mandatory)
- [ ] Gather feedback and iterate

## Success Metrics

1. **Error Prevention**: 90% reduction in branded ID errors
2. **Build Time**: <5s impact on commit time
3. **Auto-fix Rate**: 80% of issues fixed automatically
4. **Developer Satisfaction**: Positive feedback on productivity

## Rollback Plan

If issues arise:
1. Set `SKIP_HOOKS=1` environment variable
2. Remove hooks from `.claude/settings.local.json`
3. Keep extension installed but disabled
4. Address issues and re-enable gradually

## Future Enhancements

1. **AI-Powered Suggestions**: Use Claude to suggest fixes
2. **Custom Rules Engine**: DSL for defining rules
3. **Performance Profiling**: Track slow operations
4. **Integration with CI/CD**: Run same checks in pipeline
5. **Visual Studio Code Extension**: Real-time feedback

---

This plan ensures DegenTalk's code quality standards are automatically enforced while maintaining developer productivity and system performance.