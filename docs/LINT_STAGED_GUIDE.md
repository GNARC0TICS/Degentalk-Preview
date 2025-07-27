# Lint-Staged Optimization Guide

## Overview
We've optimized the lint-staged configuration to be more maintainable and provide better error messages.

## Key Improvements

### 1. Switched to JavaScript Configuration
- Moved from `.lintstagedrc.json` to `.lintstagedrc.js`
- Enables dynamic file filtering and better error handling
- Reduces complex bash escaping issues

### 2. Better Error Messages
- Each check now shows which specific file failed
- Clearer error messages for each type of violation

### 3. Smarter File Filtering
- Automatically skips generated files (like `db/schema/index.js`)
- Skips console checks for test files and logger.ts
- Only runs relevant checks on each file type

## Quick Commands

### Commit Without Hooks
```bash
# Option 1: Use the helper script
pnpm commit:no-hooks "your commit message"

# Option 2: Use git directly
git commit --no-verify -m "your commit message"

# Option 3: Temporarily disable all hooks
pnpm hooks:disable
git commit -m "your commit message"
pnpm hooks:enable
```

### Debug Lint-Staged Issues
```bash
# Run lint-staged manually to see what's happening
pnpm lint:staged

# Run specific checks on a file
grep -q "from ['\\"]@app/" "client/src/file.tsx" && echo "Has @app import" || echo "Clean"
```

## Common Issues & Solutions

### 1. Bash Syntax Errors
**Old Problem**: Complex escaping in JSON led to syntax errors
**Solution**: JavaScript config handles escaping automatically

### 2. False Positives
**Old Problem**: Checks ran on all files, including test files
**Solution**: Dynamic filtering based on filename patterns

### 3. Unclear Errors
**Old Problem**: Generic "check failed" messages
**Solution**: Each check now reports the specific file and issue

## Configuration Structure

```javascript
module.exports = {
  // Standard linting for all TS/TSX files
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  
  // Smart filtering for JS files (skips generated files)
  '*.{js,jsx}': (filenames) => { /* dynamic logic */ },
  
  // Client-specific import checks
  'client/**/*.{ts,tsx}': (filenames) => { /* per-file checks */ },
  
  // Server-specific checks with exclusions
  'server/**/*.ts': (filenames) => { /* smart filtering */ }
};
```

## Benefits
1. **Faster**: Only runs necessary checks
2. **Clearer**: Better error messages
3. **Maintainable**: Easier to add/modify checks
4. **Flexible**: Can skip hooks when needed