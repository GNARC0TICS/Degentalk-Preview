/**
 * Magic UI Fixture Builder Component
 * Interactive component for building and managing test fixtures
 */

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, Play, Settings, Users, MessageSquare, Coins } from 'lucide-react';
import { toast } from 'sonner';

interface FixtureConfig {
	type: 'user' | 'thread' | 'post' | 'transaction' | 'scenario';
	count: number;
	state?: string | undefined;
	overrides: Record<string, any>;
	relationships: Record<string, any>;
}

interface FixtureBuilderProps {
	onGenerate?: (fixtures: any[]) => void;
	onExport?: (config: FixtureConfig) => void;
}

export function FixtureBuilder({ onGenerate, onExport }: FixtureBuilderProps) {
	const [config, setConfig] = useState<FixtureConfig>({
		type: 'user',
		count: 10,
		overrides: {},
		relationships: {}
	});

	const [generatedFixtures, setGeneratedFixtures] = useState<any[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);

	const fixtureTypes = [
		{
			value: 'user',
			label: 'Users',
			icon: Users,
			description: 'Generate user accounts with crypto personas'
		},
		{
			value: 'thread',
			label: 'Threads',
			icon: MessageSquare,
			description: 'Create forum threads with realistic titles'
		},
		{
			value: 'post',
			label: 'Posts',
			icon: MessageSquare,
			description: 'Generate posts with crypto community content'
		},
		{
			value: 'transaction',
			label: 'Transactions',
			icon: Coins,
			description: 'Create wallet transactions and DGT operations'
		},
		{
			value: 'scenario',
			label: 'Scenarios',
			icon: Settings,
			description: 'Complex multi-entity test scenarios'
		}
	];

	const userStates = ['admin', 'moderator', 'newbie', 'whale', 'banned', 'inactive'];
	const threadStates = ['hot', 'pinned', 'locked', 'empty'];
	const postStates = ['first', 'popular', 'controversial', 'reply'];

	const getStatesForType = useCallback((type: string) => {
		switch (type) {
			case 'user':
				return userStates;
			case 'thread':
				return threadStates;
			case 'post':
				return postStates;
			default:
				return [];
		}
	}, []);

	const generateFixtures = useCallback(async () => {
		setIsGenerating(true);
		try {
			// Simulate fixture generation
			await new Promise((resolve) => setTimeout(resolve, 1000));

			const fixtures = Array.from({ length: config.count }, (_, i) => ({
				id: i + 1,
				type: config.type,
				state: config.state,
				...config.overrides,
				generated_at: new Date().toISOString()
			}));

			setGeneratedFixtures(fixtures);
			onGenerate?.(fixtures);
			toast.success(`Generated ${config.count} ${config.type} fixtures`);
		} catch (error) {
			toast.error('Failed to generate fixtures');
		} finally {
			setIsGenerating(false);
		}
	}, [config, onGenerate]);

	const exportConfig = useCallback(() => {
		const exportData = {
			...config,
			exported_at: new Date().toISOString(),
			version: '1.0'
		};

		const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `fixture-config-${config.type}-${Date.now()}.json`;
		link.click();
		URL.revokeObjectURL(url);

		onExport?.(config);
		toast.success('Configuration exported');
	}, [config, onExport]);

	const copyToClipboard = useCallback(async (content: string) => {
		try {
			await navigator.clipboard.writeText(content);
			toast.success('Copied to clipboard');
		} catch {
			toast.error('Failed to copy');
		}
	}, []);

	const selectedTypeInfo = useMemo(
		() => fixtureTypes.find((t) => t.value === config.type),
		[config.type]
	);

	return (
		<div className="max-w-6xl mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Fixture Builder</h1>
					<p className="text-muted-foreground">Create realistic test data for Degentalk</p>
				</div>
				<div className="flex gap-2">
					<Button onClick={exportConfig} variant="outline">
						<Download className="w-4 h-4 mr-2" />
						Export Config
					</Button>
					<Button onClick={generateFixtures} disabled={isGenerating}>
						<Play className="w-4 h-4 mr-2" />
						{isGenerating ? 'Generating...' : 'Generate'}
					</Button>
				</div>
			</div>

			<Tabs defaultValue="configure" className="space-y-6">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="configure">Configure</TabsTrigger>
					<TabsTrigger value="preview">Preview</TabsTrigger>
					<TabsTrigger value="scenarios">Scenarios</TabsTrigger>
				</TabsList>

				<TabsContent value="configure" className="space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Type Selection */}
						<Card>
							<CardHeader>
								<CardTitle>Fixture Type</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{fixtureTypes.map((type) => {
									const Icon = type.icon;
									return (
										<div
											key={type.value}
											className={`p-3 border rounded-lg cursor-pointer transition-colors ${
												config.type === type.value
													? 'border-primary bg-primary/5'
													: 'border-border hover:border-primary/50'
											}`}
											onClick={() => setConfig((prev) => ({ ...prev, type: type.value as any }))}
										>
											<div className="flex items-start gap-3">
												<Icon className="w-5 h-5 mt-0.5" />
												<div>
													<div className="font-medium">{type.label}</div>
													<div className="text-sm text-muted-foreground">{type.description}</div>
												</div>
											</div>
										</div>
									);
								})}
							</CardContent>
						</Card>

						{/* Configuration */}
						<Card>
							<CardHeader>
								<CardTitle>Configuration</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="count">Count</Label>
									<Input
										id="count"
										type="number"
										min="1"
										max="10000"
										value={config.count}
										onChange={(e) =>
											setConfig((prev) => ({
												...prev,
												count: parseInt(e.target.value) || 1
											}))
										}
									/>
								</div>

								{getStatesForType(config.type).length > 0 && (
									<div>
										<Label htmlFor="state">State (Optional)</Label>
										<Select
											value={config.state || ''}
											onValueChange={(value) =>
												setConfig((prev) => ({
													...prev,
													state: value || undefined
												}))
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select state" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="">Default</SelectItem>
												{getStatesForType(config.type).map((state) => (
													<SelectItem key={state} value={state}>
														{state.charAt(0).toUpperCase() + state.slice(1)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}

								<div>
									<Label htmlFor="overrides">Custom Overrides (JSON)</Label>
									<Textarea
										id="overrides"
										placeholder='{"username": "custom_user", "role": "admin"}'
										value={JSON.stringify(config.overrides, null, 2)}
										onChange={(e) => {
											try {
												const parsed = JSON.parse(e.target.value || '{}');
												setConfig((prev) => ({ ...prev, overrides: parsed }));
											} catch {
												// Invalid JSON, ignore
											}
										}}
										className="font-mono text-sm"
										rows={4}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Quick Actions */}
						<Card>
							<CardHeader>
								<CardTitle>Quick Actions</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<Button
									variant="outline"
									className="w-full justify-start"
									onClick={() =>
										setConfig((prev) => ({
											...prev,
											type: 'user',
											count: 5,
											state: 'admin'
										}))
									}
								>
									5 Admin Users
								</Button>

								<Button
									variant="outline"
									className="w-full justify-start"
									onClick={() =>
										setConfig((prev) => ({
											...prev,
											type: 'thread',
											count: 20,
											state: 'hot'
										}))
									}
								>
									20 Hot Threads
								</Button>

								<Button
									variant="outline"
									className="w-full justify-start"
									onClick={() =>
										setConfig((prev) => ({
											...prev,
											type: 'user',
											count: 100,
											state: 'whale'
										}))
									}
								>
									100 Crypto Whales
								</Button>

								<Button
									variant="outline"
									className="w-full justify-start"
									onClick={() =>
										setConfig((prev) => ({
											...prev,
											type: 'transaction',
											count: 1000
										}))
									}
								>
									1000 Transactions
								</Button>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="preview" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								{selectedTypeInfo?.icon && <selectedTypeInfo.icon className="w-5 h-5" />}
								Generated {selectedTypeInfo?.label}
								<Badge variant="secondary">{generatedFixtures.length}</Badge>
							</CardTitle>
						</CardHeader>
						<CardContent>
							{generatedFixtures.length > 0 ? (
								<div className="space-y-4">
									<div className="flex gap-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() => copyToClipboard(JSON.stringify(generatedFixtures, null, 2))}
										>
											<Copy className="w-4 h-4 mr-2" />
											Copy JSON
										</Button>
									</div>

									<div className="border rounded-lg p-4 bg-muted/50 max-h-96 overflow-auto">
										<pre className="text-sm">
											{JSON.stringify(generatedFixtures.slice(0, 3), null, 2)}
											{generatedFixtures.length > 3 && (
												<div className="text-muted-foreground italic">
													... and {generatedFixtures.length - 3} more
												</div>
											)}
										</pre>
									</div>
								</div>
							) : (
								<div className="text-center py-8 text-muted-foreground">
									Generate fixtures to see preview
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="scenarios" className="space-y-6">
					<ScenarioBuilder />
				</TabsContent>
			</Tabs>
		</div>
	);
}

function ScenarioBuilder() {
	const [scenarios] = useState([
		{
			name: 'Forum Discussion',
			description: 'Create a complete forum discussion with users, thread, and posts',
			steps: ['5 users', '1 thread', '20 posts', 'engagement data']
		},
		{
			name: 'Whale Activity',
			description: 'Simulate whale user activity with large transactions',
			steps: ['1 whale user', '50 transactions', 'tip history', 'reputation']
		},
		{
			name: 'New User Onboarding',
			description: 'Fresh user experience with initial setup',
			steps: ['1 newbie user', 'empty wallet', 'first posts', 'level progression']
		}
	]);

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{scenarios.map((scenario, index) => (
				<Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
					<CardHeader>
						<CardTitle className="text-lg">{scenario.name}</CardTitle>
						<p className="text-sm text-muted-foreground">{scenario.description}</p>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{scenario.steps.map((step, stepIndex) => (
								<div key={stepIndex} className="flex items-center gap-2">
									<div className="w-2 h-2 bg-primary rounded-full" />
									<span className="text-sm">{step}</span>
								</div>
							))}
						</div>
						<Button className="w-full mt-4" size="sm">
							Generate Scenario
						</Button>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
