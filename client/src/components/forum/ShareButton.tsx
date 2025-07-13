import type { ThreadId } from '@shared/types/ids';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
	threadId: ThreadId | string;
	threadTitle: string;
	variant?: 'button' | 'icon';
	className?: string;
	size?: 'default' | 'sm' | 'lg' | 'icon' | 'xl' | 'icon-sm';
}

export default function ShareButton({
	threadId,
	threadTitle,
	variant = 'button',
	className = '',
	size = 'default'
}: ShareButtonProps) {
	const [copied, setCopied] = useState(false);
	const threadUrl = `${window.location.origin}/threads/${threadId}`;

	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: threadTitle,
					url: threadUrl
				});
			} catch (err) {
				// User cancelled or error
			}
		} else {
			try {
				await navigator.clipboard.writeText(threadUrl);
				setCopied(true);
				setTimeout(() => setCopied(false), 1500);
			} catch (err) {
				// fallback: prompt
				window.prompt('Copy this link:', threadUrl);
			}
		}
	};

	return (
		<Button
			variant={variant === 'icon' ? 'ghost' : 'outline'}
			size={size}
			className={`flex items-center gap-2 ${className}`}
			onClick={handleShare}
			title={copied ? 'Copied!' : 'Share thread'}
			aria-label="Share thread"
		>
			<Share2 className="h-4 w-4" />
			{variant === 'button' && (copied ? 'Copied!' : 'Share')}
		</Button>
	);
}
