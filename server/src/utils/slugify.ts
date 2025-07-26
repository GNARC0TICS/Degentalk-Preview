export const slugify = (input: string): string => {
	return input
		.normalize('NFKD')
		.replace(/[\u0300-\u036F]/g, '') // Strip accents
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-') // Non-alphanumeric to hyphen
		.replace(/^-+|-+$/g, '') // Trim leading/trailing hyphens
		.replace(/--+/g, '-'); // Collapse multiple hyphens
};
