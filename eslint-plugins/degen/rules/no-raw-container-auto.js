/**
 * ESLint rule: no-raw-container-auto
 * Flags JSX elements using className that contains both
 * `container` and `mx-auto` when the file has not imported
 * one of our approved layout wrappers (Wide, Prose, FullBleedSection).
 */
'use strict';

const APPROVED_WRAPPERS = new Set(['Wide', 'Prose', 'FullBleedSection']);

module.exports = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow raw "container mx-auto" classes outside layout primitives',
			recommended: false
		},
		messages: {
			badContainer: 'Use <Wide>, <Prose>, or <FullBleedSection> instead of raw "container mx-auto".'
		},
		schema: []
	},

	create(context) {
		let hasWrapperImport = false;

		return {
			ImportDeclaration(node) {
				if (!node.source.value.includes('/layout/primitives')) return;

				const hasApproved = node.specifiers.some(
					(s) => s.type === 'ImportSpecifier' && APPROVED_WRAPPERS.has(s.imported.name)
				);

				if (hasApproved) {
					hasWrapperImport = true;
				}
			},

			JSXAttribute(node) {
				if (
					node.name.name !== 'className' ||
					node.value?.type !== 'Literal' ||
					typeof node.value.value !== 'string'
				)
					return;

				const cls = node.value.value;
				if (cls.includes('container') && cls.includes('mx-auto') && !hasWrapperImport) {
					context.report({ node, messageId: 'badContainer' });
				}
			}
		};
	}
};
