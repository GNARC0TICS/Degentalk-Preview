#!/usr/bin/env node
/**
 * Final Cleanup Reminder Hook
 * 
 * This hook is designed to run at the end of Claude's response to remind
 * about cleaning up any debugging artifacts, temporary code, or redundant
 * implementations that were created during the debugging process.
 * 
 * It tracks files that were edited with debugging patterns and reminds
 * to clean them up before finishing.
 */

const fs = require('fs');
const path = require('path');

// Track files that had debugging code added during this session
const debuggedFiles = new Set();
const tempFiles = new Set();

// Patterns that indicate debugging or temporary code
const debugPatterns = {
  logging: [
    /logger\.(debug|trace)\(/,
    /console\.(log|debug|trace|time|timeEnd)\(/,
    /\/\/\s*@console-allowed/,
    /logger\.\w+\([^)]*\b(DEBUG|TEMP|TEST|CHECKING|INVESTIGATING)\b/i
  ],
  comments: [
    /\/\/\s*(DEBUG|DEBUGGING|TEMP|TEMPORARY|HACK|FIXME:\s*remove|TODO:\s*remove)/i,
    /\/\*\s*DEBUG[\s\S]*?\*\//,
    /\/\/\s*(\?\?\?|!!!|>>>|<<<|===)/
  ],
  tempCode: [
    /const\s+(debug|temp|tmp|test)\w*\s*=/i,
    /function\s+debug\w*\(/i,
    /\bDEBUG_MODE\b/,
    /if\s*\(\s*(?:true|false)\s*\)\s*{[\s\S]*?\/\/\s*debug/i
  ],
  performance: [
    /performance\.(now|mark|measure)\(/,
    /console\.time/,
    /Date\.now\(\).*\/\/\s*(timing|performance|measure)/i
  ]
};

// Check if content has debugging artifacts
function hasDebugArtifacts(content) {
  for (const category of Object.values(debugPatterns)) {
    for (const pattern of category) {
      if (pattern.test(content)) {
        return true;
      }
    }
  }
  return false;
}

// Main hook function
async function checkForCleanup() {
  // This would be called by Claude's system with context about edited files
  // For now, we'll output a reminder based on tracked files
  
  const reminders = [];
  
  if (debuggedFiles.size > 0) {
    reminders.push({
      type: 'cleanup-reminder',
      message: '🧹 Debugging Session Cleanup Reminder',
      details: [
        'The following files had debugging code added during this session:',
        ...Array.from(debuggedFiles).map(f => `  - ${f}`),
        '',
        'Please review and remove:',
        '  ✓ Temporary logger.debug() or logger.trace() statements',
        '  ✓ Console.log statements (even if converted to logger)',
        '  ✓ Debug comments (// DEBUG, // TEMP, etc.)',
        '  ✓ Temporary variables used only for debugging',
        '  ✓ Performance timing code',
        '  ✓ Commented out code that was used for testing',
        '',
        'Keep only the essential logging needed for production monitoring.'
      ]
    });
  }
  
  if (tempFiles.size > 0) {
    reminders.push({
      type: 'temp-file-reminder',
      message: '📁 Temporary File Reminder',
      details: [
        'The following temporary files were created:',
        ...Array.from(tempFiles).map(f => `  - ${f}`),
        '',
        'Consider if these files should be:',
        '  - Removed (if they were only for testing)',
        '  - Moved to proper locations',
        '  - Added to .gitignore'
      ]
    });
  }
  
  return reminders;
}

// Export for use as a hook
module.exports = {
  name: 'final-cleanup-reminder',
  description: 'Reminds to clean up debugging artifacts at the end of session',
  
  // This would be called by Claude's PostToolUse or a special "session-end" event
  run: async (context) => {
    const { eventType, filePath, content, operation } = context;
    
    // Track files with debug code
    if (operation === 'edit' || operation === 'write') {
      if (hasDebugArtifacts(content)) {
        debuggedFiles.add(filePath);
      }
    }
    
    // Track temporary files
    if (operation === 'create') {
      const fileName = path.basename(filePath);
      if (fileName.match(/\.(tmp|temp|test|debug)/i) || 
          fileName.match(/^(tmp|temp|test|debug)/i)) {
        tempFiles.add(filePath);
      }
    }
    
    // If this is a session-end event, provide cleanup reminders
    if (eventType === 'session-end' || eventType === 'response-complete') {
      return await checkForCleanup();
    }
    
    return [];
  },
  
  // Function to manually trigger cleanup check
  checkCleanup: checkForCleanup,
  
  // Reset tracking (useful for new sessions)
  reset: () => {
    debuggedFiles.clear();
    tempFiles.clear();
  }
};