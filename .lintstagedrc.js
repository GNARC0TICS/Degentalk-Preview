module.exports = {
  // TypeScript/TSX files
  '*.{ts,tsx}': [
    'eslint --fix --max-warnings 0',
    'prettier --write'
  ],
  
  // JavaScript/JSX files (with exception for generated files)
  '*.{js,jsx}': (filenames) => {
    const commands = [];
    const nonGeneratedFiles = filenames.filter(f => !f.includes('db/schema/index.js'));
    
    if (nonGeneratedFiles.length > 0) {
      commands.push(`eslint --fix --quiet --max-warnings 0 ${nonGeneratedFiles.join(' ')}`);
    }
    
    if (filenames.length > 0) {
      commands.push(`prettier --write ${filenames.join(' ')}`);
    }
    
    return commands;
  },
  
  // Config files
  '*.{json,md,yml,yaml}': 'prettier --write',
  
  // Client-specific checks
  'client/**/*.{ts,tsx}': (filenames) => {
    const commands = [];
    
    // Check for deprecated @app/ imports
    for (const filename of filenames) {
      commands.push(
        `grep -q "from ['\\"]@app/" "${filename}" && echo "❌ Deprecated @app/ import in ${filename}. Use @/ instead." && exit 1 || exit 0`
      );
    }
    
    return commands;
  },
  
  // Server-specific checks
  'server/**/*.ts': (filenames) => {
    const commands = [];
    
    for (const filename of filenames) {
      // Skip test files and logger.ts for console checks
      if (!filename.includes('.test.ts') && !filename.endsWith('logger.ts')) {
        commands.push(
          `grep -q "console\\." "${filename}" && echo "❌ Console usage in ${filename}. Use logger instead." && exit 1 || exit 0`
        );
      }
      
      // Check for req.user (skip test files)
      if (!filename.includes('.test.ts')) {
        commands.push(
          `grep -q "req\\.user" "${filename}" && echo "❌ Direct req.user access in ${filename}. Use middleware." && exit 1 || exit 0`
        );
      }
      
      // Check for deprecated import aliases
      commands.push(
        `grep -qE "from ['\\"]@(api|server|server-core|server-utils|server-middleware)/" "${filename}" && echo "❌ Deprecated import alias in ${filename}. Use @core/, @domains/, etc." && exit 1 || exit 0`
      );
    }
    
    return commands;
  }
};