/**
 * Font Configuration
 *
 * Centralized font configuration for the application.
 * Defines available fonts, their variants, and use cases.
 */

export interface FontConfig {
	name: string;
	family: string;
	googleFontsUrl: string;
	weights: string[];
	category: 'display' | 'body' | 'mono' | 'handwriting' | 'special';
	description: string;
	previewText?: string;
	cssVariable: string;
}

export const fontConfigs: Record<string, FontConfig> = {
	// Current main fonts
	inter: {
		name: 'Inter',
		family: 'Inter',
		googleFontsUrl:
			'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
		weights: [400, 500, 600, 700],
		category: 'body',
		description: 'Clean, modern sans-serif. Our default body font.',
		cssVariable: '--font-inter'
	},
	spaceGrotesk: {
		name: 'Space Grotesk',
		family: 'Space Grotesk',
		googleFontsUrl:
			'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap',
		weights: [400, 600, 700],
		category: 'display',
		description: 'Geometric sans-serif. Great for headlines.',
		cssVariable: '--font-space-grotesk'
	},

	// Cool display fonts for crypto/gaming vibe
	orbitron: {
		name: 'Orbitron',
		family: 'Orbitron',
		googleFontsUrl:
			'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&display=swap',
		weights: [400, 600, 700, 900],
		category: 'display',
		description: 'Futuristic geometric font. Perfect for crypto/tech headers.',
		previewText: 'DEGENTALK',
		cssVariable: '--font-orbitron'
	},
	audiowide: {
		name: 'Audiowide',
		family: 'Audiowide',
		googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Audiowide&display=swap',
		weights: [400],
		category: 'display',
		description: 'Wide, tech-inspired display font.',
		previewText: 'TO THE MOON!',
		cssVariable: '--font-audiowide'
	},
	blackOpsOne: {
		name: 'Black Ops One',
		family: 'Black Ops One',
		googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap',
		weights: [400],
		category: 'display',
		description: 'Military stencil style. Bold and aggressive.',
		previewText: 'DIAMOND HANDS',
		cssVariable: '--font-black-ops'
	},

	// Monospace fonts for code/stats
	jetBrainsMono: {
		name: 'JetBrains Mono',
		family: 'JetBrains Mono',
		googleFontsUrl:
			'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap',
		weights: [400, 600],
		category: 'mono',
		description: 'Modern monospace font. Great for stats and code.',
		previewText: '0x1234567890ABCDEF',
		cssVariable: '--font-jetbrains'
	},
	spaceMono: {
		name: 'Space Mono',
		family: 'Space Mono',
		googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
		weights: [400, 700],
		category: 'mono',
		description: 'Retro monospace with personality.',
		previewText: '$69,420.00',
		cssVariable: '--font-space-mono'
	},

	// Unique/fun fonts
	pressStart2P: {
		name: 'Press Start 2P',
		family: 'Press Start 2P',
		googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap',
		weights: [400],
		category: 'special',
		description: '8-bit arcade font. Perfect for gamification elements.',
		previewText: 'GAME OVER',
		cssVariable: '--font-press-start'
	},
	bungeeInline: {
		name: 'Bungee Inline',
		family: 'Bungee Inline',
		googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Bungee+Inline&display=swap',
		weights: [400],
		category: 'display',
		description: 'Urban, inline display font with attitude.',
		previewText: 'WHALE ALERT',
		cssVariable: '--font-bungee'
	},
	monoton: {
		name: 'Monoton',
		family: 'Monoton',
		googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Monoton&display=swap',
		weights: [400],
		category: 'special',
		description: 'Neon sign inspired display font.',
		previewText: 'CASINO',
		cssVariable: '--font-monoton'
	},

	// Alternative body fonts
	plusJakartaSans: {
		name: 'Plus Jakarta Sans',
		family: 'Plus Jakarta Sans',
		googleFontsUrl:
			'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
		weights: [400, 500, 600, 700],
		category: 'body',
		description: 'Modern geometric sans with friendly curves.',
		cssVariable: '--font-jakarta'
	},
	manrope: {
		name: 'Manrope',
		family: 'Manrope',
		googleFontsUrl:
			'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap',
		weights: [400, 500, 600, 700, 800],
		category: 'body',
		description: 'Versatile sans-serif with a tech feel.',
		cssVariable: '--font-manrope'
	}
};

// Helper function to get all font import URLs
export function getAllFontImports(): string[] {
	return Object.values(fontConfigs).map((font) => font.googleFontsUrl);
}

// Helper function to get fonts by category
export function getFontsByCategory(category: FontConfig['category']): FontConfig[] {
	return Object.values(fontConfigs).filter((font) => font.category === category);
}

// Font combinations that work well together
export const fontCombinations = [
	{
		name: 'Default Stack',
		display: 'spaceGrotesk',
		body: 'inter',
		mono: 'jetBrainsMono',
		description: 'Our current font stack'
	},
	{
		name: 'Futuristic',
		display: 'orbitron',
		body: 'plusJakartaSans',
		mono: 'spaceMono',
		description: 'Tech-forward, crypto aesthetic'
	},
	{
		name: 'Gaming',
		display: 'pressStart2P',
		body: 'manrope',
		mono: 'jetBrainsMono',
		description: 'Retro gaming vibes'
	},
	{
		name: 'Bold & Urban',
		display: 'bungeeInline',
		body: 'inter',
		mono: 'spaceMono',
		description: 'Street style meets tech'
	},
	{
		name: 'Neon Nights',
		display: 'monoton',
		body: 'plusJakartaSans',
		mono: 'jetBrainsMono',
		description: 'Casino and nightlife aesthetic'
	}
];
