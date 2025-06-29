// RUN: npx jscodeshift -t scripts/refactor/component-merge/path-progress.js <path> --extensions=ts,tsx --dry

/**
 * Codemod: Replace imports of the old PathProgress component path.
 *
 *  Loser Path: '@/components/identity/path-progress'
 *  Winner Path: '@/components/paths/path-progress'
 */
module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  root.find(j.ImportDeclaration).forEach((path) => {
    const sourceVal = path.node.source.value;
    if (typeof sourceVal === 'string' && /components\/identity\/path-progress(\.tsx?|\.jsx?)?$/.test(sourceVal)) {
      path.node.source.value = sourceVal.replace(/components\/identity\/path-progress(\.tsx?|\.jsx?)?$/, 'components/paths/path-progress');
    }
  });

  return root.toSource({ quote: 'single' });
}; 