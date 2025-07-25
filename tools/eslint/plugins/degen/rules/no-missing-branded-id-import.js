/**
 * no-missing-branded-id-import (SAFE STUB)
 * ----------------------------------------
 * Temporary lightweight version of the full rule until the autofixer is fixed.
 * It reports the same problem without attempting a fixer (which was crashing
 * ESLint due to an outdated fixer API helper).
 */

const problematicIds = new Set([
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

module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Require imports for branded ID types to prevent implicit any errors',
			category: 'Best Practices',
			recommended: true
		},
		schema: [],
		messages: {
			missingImport:
				'Missing import for branded ID type "{{idType}}"; add `import type { {{idType}} } from \"@/types/ids\";`'
		}
	},

	create(context) {
		const imported = new Set();

		return {
			ImportDeclaration(node) {
				const source = node.source.value;
				if (typeof source === 'string' && source.includes('types')) {
					node.specifiers.forEach((spec) => {
						if (spec.type === 'ImportSpecifier' && spec.imported) {
							imported.add(spec.imported.name);
						}
					});
				}
			},

			Identifier(node) {
				const name = node.name;
				if (problematicIds.has(name) && !imported.has(name)) {
					context.report({ node, messageId: 'missingImport', data: { idType: name } });
				}
			}
		};
	}
};
