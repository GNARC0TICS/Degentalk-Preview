/**
 * ESLint rule to enforce DDD bounded context boundaries at the domain level
 * Prevents cross-domain imports within the server context
 */

const path = require('path');

// A simplified dependency graph. In a real-world scenario, this might be more complex.
// For now, we'll assume domains are mostly isolated and should only import from 'core' or 'shared'.
const DOMAIN_DEPENDENCIES = {
	// Core domains can be imported by most other domains
	auth: { allowed: ['core', 'shared'] },
	users: { allowed: ['core', 'shared', 'auth'] },

	// Feature domains should be isolated
	forum: { allowed: ['core', 'shared', 'auth', 'users'] },
	wallet: { allowed: ['core', 'shared', 'auth', 'users'] },
	shop: { allowed: ['core', 'shared', 'auth', 'users'] },
	uploads: { allowed: ['core', 'shared', 'auth', 'users', 'profile'] },
	profile: { allowed: ['core', 'shared', 'auth', 'users'] },

	// Default for other domains
	default: { allowed: ['core', 'shared', 'auth', 'users'] }
};

function getDomainFromPath(filePath) {
	const parts = filePath.split(path.sep);
	const domainsIndex = parts.indexOf('domains');

	if (domainsIndex !== -1 && domainsIndex < parts.length - 1) {
		return parts[domainsIndex + 1];
	}
	return null;
}

module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Enforce DDD domain boundaries within the server',
			category: 'Architectural',
			recommended: true
		},
		fixable: null,
		schema: []
	},

	create(context) {
		const filename = context.getFilename();
		const currentDomain = getDomainFromPath(filename);

		if (!currentDomain) {
			return {};
		}

		return {
			ImportDeclaration(node) {
				const importPath = node.source.value;
				const importedDomain = getDomainFromPath(importPath);

				if (importedDomain && importedDomain !== currentDomain) {
					const allowed =
						DOMAIN_DEPENDENCIES[currentDomain]?.allowed || DOMAIN_DEPENDENCIES['default'].allowed;
					if (!allowed.includes(importedDomain)) {
						context.report({
							node,
							message: `Cross-domain import violation: Domain "${currentDomain}" cannot import from "${importedDomain}".`
						});
					}
				}
			}
		};
	}
};
