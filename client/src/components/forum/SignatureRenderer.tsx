import React from 'react';
import DOMPurify from 'dompurify';

interface SignatureRendererProps {
	signature?: string | null;
	username: string;
	showSignatures?: boolean; // User setting
	maxHeight?: number; // px
	className?: string;
}

export function SignatureRenderer({
	signature,
	username,
	showSignatures = true,
	maxHeight = 100,
	className = ''
}: SignatureRendererProps) {
	// Don't render if signatures are disabled or no signature exists
	if (!showSignatures || !signature || signature.trim() === '') {
		return null;
	}

	// Sanitize the signature content
	const sanitizedSignature = DOMPurify.sanitize(signature, {
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
			'span',
			'div',
			'blockquote',
			'code',
			'pre'
		],
		ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel'],
		ALLOW_DATA_ATTR: false,
		// Force external links to open in new tab
		HOOKS: {
			afterSanitizeAttributes: function (node: Element) {
				if ('href' in node) {
					node.setAttribute('target', '_blank');
					node.setAttribute('rel', 'noopener noreferrer');
				}
			}
		}
	} as any);

	return (
		<div className={`border-t border-zinc-800/30 pt-3 mt-3 ${className}`}>
			<div
				className="prose prose-invert prose-zinc prose-sm max-w-none overflow-hidden"
				style={{ maxHeight: `${maxHeight}px` }}
			>
				{/* Signature content */}
				<div
					className="signature-content text-xs text-zinc-400 leading-relaxed"
					dangerouslySetInnerHTML={{ __html: sanitizedSignature as unknown as string }}
				/>
			</div>

			{/* Optional signature attribution */}
			<div className="text-[10px] text-zinc-600 mt-1 italic">— {username}</div>

			{/* Signature content styles - converted from styled-jsx */}
			<style dangerouslySetInnerHTML={{
				__html: `
					.signature-content img {
						max-width: 100px !important;
						max-height: 40px !important;
						object-fit: contain !important;
					}
					.signature-content a {
						color: rgb(34 197 94) !important; /* emerald-500 */
						text-decoration: none !important;
					}
					.signature-content a:hover {
						color: rgb(16 185 129) !important; /* emerald-600 */
						text-decoration: underline !important;
					}
					.signature-content p {
						margin: 0.25rem 0 !important;
					}
					.signature-content p:first-child {
						margin-top: 0 !important;
					}
					.signature-content p:last-child {
						margin-bottom: 0 !important;
					}
					.signature-content [style*='color'] {
						opacity: 0.8 !important;
					}
					.signature-content code {
						background: rgba(39, 39, 42, 0.5) !important;
						padding: 1px 4px !important;
						border-radius: 3px !important;
						font-size: 10px !important;
					}
					.signature-content blockquote {
						border-left: 2px solid rgb(82 82 91) !important;
						padding-left: 0.5rem !important;
						margin: 0.25rem 0 !important;
						font-style: italic !important;
					}
				`
			}} />
		</div>
	);
}
