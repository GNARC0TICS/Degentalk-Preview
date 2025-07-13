/**
 * ESLint rule: no-undeclared-branded-id
 *
 * Detects usage of branded ID types without proper imports.
 * Prevents the exact class of errors we encountered after client-api migration.
 */

module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Require imports for branded ID types to prevent "Cannot find name" errors',
			category: 'Best Practices',
			recommended: true
		},
		fixable: 'code',
		schema: [],
		messages: {
			missingImport:
				"Missing import for branded ID type: {{idType}}. Add: import type { {{idType}} } from '@db/types';",
			suggestImport: 'Consider adding import for {{idType}}'
		}
	},

	create(context) {
		const sourceCode = context.getSourceCode();
		const filename = context.getFilename();

		// Skip .d.ts files and backup files
		if (filename.endsWith('.d.ts') || filename.includes('.backup.')) {
			return {};
		}

		// Branded ID types we should check for
		const brandedIdTypes = new Set([
			'UserId',
			'ThreadId',
			'PostId',
			'MessageId',
			'WalletId',
			'TransactionId',
			'ProductId',
			'BadgeId',
			'TitleId',
			'FrameId',
			'StructureId',
			'AchievementId',
			'MissionId',
			'GroupId',
			'RoleId',
			'CategoryId'
		]);

		// Track imports in the file
		const importedTypes = new Set();
		const usedTypes = new Set();
		let hasDbTypesImport = false;

		function checkForDbTypesImport(node) {
			if (
				node.source &&
				(node.source.value === '@db/types' ||
					node.source.value === '@/db/types' ||
					node.source.value.includes('db/types'))
			) {
				hasDbTypesImport = true;

				// Track imported types
				if (node.specifiers) {
					node.specifiers.forEach((spec) => {
						if (spec.type === 'ImportSpecifier' && spec.imported) {
							importedTypes.add(spec.imported.name);
						}
					});
				}
			}
		}

		function checkIdentifier(node) {
			const name = node.name;

			// Check if this is a branded ID type
			if (brandedIdTypes.has(name)) {
				usedTypes.add(name);

				// Check if it's imported
				if (!importedTypes.has(name)) {
					context.report({
						node,
						messageId: 'missingImport',
						data: { idType: name },
						fix(fixer) {
							// Find existing @db/types import to extend
							const existingImport = sourceCode.ast.body.find(
								(node) =>
									node.type === 'ImportDeclaration' &&
									node.source &&
									(node.source.value === '@db/types' ||
										node.source.value === '@/db/types' ||
										node.source.value.includes('db/types'))
							);

							if (existingImport) {
								// Add to existing import
								const lastSpecifier =
									existingImport.specifiers[existingImport.specifiers.length - 1];
								return fixer.insertTextAfter(lastSpecifier, `, ${name}`);
							} else {
								// Add new import at the top
								const firstImport = sourceCode.ast.body.find(
									(node) => node.type === 'ImportDeclaration'
								);
								const insertPosition = firstImport ? firstImport.range[0] : 0;
								return fixer.insertTextAt(
									insertPosition,
									`import type { ${name} } from '@db/types';\n`
								);
							}
						}
					});
				}
			}
		}

		return {
			// Track imports
			ImportDeclaration: checkForDbTypesImport,

			// Check all identifiers for branded ID usage
			Identifier: checkIdentifier,

			// Final check at end of file
			'Program:exit'() {
				// Report summary if there are missing imports
				const missingTypes = Array.from(usedTypes).filter((type) => !importedTypes.has(type));

				if (missingTypes.length > 0 && !hasDbTypesImport) {
					// If no @db/types import exists, suggest adding one with all missing types
					const firstNode = sourceCode.ast.body[0];
					if (firstNode) {
						context.report({
							node: firstNode,
							messageId: 'suggestImport',
							data: { idType: missingTypes.join(', ') },
							fix(fixer) {
								return fixer.insertTextBefore(
									firstNode,
									`import type { ${missingTypes.join(', ')} } from '@db/types';\n`
								);
							}
						});
					}
				}
			}
		};
	}
};
