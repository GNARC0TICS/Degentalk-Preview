#!/usr/bin/env node

/**
 * Hook: Prevent Duplicate Directories
 * Prevents creating new directories that duplicate existing functionality
 * 
 * Triggers on: pre-edit, pre-create
 * Applies to: shared workspace
 */

const path = require('path');
const fs = require('fs');

// Known directory mappings - NEVER create these duplicates
const PROTECTED_DIRECTORIES = {
  // Types should always go in /shared/types, not /shared/src/types
  'src/types': {
    correct: 'types',
    message: 'Use existing /shared/types/ directory for type definitions'
  },
  
  // Config can go in either place, but prefer root for consistency
  'src/config': {
    correct: 'config',
    message: 'Consider using existing /shared/config/ directory for consistency',
    severity: 'warning' // Just a warning, not a block
  },
  
  // Utils should be in root
  'src/utils': {
    correct: 'utils',
    message: 'Use existing /shared/utils/ directory for utility functions'
  },
  
  // These nested structures should be avoided
  'src/lib': {
    correct: 'lib',
    message: 'Use existing /shared/lib/ directory'
  },
  
  'src/dto': {
    correct: 'dto',
    message: 'Use existing /shared/dto/ directory for DTOs'
  },
  
  'src/validation': {
    correct: 'validation',
    message: 'Use existing /shared/validation/ directory'
  }
};

function checkFilePath(filePath) {
  // Only check files in the shared workspace
  if (!filePath.includes('/shared/')) {
    return { allowed: true };
  }

  // Get the relative path from shared directory
  const sharedIndex = filePath.indexOf('/shared/');
  const relativePath = filePath.substring(sharedIndex + 8); // After '/shared/'
  
  // Check each protected directory pattern
  for (const [pattern, config] of Object.entries(PROTECTED_DIRECTORIES)) {
    if (relativePath.startsWith(pattern + '/') || relativePath === pattern) {
      const existingPath = path.join(path.dirname(filePath.substring(0, sharedIndex + 8)), 'shared', config.correct);
      
      // Check if the correct directory exists
      if (fs.existsSync(existingPath)) {
        return {
          allowed: config.severity === 'warning',
          message: `${config.message}\n  Creating: /shared/${pattern}/\n  Should use: /shared/${config.correct}/`,
          severity: config.severity || 'error'
        };
      }
    }
  }

  // Also check for deeply nested src directories (anti-pattern)
  if (relativePath.includes('/src/src/') || relativePath.includes('/src/core/src/')) {
    return {
      allowed: false,
      message: 'Avoid deeply nested src directories. Flatten the structure.',
      severity: 'error'
    };
  }

  return { allowed: true };
}

// Main hook logic
function main() {
  const event = process.env.CLAUDE_HOOK_EVENT;
  const filePath = process.env.CLAUDE_HOOK_FILE;

  if (!filePath) {
    process.exit(0);
  }

  const result = checkFilePath(filePath);
  
  if (!result.allowed) {
    console.error(`❌ Directory Structure Error: ${result.message}`);
    process.exit(1);
  } else if (result.severity === 'warning') {
    console.warn(`⚠️  Directory Structure Warning: ${result.message}`);
    // Don't exit with error for warnings
  }
  
  process.exit(0);
}

// Run the hook
main();