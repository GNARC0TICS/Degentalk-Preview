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
				'Legacy numeric ID detected: {{pattern}}. Consider migrating to UUID-based type.',
			numberIdCast:
				'Integer ID casting ({{method}}) is not allowed in UUID-first architecture. Use UUID validation instead.',
			numberIdLiteral:
				'Integer ID literal ({{value}}) is not allowed in mock data. Use mockUuid() or TEST_UUIDS instead.',
			numberIdValidation:
				'Integer ID validation (z.number()) is not allowed for ID fields. Use z.string().uuid() instead.',
			parseIntId: 'parseInt() on ID fields is not allowed. IDs should be UUIDs, not integers.',
			isNaNId: 'isNaN() check on ID fields suggests integer usage. Use UUID validation instead.'
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

		function isIdField(node) {
			// Check if the identifier ends with 'Id' or is 'id'
			if (node.type === 'Identifier') {
				const name = node.name.toLowerCase();
				return name === 'id' || name.endsWith('id');
			}

			// Check if it's a property with an ID-like key
			if (node.type === 'Property' && node.key) {
				const keyName = node.key.name || node.key.value;
				if (typeof keyName === 'string') {
					const name = keyName.toLowerCase();
					return name === 'id' || name.endsWith('id');
				}
			}

			return false;
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
			VariableDeclarator: checkNode,

			// Runtime pattern detection
			CallExpression(node) {
				const { callee, arguments: args } = node;

				if (args.length === 0) return;

				const firstArg = args[0];

				// Check for Number(someId) or parseInt(someId)
				if (callee.type === 'Identifier') {
					if (callee.name === 'Number' && isIdField(firstArg)) {
						context.report({
							node,
							messageId: 'numberIdCast',
							data: { method: 'Number()' },
							fix(fixer) {
								return fixer.replaceText(node, context.getSourceCode().getText(firstArg));
							}
						});
					}

					if (callee.name === 'parseInt' && isIdField(firstArg)) {
						context.report({
							node,
							messageId: 'parseIntId',
							fix(fixer) {
								return fixer.replaceText(node, context.getSourceCode().getText(firstArg));
							}
						});
					}

					if (callee.name === 'isNaN' && isIdField(firstArg)) {
						context.report({
							node,
							messageId: 'isNaNId',
							fix(fixer) {
								return fixer.replaceText(
									node,
									`!isValidUUID(${context.getSourceCode().getText(firstArg)})`
								);
							}
						});
					}
				}
			},

			// Catch integer literals in ID contexts
			Property(node) {
				if (
					isIdField(node) &&
					node.value.type === 'Literal' &&
					typeof node.value.value === 'number'
				) {
					const filename = context.getFilename();
					const isTestFile = /\.(test|spec)\.[jt]s$/.test(filename);

					context.report({
						node: node.value,
						messageId: 'numberIdLiteral',
						data: { value: node.value.value },
						fix(fixer) {
							if (isTestFile) {
								return fixer.replaceText(node.value, 'mockUuid()');
							} else {
								return fixer.replaceText(node.value, 'randomUUID()');
							}
						}
					});
				}
			},

			// Catch z.number() in Zod schemas for ID fields
			MemberExpression(node) {
				if (
					node.object &&
					node.object.type === 'CallExpression' &&
					node.object.callee &&
					node.object.callee.name === 'z' &&
					node.property &&
					node.property.name === 'number'
				) {
					// Check if this is in an ID context by looking at the parent property
					let parent = node.parent;
					while (parent && parent.type !== 'Property') {
						parent = parent.parent;
					}

					if (parent && isIdField(parent)) {
						context.report({
							node,
							messageId: 'numberIdValidation',
							fix(fixer) {
								return fixer.replaceText(node.parent, 'z.string().uuid()');
							}
						});
					}
				}
			}
		};
	}
};
