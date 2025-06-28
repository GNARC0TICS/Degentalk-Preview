import React from 'react';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';
import { brandConfig } from '@/config/brand.config';

interface PostBodyProps {
	content: string;
	signature?: string | null;
	username: string;
	showSignatures?: boolean;
	isFirst?: boolean;
	className?: string;
}

export function PostBody({
	content,
	signature,
	username,
	showSignatures = true,
	isFirst = false,
	className = ''
}: PostBodyProps) {
	// Sanitize content with BBCode-style allowances
	const sanitizedContent = DOMPurify.sanitize(content, {
		ALLOWED_TAGS: [
			'p',
			'br',
			'strong',
			'b',
			'em',
			'i',
			'u',
			's',
			'strike',
			'del',
			'a',
			'img',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'ul',
			'ol',
			'li',
			'blockquote',
			'code',
			'pre',
			'table',
			'thead',
			'tbody',
			'tr',
			'th',
			'td',
			'span',
			'div',
			'hr'
		],
		ALLOWED_ATTR: [
			'href',
			'src',
			'alt',
			'title',
			'class',
			'style',
			'target',
			'rel',
			'width',
			'height'
		],
		ADD_ATTR: ['target'],
		HOOK_ATTRIBUTES: {
			a: function (node) {
				const href = node.getAttribute('href');
				if (href && (href.startsWith('http') || href.startsWith('//'))) {
					node.setAttribute('target', '_blank');
					node.setAttribute('rel', 'noopener noreferrer');
				}
			}
		}
	});

	// Sanitize signature if provided
	const sanitizedSignature =
		signature && showSignatures
			? DOMPurify.sanitize(signature, {
					ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'img', 'span'],
					ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'style', 'target', 'rel'],
					ADD_ATTR: ['target'],
					HOOK_ATTRIBUTES: {
						a: function (node) {
							const href = node.getAttribute('href');
							if (href && (href.startsWith('http') || href.startsWith('//'))) {
								node.setAttribute('target', '_blank');
								node.setAttribute('rel', 'noopener noreferrer');
							}
						}
					}
				})
			: null;

	return (
		<div className={cn('p-6', isFirst && 'bg-zinc-900/20', className)}>
			{/* Main post content */}
			<div
				className={cn(
					'post-content prose prose-invert prose-zinc max-w-none mb-4',
					isFirst && 'text-zinc-200' // Slightly brighter text for OP
				)}
			>
				<div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
			</div>

			{/* Signature section */}
			{sanitizedSignature && (
				<div className="signature-section mt-6 pt-4 border-t border-zinc-600/30">
					<div
						className="signature-content text-sm text-zinc-400 italic max-h-20 overflow-hidden"
						dangerouslySetInnerHTML={{ __html: sanitizedSignature }}
					/>
				</div>
			)}

			{/* BBCode-style post content styling */}
			<style jsx>{`
				.post-content {
					line-height: 1.6;
					font-family:
						'Inter',
						-apple-system,
						BlinkMacSystemFont,
						sans-serif;
				}

				.post-content p {
					margin-bottom: 1rem;
				}

				.post-content p:last-child {
					margin-bottom: 0;
				}

				.post-content img {
					max-width: 100%;
					height: auto;
					border-radius: 6px;
					margin: 1rem 0;
					border: 1px solid rgba(82, 82, 91, 0.3);
				}

				.post-content a {
					color: rgb(34 197 94); /* emerald-500 */
					text-decoration: none;
					border-bottom: 1px solid transparent;
					transition: all 0.2s ease;
				}

				.post-content a:hover {
					color: rgb(16 185 129); /* emerald-600 */
					border-bottom-color: rgb(16 185 129);
				}

				/* Classic BBCode quote styling */
				.post-content blockquote {
					border-left: 4px solid rgb(34 197 94);
					background: rgba(39, 39, 42, 0.4);
					border-radius: 0 6px 6px 0;
					padding: 1rem;
					margin: 1.5rem 0;
					position: relative;
					font-style: italic;
				}

				.post-content blockquote:before {
					content: '💬';
					position: absolute;
					top: 8px;
					left: -12px;
					background: rgba(39, 39, 42, 0.9);
					border-radius: 50%;
					width: 20px;
					height: 20px;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 10px;
				}

				.post-content code {
					background: rgba(39, 39, 42, 0.8);
					padding: 2px 6px;
					border-radius: 4px;
					font-size: 0.9em;
					border: 1px solid rgba(82, 82, 91, 0.3);
					color: rgb(34 197 94);
				}

				.post-content pre {
					background: rgba(39, 39, 42, 0.8);
					padding: 1rem;
					border-radius: 6px;
					overflow-x: auto;
					border: 1px solid rgba(82, 82, 91, 0.3);
					margin: 1rem 0;
				}

				.post-content pre code {
					background: none;
					padding: 0;
					border: none;
					color: rgb(212 212 216); /* zinc-300 */
				}

				.post-content table {
					border-collapse: separate;
					border-spacing: 0;
					width: 100%;
					margin: 1rem 0;
					border: 1px solid rgba(82, 82, 91, 0.3);
					border-radius: 6px;
					overflow: hidden;
				}

				.post-content th,
				.post-content td {
					border-bottom: 1px solid rgba(82, 82, 91, 0.3);
					border-right: 1px solid rgba(82, 82, 91, 0.3);
					padding: 0.75rem;
					text-align: left;
				}

				.post-content th:last-child,
				.post-content td:last-child {
					border-right: none;
				}

				.post-content tr:last-child td {
					border-bottom: none;
				}

				.post-content th {
					background: rgba(39, 39, 42, 0.6);
					font-weight: 600;
					color: rgb(212 212 216); /* zinc-300 */
				}

				.post-content hr {
					border: none;
					border-top: 2px solid rgba(82, 82, 91, 0.3);
					margin: 2rem 0;
					border-radius: 1px;
				}

				/* List styling */
				.post-content ul,
				.post-content ol {
					margin: 1rem 0;
					padding-left: 1.5rem;
				}

				.post-content li {
					margin-bottom: 0.5rem;
				}

				/* Signature styling */
				.signature-content {
					max-height: 80px;
					overflow: hidden;
					position: relative;
				}

				.signature-content img {
					max-height: 60px;
					max-width: 150px;
					margin: 0.5rem 0;
				}

				.signature-content a {
					color: rgb(161 161 170); /* zinc-400 */
					text-decoration: none;
				}

				.signature-content a:hover {
					color: rgb(212 212 216); /* zinc-300 */
				}
			`}</style>
		</div>
	);
}
