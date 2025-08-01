module.exports = {
  name: 'check-id-conversions',
  description: 'Ensures proper ID type conversions instead of direct casting',
  filePatterns: ['**/*.{ts,tsx}'],
  excludePatterns: ['**/*.test.*', '**/id-conversions.ts', '**/id.ts'],

  check(filePath, content) {
    const errors = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for dangerous any-based ID casting
      const anyIdCast = line.match(/as\s+any\s+as\s+\w+Id/);
      if (anyIdCast) {
        errors.push({
          line: index + 1,
          column: line.indexOf(anyIdCast[0]),
          message: 'Avoid "as any as XId" casting. Use proper conversion functions from @shared/utils/id-conversions',
          severity: 'error',
          rule: 'id-any-cast'
        });
      }

      // Check for direct ID type mismatches in common scenarios
      const idMismatchPatterns = [
        { pattern: /titleId:\s*\w+Id(?!\.)/, message: 'titleId should be type TitleId' },
        { pattern: /badgeId:\s*\w+Id(?!\.)/, message: 'badgeId should be type BadgeId' },
        { pattern: /achievementId:\s*\w+Id(?!\.)/, message: 'achievementId should be type AchievementId' },
        { pattern: /forumId:\s*\w+Id(?!\.)/, message: 'forumId should be type ForumId' },
        { pattern: /userId:\s*\w+Id(?!\.)/, message: 'userId should be type UserId' },
        { pattern: /postId:\s*\w+Id(?!\.)/, message: 'postId should be type PostId' },
        { pattern: /threadId:\s*\w+Id(?!\.)/, message: 'threadId should be type ThreadId' }
      ];

      idMismatchPatterns.forEach(({ pattern, message }) => {
        const match = line.match(pattern);
        if (match) {
          const matchedText = match[0];
          const propertyName = matchedText.split(':')[0];
          const currentType = matchedText.split(':')[1].trim();
          
          // Only flag if it's the wrong type
          if (!currentType.includes(propertyName.charAt(0).toUpperCase() + propertyName.slice(1))) {
            errors.push({
              line: index + 1,
              column: line.indexOf(match[0]),
              message: `${message}. Consider using conversion function if needed.`,
              severity: 'warning',
              rule: 'id-type-mismatch'
            });
          }
        }
      });

      // Check for missing toId calls
      const stringToIdPattern = /:\s*['"`][\w-]+['"`]\s+as\s+\w+Id/;
      if (line.match(stringToIdPattern)) {
        errors.push({
          line: index + 1,
          column: line.indexOf('as'),
          message: 'Use toId<"XId">(value) instead of casting string literals',
          severity: 'error',
          rule: 'id-string-cast'
        });
      }

      // Check for EntryId vs DictionaryEntryId confusion
      if (line.includes('EntryId') && !line.includes('DictionaryEntryId')) {
        const context = lines.slice(Math.max(0, index - 3), Math.min(lines.length, index + 3)).join('\n');
        if (context.includes('dictionary') || context.includes('Dictionary')) {
          errors.push({
            line: index + 1,
            column: line.indexOf('EntryId'),
            message: 'Consider using DictionaryEntryId for dictionary-related code instead of EntryId',
            severity: 'info',
            rule: 'id-naming-consistency'
          });
        }
      }
    });

    return errors;
  }
};