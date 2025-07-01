module.exports = function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  root
    .find(j.ImportDeclaration, {
      source: { value: '@/components/forum/ZoneCard' }
    })
    .forEach((path) => {
      const hasDefault = path.node.specifiers.some(
        (s) => s.type === 'ImportDefaultSpecifier'
      );
      if (!hasDefault) {
        // Remove all named specifiers and replace with a single default one
        path.node.specifiers = [
          j.importDefaultSpecifier(j.identifier('ZoneCard'))
        ];
      }
    });

  return root.toSource({ quote: 'single' });
}; 