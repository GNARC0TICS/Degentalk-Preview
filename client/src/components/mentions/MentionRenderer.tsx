import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/utils';

interface MentionRendererProps {
	content: string;
	className?: string;
	onMentionClick?: (username: string) => void;
}

/**
 * Renders text content with interactive @username mentions
 */
export function MentionRenderer({ content, className, onMentionClick }: MentionRendererProps) {
	// Regex to find @username mentions
	const mentionRegex = /@([a-zA-Z0-9_-]+)/g;

	// Split content into parts, preserving mentions
	const parts = content.split(mentionRegex);
	const elements: React.ReactNode[] = [];

	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];

		// Every odd index is a captured username from the regex
		if (i % 2 === 1) {
			// This is a username from a mention
			const username = part ?? '';
			const mentionElement = (
				<MentionLink key={i} username={username} onClick={() => onMentionClick?.(username ?? '')} />
			);
			elements.push(mentionElement);
		} else {
			// This is regular text
			if (part) {
				elements.push(<span key={i}>{part}</span>);
			}
		}
	}

	return <span className={className}>{elements}</span>;
}

interface MentionLinkProps {
	username: string;
	onClick?: () => void;
}

function MentionLink({ username, onClick }: MentionLinkProps) {
	return (
		<Link
			to={`/profile/${username}`}
			className={cn(
				'inline-flex items-center px-1 py-0.5 rounded',
				'bg-emerald-900/30 text-emerald-300 border border-emerald-700/30',
				'hover:bg-emerald-900/50 hover:text-emerald-200',
				'transition-colors duration-200',
				'text-sm font-medium'
			)}
			onClick={(e) => {
				if (onClick) {
					e.preventDefault();
					onClick();
				}
			}}
		>
			@{username}
		</Link>
	);
}

/**
 * Extract mentioned usernames from content
 */
export function extractMentions(content: string): string[] {
	const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
	const matches = content.match(mentionRegex);
	if (!matches) return [];

	// Remove @ symbol and return unique usernames
	return [...new Set(matches.map((match) => match.slice(1)))];
}

/**
 * Check if content contains any mentions
 */
export function hasMentions(content: string): boolean {
	return /@([a-zA-Z0-9_-]+)/.test(content);
}

/**
 * Highlight mentions in content for preview/editing
 */
export function highlightMentions(content: string): string {
	return content.replace(/@([a-zA-Z0-9_-]+)/g, '<span class="mention-highlight">@$1</span>');
}
