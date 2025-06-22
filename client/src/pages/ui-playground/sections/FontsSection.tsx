import React, { useState } from 'react';
import { PlaygroundSection } from '@/pages/dev';
import { fontConfigs, fontCombinations, type FontConfig } from '@/config/fonts.config';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Type, Palette, Code, Sparkles } from 'lucide-react';

export function FontsSection() {
	const [customText, setCustomText] = useState('The quick brown fox jumps over the lazy dog');
	const [selectedCombination, setSelectedCombination] = useState(0);
	const [copiedFont, setCopiedFont] = useState<string | null>(null);

	// Group fonts by category
	const fontsByCategory = {
		display: Object.values(fontConfigs).filter((f) => f.category === 'display'),
		body: Object.values(fontConfigs).filter((f) => f.category === 'body'),
		mono: Object.values(fontConfigs).filter((f) => f.category === 'mono'),
		special: Object.values(fontConfigs).filter((f) => f.category === 'special'),
		handwriting: Object.values(fontConfigs).filter((f) => f.category === 'handwriting')
	};

	const copyToClipboard = (text: string, fontName: string) => {
		navigator.clipboard.writeText(text);
		setCopiedFont(fontName);
		setTimeout(() => setCopiedFont(null), 2000);
	};

	const getCategoryIcon = (category: FontConfig['category']) => {
		switch (category) {
			case 'display':
				return <Type className="h-4 w-4" />;
			case 'body':
				return <Type className="h-4 w-4" />;
			case 'mono':
				return <Code className="h-4 w-4" />;
			case 'special':
				return <Sparkles className="h-4 w-4" />;
			case 'handwriting':
				return <Palette className="h-4 w-4" />;
			default:
				return <Type className="h-4 w-4" />;
		}
	};

	const getCategoryColor = (category: FontConfig['category']) => {
		switch (category) {
			case 'display':
				return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
			case 'body':
				return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
			case 'mono':
				return 'bg-green-500/20 text-green-300 border-green-500/30';
			case 'special':
				return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
			case 'handwriting':
				return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
			default:
				return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
		}
	};

	const FontPreviewCard = ({ font }: { font: FontConfig }) => (
		<Card className="bg-zinc-900/70 border-zinc-800/60 hover:border-zinc-700/80 transition-all duration-200">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						{getCategoryIcon(font.category)}
						<CardTitle className="text-lg">{font.name}</CardTitle>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="outline" className={getCategoryColor(font.category)}>
							{font.category}
						</Badge>
						<Button
							variant="ghost"
							size="sm"
							onClick={() =>
								copyToClipboard(`font-${font.family.toLowerCase().replace(/\s+/g, '-')}`, font.name)
							}
							className="h-8 w-8 p-0 hover:bg-zinc-800/50"
						>
							<Copy className="h-3 w-3" />
						</Button>
					</div>
				</div>
				<p className="text-sm text-zinc-400">{font.description}</p>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{/* Font preview with custom text */}
					<div className="p-4 bg-zinc-800/40 rounded-lg">
						<div className="text-2xl leading-relaxed" style={{ fontFamily: font.family }}>
							{font.previewText || customText}
						</div>
					</div>

					{/* Font sizes showcase */}
					<div className="space-y-2">
						<div className="text-xs text-zinc-500 uppercase tracking-wide">Size Showcase</div>
						<div className="space-y-1">
							{[
								{ size: 'text-4xl', label: 'Heading 1' },
								{ size: 'text-2xl', label: 'Heading 2' },
								{ size: 'text-lg', label: 'Body Large' },
								{ size: 'text-base', label: 'Body' },
								{ size: 'text-sm', label: 'Small' }
							].map(({ size, label }) => (
								<div key={size} className="flex items-center gap-4">
									<div className="w-20 text-xs text-zinc-500">{label}</div>
									<div className={`${size} text-zinc-200`} style={{ fontFamily: font.family }}>
										{font.name}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Available weights */}
					<div className="space-y-2">
						<div className="text-xs text-zinc-500 uppercase tracking-wide">Weights</div>
						<div className="flex flex-wrap gap-2">
							{font.weights.map((weight) => (
								<Badge key={weight} variant="secondary" className="text-xs">
									{weight}
								</Badge>
							))}
						</div>
					</div>

					{/* CSS class name */}
					<div className="space-y-2">
						<div className="text-xs text-zinc-500 uppercase tracking-wide">Tailwind Class</div>
						<div className="flex items-center gap-2">
							<code className="text-xs bg-zinc-800/60 px-2 py-1 rounded font-mono text-emerald-400">
								font-{font.family.toLowerCase().replace(/\s+/g, '-')}
							</code>
							{copiedFont === font.name && (
								<Badge variant="outline" className="text-xs text-green-400 border-green-500/30">
									Copied!
								</Badge>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);

	return (
		<PlaygroundSection id="fonts" title="Typography & Fonts">
			<div className="space-y-8">
				{/* Custom preview text input */}
				<Card className="bg-zinc-900/70 border-zinc-800/60">
					<CardHeader>
						<CardTitle className="text-lg">Custom Preview Text</CardTitle>
					</CardHeader>
					<CardContent>
						<Input
							value={customText}
							onChange={(e) => setCustomText(e.target.value)}
							placeholder="Enter text to preview with all fonts..."
							className="bg-zinc-800/40 border-zinc-700/50"
						/>
					</CardContent>
				</Card>

				{/* Font combinations showcase */}
				<Card className="bg-zinc-900/70 border-zinc-800/60">
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<Palette className="h-5 w-5" />
							Font Combinations
						</CardTitle>
						<p className="text-sm text-zinc-400">Curated font pairings that work well together</p>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{fontCombinations.map((combo, index) => (
								<div
									key={combo.name}
									className={`p-4 rounded-lg border transition-all cursor-pointer ${
										selectedCombination === index
											? 'border-orange-500/50 bg-orange-500/10'
											: 'border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600/50'
									}`}
									onClick={() => setSelectedCombination(index)}
								>
									<div className="flex items-center justify-between mb-3">
										<h3 className="font-semibold text-zinc-200">{combo.name}</h3>
										<Badge variant="outline" className="text-xs">
											{combo.description}
										</Badge>
									</div>
									<div className="space-y-2">
										<div
											className="text-2xl font-bold text-zinc-100"
											style={{ fontFamily: fontConfigs[combo.display].family }}
										>
											Display: {fontConfigs[combo.display].name}
										</div>
										<div
											className="text-base text-zinc-300"
											style={{ fontFamily: fontConfigs[combo.body].family }}
										>
											Body: {fontConfigs[combo.body].name} - {customText}
										</div>
										<div
											className="text-sm text-zinc-400 font-mono"
											style={{ fontFamily: fontConfigs[combo.mono].family }}
										>
											Mono: {fontConfigs[combo.mono].name} - const example = "code";
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Fonts by category */}
				<Tabs defaultValue="display" className="w-full">
					<TabsList className="grid w-full grid-cols-5 bg-zinc-800/40">
						{Object.entries(fontsByCategory).map(([category, fonts]) => (
							<TabsTrigger
								key={category}
								value={category}
								className="capitalize data-[state=active]:bg-zinc-700/50"
								disabled={fonts.length === 0}
							>
								<span className="flex items-center gap-2">
									{getCategoryIcon(category as FontConfig['category'])}
									{category} ({fonts.length})
								</span>
							</TabsTrigger>
						))}
					</TabsList>

					{Object.entries(fontsByCategory).map(([category, fonts]) => (
						<TabsContent key={category} value={category} className="mt-6">
							<div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
								{fonts.map((font) => (
									<FontPreviewCard key={font.name} font={font} />
								))}
							</div>
						</TabsContent>
					))}
				</Tabs>

				{/* Usage instructions */}
				<Card className="bg-zinc-900/70 border-zinc-800/60">
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<Code className="h-5 w-5" />
							Usage Instructions
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4 text-sm text-zinc-300">
							<div>
								<h4 className="font-semibold text-zinc-200 mb-2">Tailwind CSS Classes</h4>
								<p>
									All fonts are available as Tailwind CSS classes. Use{' '}
									<code className="bg-zinc-800/60 px-1 py-0.5 rounded text-emerald-400">
										font-{'{font-key}'}
									</code>{' '}
									to apply them.
								</p>
							</div>
							<div>
								<h4 className="font-semibold text-zinc-200 mb-2">Custom CSS</h4>
								<p>
									You can also use them directly in CSS with{' '}
									<code className="bg-zinc-800/60 px-1 py-0.5 rounded text-emerald-400">
										font-family: '{'{font-name}'}';
									</code>
								</p>
							</div>
							<div>
								<h4 className="font-semibold text-zinc-200 mb-2">Configuration</h4>
								<p>
									Font configurations are centralized in{' '}
									<code className="bg-zinc-800/60 px-1 py-0.5 rounded text-emerald-400">
										@/config/fonts.config.ts
									</code>
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</PlaygroundSection>
	);
}
