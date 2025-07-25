'use strict';

/**
 * ESLint rule: no-direct-req-user
 * ---------------------------------
 * Disallows direct property access `req.user` (or `request.user`) in server code.
 *
 * Motivation: All business logic should use the centralised
 * `userService.getUserFromRequest(req)` helper. Direct access risks
 * duplicated auth logic and data-leakage bugs.
 *
 * Exceptions / Allow-list:
 *   • Files inside /server/src/core/auth/** (passport strategies, serializers, etc.)
 *   • Type definition files (d.ts) and tests.
 */

const path = require('node:path');

module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow direct "req.user" access – use userService instead',
			recommended: false
		},
		messages: {
			directReqUser:
				'Direct "req.user" access is forbidden. Use userService.getUserFromRequest(req) instead.'
		},
		schema: []
	},

	create(context) {
		const filename = context.getFilename();

		// Allow in auth glue / test / declaration files
		if (
			/\/server\/src\/core\/auth\//.test(filename) ||
			/\.d\.ts$/.test(filename) ||
			/\.test\.(ts|tsx|js|jsx)$/.test(filename)
		) {
			return {};
		}

		function check(node) {
			if (
				node.object &&
				node.property &&
				node.property.type === 'Identifier' &&
				node.property.name === 'user'
			) {
				// object can be Identifier "req" or MemberExpression (request)
				if (node.object.type === 'Identifier' && node.object.name === 'req') {
					context.report({ node, messageId: 'directReqUser' });
				}

				if (node.object.type === 'Identifier' && node.object.name === 'request') {
					context.report({ node, messageId: 'directReqUser' });
				}
			}
		}

		return {
			MemberExpression: check
		};
	}
};
