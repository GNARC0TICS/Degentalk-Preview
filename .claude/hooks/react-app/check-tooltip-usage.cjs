module.exports = {
  name: 'check-tooltip-usage',
  description: 'Ensures correct tooltip component usage with compound pattern',
  filePatterns: ['**/*.{tsx}'],
  excludePatterns: ['**/*.test.*', '**/tooltip.tsx', '**/tooltip-utils.tsx'],

  check(filePath, content) {
    const errors = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for incorrect Tooltip with content prop
      if (line.includes('<Tooltip') && line.includes('content=')) {
        errors.push({
          line: index + 1,
          column: line.indexOf('content='),
          message: 'Tooltip component does not accept content prop. Use SafeTooltip from @/components/ui/tooltip-utils or use compound pattern: <Tooltip><TooltipTrigger>...</TooltipTrigger><TooltipContent>...</TooltipContent></Tooltip>',
          severity: 'error',
          rule: 'tooltip-content-prop'
        });
      }

      // Check for missing TooltipProvider
      if (line.includes('<Tooltip>') && !content.includes('TooltipProvider')) {
        // Only warn if this looks like a standalone usage
        const hasTooltipTrigger = content.includes('TooltipTrigger');
        if (hasTooltipTrigger && !content.includes('SafeTooltip')) {
          errors.push({
            line: index + 1,
            column: line.indexOf('<Tooltip>'),
            message: 'Tooltip usage requires TooltipProvider wrapper or use SafeTooltip component',
            severity: 'warning',
            rule: 'tooltip-missing-provider'
          });
        }
      }

      // Suggest SafeTooltip for simple cases
      if (line.includes('TooltipTrigger') && line.includes('asChild')) {
        const nextLines = lines.slice(index + 1, index + 10).join('\n');
        if (nextLines.includes('Button') || nextLines.includes('button')) {
          errors.push({
            line: index + 1,
            column: line.indexOf('TooltipTrigger'),
            message: 'Consider using SafeTooltip or ButtonTooltip from @/components/ui/tooltip-utils for simpler syntax',
            severity: 'info',
            rule: 'tooltip-use-wrapper'
          });
        }
      }
    });

    return errors;
  }
};