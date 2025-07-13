const path = require('path');

module.exports = {
	root: true,
	ignorePatterns: [
		'.backup/**',
		'quality-reports/**',
		'tests/**',
		'client/src/__tests__/**',
		'**/*.test.ts',
		'**/*.test.tsx',
		'**/*.spec.ts',
		'**/*.spec.tsx',
		'server/utils/**',
		'server/utils/*.ts'
	],
	env: {
		browser: true,
		es2021: true,
		node: true
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2021,
		sourceType: 'module',
		project: ['tsconfig.eslint.json']
	},
	plugins: ['@typescript-eslint', 'react-hooks', 'drizzle'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react-hooks/recommended',
		'plugin:drizzle/recommended'
	],
	overrides: [
		{
			files: ['*.cjs'],
			env: {
				node: true
			},
			parserOptions: {
				sourceType: 'script'
			}
		},
		{
			files: ['client/src/**/*.{ts,tsx}'],
			rules: {
				'no-restricted-imports': [
					'error',
					{
						paths: [
							{
								name: '@/features/forum/hooks/useForumStructure',
								message:
									"Deprecated: use the context hooks exported from '@/contexts/ForumStructureContext' instead."
							},
							{
								name: '../hooks/useForumStructure',
								message:
									"Deprecated: use the context hooks exported from '@/contexts/ForumStructureContext' instead."
							},
							{
								name: '@db/types',
								message:
									'CRITICAL: Frontend code must not import database types. Use "@shared/types" instead.'
							}
						]
					}
				]
			}
		},
		{
			files: ['server/migrations/**/*.ts', 'scripts/**/*.ts'],
			rules: {
				'no-console': 'off',
				'@typescript-eslint/no-explicit-any': 'off'
			}
		},
		{
			files: ['server/src/core/logger.ts'],
			rules: {
				'no-console': 'off'
			}
		},
		{
			files: ['client/src/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
			rules: {
				'@typescript-eslint/no-explicit-any': 'off',
				'@typescript-eslint/no-unused-vars': 'off'
			}
		},
		{
			files: ['server/**/*.{ts,tsx}'],
			excludedFiles: ['server/utils/**'],
			parserOptions: {
				project: [path.join(__dirname, 'server/tsconfig.eslint.json')]
			},
			rules: {
				'no-console': ['error', { allow: ['warn', 'error'] }],
				'no-restricted-imports': [
					'error',
					{
						paths: [
							{
								name: '@server/src/core/database',
								message: "Deprecated: use '@db' or '@server/src/core/db' instead."
							},
							{
								name: '@db/types',
								message: 'Use "@shared/types" instead of "@db/types" for branded IDs.'
							},
							{
								name: '@db/types/id.types',
								message: 'Use "@shared/types" instead of "@db/types" for branded IDs.'
							},
							{
								name: '@db_types',
								message: 'Use "@shared/types" branded ID module.'
							}
						]
					}
				],
				'prefer-const': 'warn',
				'no-constant-condition': 'warn',
				'@typescript-eslint/no-unused-vars': 'off'
			}
		},
		{
			files: ['shared/types/**', 'shared/types/ids.ts'],
			rules: {
				// 'degen/no-missing-branded-id-import': 'off'
			}
		}
	],
	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-var-requires': 'off',
		'@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z][A-Za-z0-9]+$' }],
		// Custom rules disabled - manual enforcement via code review
		// 'degen/no-raw-container-auto': 'warn',
		// 'degen/no-direct-req-user': 'error',
		// 'degen/no-number-id': 'warn',
		// 'degen/no-missing-branded-id-import': 'error',
		// 'degen/no-cross-context-imports': 'warn',
		'@typescript-eslint/ban-types': 'warn',
		'react-hooks/rules-of-hooks': 'warn',
		'no-useless-catch': 'warn',
		'no-useless-escape': 'warn',
		'no-mixed-spaces-and-tabs': 'warn',
		'no-case-declarations': 'warn',
		'no-empty-pattern': 'warn',
		'no-prototype-builtins': 'warn',
		// 'degen/no-undeclared-branded-id': 'off',
		'prefer-const': 'warn',
		'no-constant-condition': 'warn'
	}
};
