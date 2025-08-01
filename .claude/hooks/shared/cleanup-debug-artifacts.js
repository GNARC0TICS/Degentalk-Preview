/**
 * Cleanup Debug Artifacts Hook
 * 
 * Reminds Claude to remove temporary debugging code, logs, and artifacts
 * after completing a debugging session or feature implementation.
 * 
 * Triggers on PostToolUse to check if debugging code was added and
 * reminds to clean it up if a solution was found.
 */

const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'cleanup-debug-artifacts',
  description: 'Reminds to clean up debugging artifacts after fixing issues',
  hooks: ['post-edit'],
  
  run: async (context) => {
    const { filePath, operation, content, previousContent } = context;
    
    // Only check edited files, not new files
    if (operation === 'create' || !previousContent) {
      return [];
    }
    
    const fileName = path.basename(filePath);
    const fileExt = path.extname(filePath);
    
    // Only check code files
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(fileExt)) {
      return [];
    }
    
    // Check if debugging artifacts were added
    const debugPatterns = [
      // Logger debug statements
      /logger\.(debug|trace|info)\s*\(\s*['"`](?:DEBUG|TEMP|TODO|FIXME|DEBUGGING|Testing|Checking)/i,
      /logger\.\w+\s*\(\s*['"`]>>>|<<<|===|---/,
      /logger\.\w+\s*\(\s*['"`]\[DEBUG\]/i,
      
      // Temporary console statements (that might have been converted to logger)
      /\/\/\s*console\./,
      /\/\/\s*@console-allowed/,
      
      // Debug comments
      /\/\/\s*(?:DEBUG|DEBUGGING|TEMP|TEMPORARY|TODO:\s*remove|FIXME:\s*remove)/i,
      /\/\*\s*DEBUG\s*\*\//i,
      
      // Temporary variables for debugging
      /const\s+(?:debug|temp|tmp|test)\w*\s*=/i,
      /const\s+_debug/i,
      
      // Commented out code (often left during debugging)
      /\/\/\s*[^\/\s]{10,}.*\/\/\s*[^\/\s]{10,}/m, // Multiple lines commented out
      
      // Performance measurements
      /performance\.now\(\)/,
      /console\.time/,
      /Date\.now\(\)\s*;?\s*\/\/\s*timing/i,
      
      // Temporary error catching for debugging
      /catch\s*\([^)]*\)\s*{\s*logger\.\w+\([^}]*DEBUGGING/i
    ];
    
    let hasDebugArtifacts = false;
    let debugLines = [];
    
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      for (const pattern of debugPatterns) {
        if (pattern.test(line)) {
          hasDebugArtifacts = true;
          debugLines.push({
            line: index + 1,
            content: line.trim()
          });
          break;
        }
      }
    });
    
    // Check if this looks like debugging was completed
    // (file was edited multiple times, suggesting iterative debugging)
    const warnings = [];
    
    if (hasDebugArtifacts) {
      warnings.push({
        line: 0,
        column: 0,
        message: `Debugging artifacts detected in ${fileName}. Remember to clean up:`,
        severity: 'info',
        rule: 'cleanup-debug-artifacts',
        details: debugLines.slice(0, 5).map(d => `  Line ${d.line}: ${d.content}`).join('\n')
      });
      
      // Add specific cleanup suggestions
      if (content.includes('logger.debug') || content.includes('logger.trace')) {
        warnings.push({
          line: 0,
          column: 0,
          message: 'Remove or downgrade debug/trace logging to appropriate levels',
          severity: 'info',
          rule: 'cleanup-debug-artifacts'
        });
      }
      
      if (content.match(/\/\/\s*console\./)) {
        warnings.push({
          line: 0,
          column: 0,
          message: 'Remove commented out console statements',
          severity: 'info',
          rule: 'cleanup-debug-artifacts'
        });
      }
      
      if (content.match(/\/\/\s*(?:DEBUG|TEMP|TODO:\s*remove)/i)) {
        warnings.push({
          line: 0,
          column: 0,
          message: 'Remove temporary debug comments',
          severity: 'info',
          rule: 'cleanup-debug-artifacts'
        });
      }
    }
    
    return warnings;
  }
};