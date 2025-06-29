/**
 * Codemod: Update imports from old sidebar component path to new AppSidebar path.
 *
 *  Old Path: '@/components/layout/sidebar'
 *  New Path: '@/components/layout/AppSidebar'
 */
// RUN: npx jscodeshift -t scripts/refactor/component-merge/app-sidebar-path.js <path> --extensions=ts,tsx --dry
module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  root.find(j.ImportDeclaration).forEach((p) => {
    const sourceVal = p.node.source.value;
    if (typeof sourceVal === 'string' && /components\/layout\/sidebar(\.tsx?|\.jsx?)?$/.test(sourceVal)) {
      p.node.source.value = sourceVal.replace(/components\/layout\/sidebar(\.tsx?|\.jsx?)?$/, 'components/layout/AppSidebar');
    }
  });

  return root.toSource({ quote: 'single' });
}; 