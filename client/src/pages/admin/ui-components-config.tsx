import React, { useState } from 'react';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	Button,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Switch,
	Separator,
	Badge
} from '@/components/ui';
import { useUIConfig } from '@/contexts/UIConfigContext';
import { useToast } from '@/hooks/use-toast';
import {
	Settings,
	Palette,
	Type,
	Layout,
	Loader,
	RotateCcw,
	Download,
	Upload,
	Eye
} from 'lucide-react';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { ZoneCard } from '@/components/forum/ZoneCard';

// Sample data for previews
const sampleZone = {
	id: 'sample' as any,
	name: 'Sample Zone',
	description: 'This is a preview of how zones will look with your settings',
	slug: 'sample',
	color: '#10b981',
	bannerImage: '/images/zone-banners/sample.jpg',
	postCount: 142,
	threadCount: 23,
	lastActivity: new Date(),
	settings: {},
	createdAt: new Date(),
	updatedAt: new Date()
};

const UIComponentsConfig: React.FC = () => {
	const { spacing, typography, components, loading, error, updateConfig, resetConfig } =
		useUIConfig();

	const { toast } = useToast();
	const [activeTab, setActiveTab] = useState('spacing');
	const [previewMode, setPreviewMode] = useState(false);

	const handleUpdateSpacing = async (key: string, value: any) => {
		try {
			await updateConfig('spacing', { [key]: value });
			toast({
				title: 'Spacing Updated',
				description: 'Your spacing configuration has been saved.'
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to update spacing configuration.',
				variant: 'destructive'
			});
		}
	};

	const handleUpdateComponents = async (componentType: string, updates: any) => {
		try {
			await updateConfig('components', {
				[componentType]: { ...components[componentType as keyof typeof components], ...updates }
			});
			toast({
				title: 'Component Updated',
				description: `${componentType} configuration has been saved.`
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to update component configuration.',
				variant: 'destructive'
			});
		}
	};

	const handleReset = async (type?: any) => {
		try {
			await resetConfig(type);
			toast({
				title: 'Configuration Reset',
				description: type
					? `${type} configuration has been reset to defaults.`
					: 'All configurations have been reset to defaults.'
			});
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to reset configuration.',
				variant: 'destructive'
			});
		}
	};

	const exportConfig = () => {
		const config = { spacing, typography, components };
		const blob = new Blob([JSON.stringify(config, null, 2)], {
			type: 'application/json'
		});

		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `degentalk-ui-config-${new Date().toISOString().split('T')[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	if (loading) {
		return (
			<div className="container mx-auto p-6">
				<LoadingIndicator message="Loading UI configuration..." centered />
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto p-6">
				<Card>
					<CardContent className="pt-6">
						<div className="text-center text-red-500">
							<p>Error loading configuration: {error.message}</p>
							<Button onClick={() => window.location.reload()} className="mt-4">
								Retry
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-6xl">
			{/* Header */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold flex items-center gap-2">
						<Settings className="h-8 w-8" />
						UI Components Configuration
					</h1>
					<p className="text-zinc-400 mt-2">Customize the look and feel of DegenTalk components</p>
				</div>

				<div className="flex gap-2">
					<Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
						<Eye className="h-4 w-4 mr-2" />
						{previewMode ? 'Edit' : 'Preview'}
					</Button>
					<Button variant="outline" onClick={exportConfig}>
						<Download className="h-4 w-4 mr-2" />
						Export
					</Button>
					<Button variant="destructive" onClick={() => handleReset()}>
						<RotateCcw className="h-4 w-4 mr-2" />
						Reset All
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Configuration Panel */}
				<div className="lg:col-span-2">
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="grid grid-cols-4 w-full">
							<TabsTrigger value="spacing" className="flex items-center gap-2">
								<Layout className="h-4 w-4" />
								Spacing
							</TabsTrigger>
							<TabsTrigger value="typography" className="flex items-center gap-2">
								<Type className="h-4 w-4" />
								Typography
							</TabsTrigger>
							<TabsTrigger value="components" className="flex items-center gap-2">
								<Palette className="h-4 w-4" />
								Components
							</TabsTrigger>
							<TabsTrigger value="loaders" className="flex items-center gap-2">
								<Loader className="h-4 w-4" />
								Loaders
							</TabsTrigger>
						</TabsList>

						{/* Spacing Configuration */}
						<TabsContent value="spacing" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Container & Section Spacing</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label>Container Base Padding</Label>
										<Input
											value={spacing.container.base}
											onChange={(e) =>
												handleUpdateSpacing('container', {
													...spacing.container,
													base: e.target.value
												})
											}
											placeholder="px-2 py-6"
										/>
									</div>

									<div>
										<Label>Section Margin</Label>
										<Input
											value={spacing.section.base}
											onChange={(e) =>
												handleUpdateSpacing('section', {
													base: e.target.value
												})
											}
											placeholder="mb-8"
										/>
									</div>

									<div>
										<Label>Large Section Margin</Label>
										<Input
											value={spacing.sectionLarge.base}
											onChange={(e) =>
												handleUpdateSpacing('sectionLarge', {
													base: e.target.value
												})
											}
											placeholder="mb-16"
										/>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Card Spacing</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label>Default Card Padding</Label>
										<Input
											value={spacing.card.base}
											onChange={(e) =>
												handleUpdateSpacing('card', {
													...spacing.card,
													base: e.target.value
												})
											}
											placeholder="p-4"
										/>
									</div>

									<div>
										<Label>Compact Card Padding</Label>
										<Input
											value={spacing.cardCompact.base}
											onChange={(e) =>
												handleUpdateSpacing('cardCompact', {
													...spacing.cardCompact,
													base: e.target.value
												})
											}
											placeholder="p-3"
										/>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Components Configuration */}
						<TabsContent value="components" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Zone Cards</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label>Card Variant</Label>
										<Select
											value={components.cards.variant}
											onValueChange={(value: any) =>
												handleUpdateComponents('cards', { variant: value })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="default">Default</SelectItem>
												<SelectItem value="compact">Compact</SelectItem>
												<SelectItem value="detailed">Detailed</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="flex items-center space-x-2">
										<Switch
											checked={components.cards.showBanner}
											onCheckedChange={(checked) =>
												handleUpdateComponents('cards', { showBanner: checked })
											}
										/>
										<Label>Show Zone Banners</Label>
									</div>

									<div>
										<Label>Border Radius</Label>
										<Select
											value={components.cards.borderRadius}
											onValueChange={(value) =>
												handleUpdateComponents('cards', { borderRadius: value })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="rounded-none">None</SelectItem>
												<SelectItem value="rounded-sm">Small</SelectItem>
												<SelectItem value="rounded-md">Medium</SelectItem>
												<SelectItem value="rounded-lg">Large</SelectItem>
												<SelectItem value="rounded-xl">Extra Large</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label>Shadow</Label>
										<Select
											value={components.cards.shadow}
											onValueChange={(value) => handleUpdateComponents('cards', { shadow: value })}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="shadow-none">None</SelectItem>
												<SelectItem value="shadow-sm">Small</SelectItem>
												<SelectItem value="shadow-md">Medium</SelectItem>
												<SelectItem value="shadow-lg">Large</SelectItem>
												<SelectItem value="shadow-xl">Extra Large</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Loaders Configuration */}
						<TabsContent value="loaders" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Loading Indicators</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label>Default Loader Style</Label>
										<Select
											value={components.loaders.style}
											onValueChange={(value: any) =>
												handleUpdateComponents('loaders', { style: value })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="spinner">Spinner</SelectItem>
												<SelectItem value="dots">Dots</SelectItem>
												<SelectItem value="pulse">Pulse</SelectItem>
												<SelectItem value="skeleton">Skeleton</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label>Default Size</Label>
										<Select
											value={components.loaders.size}
											onValueChange={(value: any) =>
												handleUpdateComponents('loaders', { size: value })
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="sm">Small</SelectItem>
												<SelectItem value="md">Medium</SelectItem>
												<SelectItem value="lg">Large</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="flex items-center space-x-2">
										<Switch
											checked={components.loaders.showMessage}
											onCheckedChange={(checked) =>
												handleUpdateComponents('loaders', { showMessage: checked })
											}
										/>
										<Label>Show Loading Messages</Label>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Typography Configuration */}
						<TabsContent value="typography" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Font Configuration</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<Label>Primary Font</Label>
										<Select
											value={typography.primary}
											onValueChange={(value) => updateConfig('typography', { primary: value })}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="inter">Inter</SelectItem>
												<SelectItem value="plusJakartaSans">Plus Jakarta Sans</SelectItem>
												<SelectItem value="manrope">Manrope</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label>Display Font</Label>
										<Select
											value={typography.display}
											onValueChange={(value) => updateConfig('typography', { display: value })}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="spaceGrotesk">Space Grotesk</SelectItem>
												<SelectItem value="orbitron">Orbitron</SelectItem>
												<SelectItem value="audiowide">Audiowide</SelectItem>
												<SelectItem value="blackOpsOne">Black Ops One</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label>Monospace Font</Label>
										<Select
											value={typography.mono}
											onValueChange={(value) => updateConfig('typography', { mono: value })}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="jetBrainsMono">JetBrains Mono</SelectItem>
												<SelectItem value="spaceMono">Space Mono</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>

				{/* Live Preview Panel */}
				<div className="lg:col-span-1">
					<Card className="sticky top-6">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Eye className="h-5 w-5" />
								Live Preview
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Zone Card Preview */}
							<div>
								<Label className="text-xs text-zinc-400">Zone Card</Label>
								<div className="mt-2">
									<ZoneCard zone={sampleZone} />
								</div>
							</div>

							<Separator />

							{/* Loading Preview */}
							<div>
								<Label className="text-xs text-zinc-400">Loading Indicators</Label>
								<div className="mt-2 space-y-3">
									<LoadingIndicator
										message="Loading content..."
										size={components.loaders.size}
										style={components.loaders.style}
										showMessage={components.loaders.showMessage}
									/>

									<div className="grid grid-cols-3 gap-2">
										<LoadingIndicator style="spinner" size="sm" showMessage={false} />
										<LoadingIndicator style="dots" size="sm" showMessage={false} />
										<LoadingIndicator style="pulse" size="sm" showMessage={false} />
									</div>
								</div>
							</div>

							<Separator />

							{/* Typography Preview */}
							<div>
								<Label className="text-xs text-zinc-400">Typography</Label>
								<div className="mt-2 space-y-2">
									<div className="text-lg font-bold">Display Heading</div>
									<div className="text-base">Body text content</div>
									<div className="text-sm font-mono">Monospace code</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default UIComponentsConfig;
