/**
 * Utility functions for handling mentions in content
 */

/**
 * Extracts usernames mentioned in text using @username pattern
 * Returns array of lowercase usernames without the @ symbol
 */
export function extractMentionsFromText(text: string): string[] {
	const regex = /@([A-Za-z0-9_]+)/g;
	const matches: string[] = [];
	let m;
	while ((m = regex.exec(text)) !== null) {
		matches.push(m[1].toLowerCase());
	}
	return Array.from(new Set(matches));
}

/**
 * Validates if a mention is properly formatted
 */
export function isValidMention(mention: string): boolean {
	return /^[A-Za-z0-9_]+$/.test(mention) && mention.length >= 3 && mention.length <= 20;
}
