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
			'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
			'a', 'img', 'span', 'div', 'blockquote', 'code', 'pre'
		],
		ALLOWED_ATTR: [
			'href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel'
		],
		ALLOW_DATA_ATTR: false,
		ADD_ATTR: ['target'],
		// Force external links to open in new tab
		HOOK_ATTRIBUTES: {
			a: function(node) {
				const href = node.getAttribute('href');
				if (href && (href.startsWith('http') || href.startsWith('//'))) {
					node.setAttribute('target', '_blank');
					node.setAttribute('rel', 'noopener noreferrer');
				}
			}
		}
	});

	return (
		<div className={`border-t border-zinc-800/30 pt-3 mt-3 ${className}`}>
			<div
				className="prose prose-invert prose-zinc prose-sm max-w-none overflow-hidden"
				style={{ maxHeight: `${maxHeight}px` }}
			>
				{/* Signature content */}
				<div 
					className="signature-content text-xs text-zinc-400 leading-relaxed"
					dangerouslySetInnerHTML={{ __html: sanitizedSignature }}
				/>
			</div>
			
			{/* Optional signature attribution */}
			<div className="text-[10px] text-zinc-600 mt-1 italic">
				— {username}
			</div>
			
			<style jsx>{`
				.signature-content {
					/* Ensure images don't break layout */
				}
				.signature-content img {
					max-width: 100px;
					max-height: 40px;
					object-fit: contain;
				}
				.signature-content a {
					color: rgb(34 197 94); /* emerald-500 */
					text-decoration: none;
				}
				.signature-content a:hover {
					color: rgb(16 185 129); /* emerald-600 */
					text-decoration: underline;
				}
				.signature-content p {
					margin: 0.25rem 0;
				}
				.signature-content p:first-child {
					margin-top: 0;
				}
				.signature-content p:last-child {
					margin-bottom: 0;
				}
				/* BBCode-style formatting */
				.signature-content [style*="color"] {
					/* Allow color styling but with reduced opacity */
					opacity: 0.8;
				}
				.signature-content code {
					background: rgba(39, 39, 42, 0.5);
					padding: 1px 4px;
					border-radius: 3px;
					font-size: 10px;
				}
				.signature-content blockquote {
					border-left: 2px solid rgb(82 82 91);
					padding-left: 0.5rem;
					margin: 0.25rem 0;
					font-style: italic;
				}
			`}</style>
		</div>
	);
}