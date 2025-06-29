// RUN: npx jscodeshift -t scripts/refactor/component-merge/username.js <path> --extensions=ts,tsx --dry

/**
 * Codemod: Replace imports of the old UserName component to the new Username component.
 *
 *  Loser Path: '@/components/identity/UserName'
 *  Winner Path: '@/components/users/Username'
 */
module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  root.find(j.ImportDeclaration).forEach((path) => {
    const sourceVal = path.node.source.value;
    if (typeof sourceVal === 'string' && /components\/identity\/UserName(\.tsx?|\.jsx?)?$/.test(sourceVal)) {
      path.node.source.value = sourceVal.replace(/components\/identity\/UserName(\.tsx?|\.jsx?)?$/, 'components/users/Username');
    }
  });

  return root.toSource({ quote: 'single' });
}; 