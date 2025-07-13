/**
 * ESLint rule to enforce DDD bounded context boundaries
 * Prevents cross-context imports that violate architectural constraints
 */

const path = require('path');

const WORKSPACE_CONTEXTS = {
	shared: {
		allowedImports: [],
		disallowedImports: [
			'@degentalk/client',
			'@degentalk/server',
			'@degentalk/db',
			'@degentalk/scripts'
		]
	},
	db: {
		allowedImports: ['@degentalk/shared'],
		disallowedImports: ['@degentalk/client', '@degentalk/server', '@degentalk/scripts']
	},
	client: {
		allowedImports: ['@degentalk/shared'],
		disallowedImports: ['@degentalk/db', '@degentalk/server', '@degentalk/scripts']
	},
	server: {
		allowedImports: ['@degentalk/shared', '@degentalk/db'],
		disallowedImports: ['@degentalk/client', '@degentalk/scripts']
	},
	scripts: {
		allowedImports: [
			'@degentalk/shared',
			'@degentalk/db',
			'@degentalk/server',
			'@degentalk/client'
		],
		disallowedImports: []
	}
};

function getContextFromPath(filePath) {
	const parts = filePath.split(path.sep);

	// Find @degentalk context from file path
	for (let i = 0; i < parts.length; i++) {
		if (parts[i] === 'client') return 'client';
		if (parts[i] === 'server') return 'server';
		if (parts[i] === 'shared') return 'shared';
		if (parts[i] === 'db') return 'db';
		if (parts[i] === 'scripts') return 'scripts';
	}

	return null;
}

module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Enforce DDD bounded context boundaries',
			category: 'Architectural',
			recommended: true
		},
		fixable: null,
		schema: []
	},

	create(context) {
		const filename = context.getFilename();
		const currentContext = getContextFromPath(filename);

		if (!currentContext || !WORKSPACE_CONTEXTS[currentContext]) {
			return {};
		}

		const { disallowedImports } = WORKSPACE_CONTEXTS[currentContext];

		return {
			ImportDeclaration(node) {
				const importPath = node.source.value;

				// Check for disallowed cross-context imports
				for (const disallowed of disallowedImports) {
					if (importPath.startsWith(disallowed)) {
						context.report({
							node,
							message: `Cross-context import violation: "${currentContext}" context cannot import from "${disallowed}". This violates DDD bounded context boundaries.`
						});
					}
				}

				// Check for relative imports that might cross contexts
				if (importPath.startsWith('../') && importPath.includes('@degentalk/')) {
					context.report({
						node,
						message: `Use direct workspace imports instead of relative paths for "@degentalk/*" packages. Use "${importPath.match(/@degentalk\/[^/]+/)[0]}" instead.`
					});
				}
			},

			CallExpression(node) {
				// Check dynamic imports
				if (
					node.callee.type === 'Import' ||
					(node.callee.type === 'Identifier' && node.callee.name === 'require')
				) {
					const arg = node.arguments[0];
					if (arg && arg.type === 'Literal') {
						const importPath = arg.value;

						for (const disallowed of disallowedImports) {
							if (importPath.startsWith(disallowed)) {
								context.report({
									node,
									message: `Cross-context import violation: "${currentContext}" context cannot import from "${disallowed}". This violates DDD bounded context boundaries.`
								});
							}
						}
					}
				}
			}
		};
	}
};
