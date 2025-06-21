export function extractMentionsFromText(text: string): string[] {
	const regex = /@([A-Za-z0-9_]+)/g;
	const matches: string[] = [];
	let m;
	while ((m = regex.exec(text)) !== null) {
		matches.push(m[1].toLowerCase());
	}
	return Array.from(new Set(matches));
}
