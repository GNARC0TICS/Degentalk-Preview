// RUN: npx jscodeshift -t scripts/refactor/component-merge/user-avatar.js <path> --extensions=ts,tsx --dry

/**
 * Codemod: Replace imports of the old UserAvatar component to the new Avatar component.
 *
 *  Loser Path: '@/components/users/user-avatar'
 *  Winner Path: '@/components/users/Avatar'
 */
module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  root.find(j.ImportDeclaration).forEach((path) => {
    const sourceVal = path.node.source.value;
    if (typeof sourceVal === 'string' && /user-avatar(\.tsx?|\.jsx?)?$/.test(sourceVal)) {
      // Replace only the trailing segment to preserve relative prefixes or aliases.
      path.node.source.value = sourceVal.replace(/user-avatar(\.tsx?|\.jsx?)?$/, 'Avatar');
    }
  });

  return root.toSource({ quote: 'single' });
}; 