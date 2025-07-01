/**
 * ESLint rule: no-number-id
 *
 * Prevents the use of numeric ID types to enforce UUID-based branded types.
 * This rule helps maintain consistency during and after the UUID migration.
 */

module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Prevent numeric ID types, enforce UUID-based branded types',
			category: 'Best Practices',
			recommended: true
		},
		fixable: 'code',
		schema: [
			{
				type: 'object',
				properties: {
					allowLegacy: {
						type: 'boolean',
						default: false
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			numericId:
				'Use UUID-based branded ID types (e.g., UserId, ThreadId) instead of numeric IDs. Found: {{pattern}}',
			legacyNumericId:
				'Legacy numeric ID detected: {{pattern}}. Consider migrating to UUID-based type.'
		}
	},

	create(context) {
		const options = context.options[0] || {};
		const allowLegacy = options.allowLegacy || false;

		// Patterns that indicate numeric ID usage
		const numericIdPatterns = [
			// Type annotations: userId: number, threadId: number, etc.
			/\b([a-zA-Z0-9]*[Ii]d)\s*:\s*number\b/g,
			// Interface/type definitions: { id: number }
			/\{\s*id\s*:\s*number\s*\}/g,
			// Function parameters: (id: number)
			/\(\s*([a-zA-Z0-9]*[Ii]d)\s*:\s*number\s*\)/g,
			// Optional types: userId?: number
			/\b([a-zA-Z0-9]*[Ii]d)\?\s*:\s*number\b/g
		];

		// Exceptions - these are allowed numeric IDs
		const allowedNumericIds = [
			'primaryRoleId',
			'roleId',
			'groupId',
			'categoryId', // Legacy forum categories
			'statusCode',
			'errorCode',
			'httpCode'
		];

		function checkNode(node) {
			const sourceCode = context.getSourceCode();
			const text = sourceCode.getText(node);

			numericIdPatterns.forEach((pattern) => {
				let match;
				while ((match = pattern.exec(text)) !== null) {
					const fullMatch = match[0];
					const idName = match[1] || 'id';

					// Skip if this is an allowed numeric ID
					if (allowedNumericIds.some((allowed) => fullMatch.includes(allowed))) {
						continue;
					}

					const messageId = allowLegacy ? 'legacyNumericId' : 'numericId';

					context.report({
						node,
						messageId,
						data: {
							pattern: fullMatch
						},
						fix(fixer) {
							// Suggest UUID-based replacement
							const replacement = getSuggestedReplacement(fullMatch, idName);
							if (replacement) {
								const start = node.range[0] + match.index;
								const end = start + fullMatch.length;
								return fixer.replaceTextRange([start, end], replacement);
							}
							return null;
						}
					});
				}
			});
		}

		function getSuggestedReplacement(pattern, idName) {
			// Map common ID names to their branded types
			const typeMap = {
				userId: 'UserId',
				threadId: 'ThreadId',
				postId: 'PostId',
				messageId: 'MessageId',
				walletId: 'WalletId',
				transactionId: 'TransactionId',
				productId: 'ProductId',
				badgeId: 'BadgeId',
				titleId: 'TitleId',
				frameId: 'FrameId',
				structureId: 'StructureId',
				achievementId: 'AchievementId',
				missionId: 'MissionId'
			};

			// Replace number with appropriate branded type
			const brandedType = typeMap[idName] || `Id<'${idName.replace(/Id$/, '')}'>`;
			return pattern.replace(/number/g, brandedType);
		}

		return {
			// Check type annotations and interfaces
			TSTypeAnnotation: checkNode,
			TSInterfaceDeclaration: checkNode,
			TSTypeAliasDeclaration: checkNode,
			TSPropertySignature: checkNode,
			TSMethodSignature: checkNode,

			// Check function parameters and return types
			FunctionDeclaration: checkNode,
			ArrowFunctionExpression: checkNode,
			FunctionExpression: checkNode,

			// Check variable declarations
			VariableDeclarator: checkNode
		};
	}
};
