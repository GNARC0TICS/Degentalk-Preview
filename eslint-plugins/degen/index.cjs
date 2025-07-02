module.exports = {
	rules: {
		'no-raw-container-auto': require('./rules/no-raw-container-auto'),
		'no-direct-req-user': require('./rules/no-direct-req-user'),
		'no-number-id': require('./rules/no-number-id'),
		'no-cross-context-imports': require('./rules/no-cross-context-imports'),
		'no-undeclared-branded-id': require('./rules/no-undeclared-branded-id'),
		'no-missing-branded-id-import': require('./rules/no-missing-branded-id-import')
	},
	configs: {
		recommended: {
			rules: {
				'degen/no-direct-req-user': 'error',
				'degen/no-number-id': 'error',
				'degen/no-raw-container-auto': 'warn',
				'degen/no-cross-context-imports': 'error',
				'degen/no-undeclared-branded-id': 'error',
				'degen/no-missing-branded-id-import': 'error'
			}
		}
	}
};
