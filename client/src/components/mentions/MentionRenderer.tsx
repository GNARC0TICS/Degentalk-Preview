import React from 'react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

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
			const username = part;
			const mentionElement = (
				<MentionLink
					key={i}
					username={username}
					onClick={() => onMentionClick?.(username)}
				/>
			);
			elements.push(mentionElement);
		} else {
			// This is regular text
			if (part) {
				elements.push(
					<span key={i}>{part}</span>
				);
			}
		}
	}
	
	return (
		<span className={className}>
			{elements}
		</span>
	);
}

interface MentionLinkProps {
	username: string;
	onClick?: () => void;
}

function MentionLink({ username, onClick }: MentionLinkProps) {
	return (
		<Link
			href={`/profile/${username}`}
			className={cn(
				\"inline-flex items-center px-1 py-0.5 rounded\",\n\t\t\t\t\"bg-emerald-900/30 text-emerald-300 border border-emerald-700/30\",\n\t\t\t\t\"hover:bg-emerald-900/50 hover:text-emerald-200\",\n\t\t\t\t\"transition-colors duration-200\",\n\t\t\t\t\"text-sm font-medium\"\n\t\t\t)}\n\t\t\tonClick={(e) => {\n\t\t\t\tif (onClick) {\n\t\t\t\t\te.preventDefault();\n\t\t\t\t\tonClick();\n\t\t\t\t}\n\t\t\t}}\n\t\t>\n\t\t\t@{username}\n\t\t</Link>\n\t);\n}\n\n/**\n * Extract mentioned usernames from content\n */\nexport function extractMentions(content: string): string[] {\n\tconst mentionRegex = /@([a-zA-Z0-9_-]+)/g;\n\tconst matches = content.match(mentionRegex);\n\tif (!matches) return [];\n\t\n\t// Remove @ symbol and return unique usernames\n\treturn [...new Set(matches.map(match => match.slice(1)))];\n}\n\n/**\n * Check if content contains any mentions\n */\nexport function hasMentions(content: string): boolean {\n\treturn /@([a-zA-Z0-9_-]+)/.test(content);\n}\n\n/**\n * Highlight mentions in content for preview/editing\n */\nexport function highlightMentions(content: string): string {\n\treturn content.replace(\n\t\t/@([a-zA-Z0-9_-]+)/g,\n\t\t'<span class=\"mention-highlight\">@$1</span>'\n\t);\n}