/**
 * @type {import('eslint').Rule.RuleModule}
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce the use of path aliases',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    schema: [], // no options
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        if (typeof importPath === 'string' && importPath.startsWith('../')) {
          context.report({
            node,
            message: 'Use path aliases instead of relative paths for imports.',
          });
        }
      },
    };
  },
};
