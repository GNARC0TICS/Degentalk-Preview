import React from 'react';
import DOMPurify from 'dompurify';
import { SignatureTierLevel } from '@shared/signature/SignatureTierConfig';
import { useUserCosmetics } from '@/hooks/useUserCosmetics';
import { cn } from '@/lib/utils';

type SignatureRendererProps = {
	signature: string;
	tier?: SignatureTierLevel;
	isCollapsible?: boolean;
	className?: string;
	userId?: UserId;
};

/**
 * Component for rendering user signatures with BBCode support, safety measures,
 * and cosmetic effects from user inventory.
 */
export function SignatureRenderer({
	signature,
	tier,
	isCollapsible = true,
	className = '',
	userId
}: SignatureRendererProps) {
	const [isCollapsed, setIsCollapsed] = React.useState(isCollapsible);
	const { cosmetics, isLoading: isLoadingCosmetics } = useUserCosmetics();

	// If no signature, return nothing
	if (!signature || signature.trim() === '') {
		return null;
	}

	// Handle loading state for cosmetics
	if (isLoadingCosmetics) {
		return (
			<div className="signature-container text-sm border-t pt-2 mt-2 border-gray-700">
				Loading signature...
			</div>
		);
	}

	// Determine features from cosmetics
	const { emojiMap, unlockedFeatures } = cosmetics;
	const hasCustomFont = unlockedFeatures.includes('customSignatureFont');
	const hasUnicodeSignatures = unlockedFeatures.includes('unicode_signatures');

	// Simple BBCode parser - in a real app, use a full BBCode parser library
	const parseBBCode = (text: string) => {
		let parsed = text;

		// Apply custom font if unlocked
		if (hasCustomFont) {
			parsed = `<span class="custom-signature-font">${parsed}</span>`;
		}

		// Replace emoji codes with image tags from emojiMap
		for (const emojiCode in emojiMap) {
			if (emojiMap.hasOwnProperty(emojiCode)) {
				const imageUrl = emojiMap[emojiCode];
				const escapedEmojiCode = emojiCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				const regex = new RegExp(`:${escapedEmojiCode}:`, 'g');
				parsed = parsed.replace(
					regex,
					`<img src="${imageUrl}" alt="${emojiCode}" class="inline-block h-5 w-5 align-text-bottom" />`
				);
			}
		}

		// Start with basic formatting
		parsed = parsed
			// Bold
			.replace(/\[b\](.*?)\[\/b\]/g, '<strong>$1</strong>')
			// Italic
			.replace(/\[i\](.*?)\[\/i\]/g, '<em>$1</em>')
			// Underline
			.replace(/\[u\](.*?)\[\/u\]/g, '<span style="text-decoration: underline;">$1</span>')
			// Strike
			.replace(/\[s\](.*?)\[\/s\]/g, '<span style="text-decoration: line-through;">$1</span>')
			// Color
			.replace(/\[color=([a-zA-Z0-9#]+)\](.*?)\[\/color\]/g, '<span style="color: $1;">$2</span>');

		// Only add image support if the tier allows it
		if (tier?.canUseImages) {
			parsed = parsed
				// Image with URL
				.replace(
					/\[img\](.*?)\[\/img\]/g,
					'<img src="$1" alt="Signature Image" class="max-h-16 max-w-full" />'
				);
		}

		// Simple link support
		parsed = parsed.replace(
			/\[url=(.*?)\](.*?)\[\/url\]/g,
			'<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>'
		);

		// Line breaks
		parsed = parsed.replace(/\n/g, '<br>');

		return parsed;
	};

	// Parse the BBCode and sanitize
	const parsedSignature = parseBBCode(signature);
	const sanitizedSignature = DOMPurify.sanitize(parsedSignature, {
		ALLOWED_TAGS: ['b', 'i', 'u', 'em', 'strong', 'span', 'a', 'br', 'img'],
		ALLOWED_ATTR: ['style', 'href', 'target', 'rel', 'src', 'alt', 'class'],
		ALLOW_DATA_ATTR: false
	});

	// Apply signature effects (these are general visual effects, not specific unlocks)
	const applyVisualEffects = () => {
		let effectClasses = '';

		if (unlockedFeatures.includes('animated_glow')) {
			effectClasses += ' animate-pulse';
		}
		if (unlockedFeatures.includes('gradient_text')) {
			effectClasses +=
				' bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500';
		}

		return effectClasses;
	};

	// Classes for signature container
	const containerClasses = [
		'signature-container',
		'text-sm',
		'border-t',
		'pt-2',
		'mt-2',
		'border-gray-700',
		applyVisualEffects(),
		className,
		isCollapsed ? 'max-h-16 overflow-hidden' : ''
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={containerClasses}>
			{isCollapsible && (
				<div className="flex justify-end mb-1">
					<button
						onClick={() => setIsCollapsed(!isCollapsed)}
						className="text-xs text-gray-500 hover:text-gray-300"
					>
						{isCollapsed ? 'Show Full Signature' : 'Collapse Signature'}
					</button>
				</div>
			)}
			<div className="signature-content" dangerouslySetInnerHTML={{ __html: sanitizedSignature }} />
		</div>
	);
}
