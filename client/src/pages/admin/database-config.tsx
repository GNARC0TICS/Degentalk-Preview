import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database, Settings, RefreshCw, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { RequireSuperAdmin } from '@/components/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';
import { toast } from 'sonner';

interface ConfigEntry {
	id: string;
	key: string;
	value: string;
	description?: string;
	category: string;
	environment: 'dev' | 'staging' | 'prod';
	updatedAt: string;
	updatedBy: string;
}

interface MigrationInfo {
	filename: string;
	status: 'pending' | 'applied' | 'failed';
	appliedAt?: string;
	isSafe: boolean;
	description?: string;
}

function DatabaseConfigPage() {
	const [editingConfig, setEditingConfig] = useState<ConfigEntry | null>(null);
	const [newConfigKey, setNewConfigKey] = useState('');
	const [newConfigValue, setNewConfigValue] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');
	const queryClient = useQueryClient();

	// Fetch configuration entries
	const { data: configData, isLoading: configLoading } = useQuery<ConfigEntry[]>({
		queryKey: ['/api/admin/database/config'],
		queryFn: async () => {
			const response = await fetch('/api/admin/database/config');
			if (!response.ok) throw new Error('Failed to fetch config');
			return response.json();
		}
	});

	// Fetch migration status
	const { data: migrationData, isLoading: migrationLoading } = useQuery<MigrationInfo[]>({
		queryKey: ['/api/admin/database/migrations'],
		queryFn: async () => {
			const response = await fetch('/api/admin/database/migrations');
			if (!response.ok) throw new Error('Failed to fetch migrations');
			return response.json();
		}
	});

	// Update configuration mutation
	const updateConfigMutation = useMutation({
		mutationFn: async ({ id, value }: { id: string; value: string }) => {
			const response = await fetch(`/api/admin/database/config/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ value })
			});
			if (!response.ok) throw new Error('Failed to update config');
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/database/config'] });
			toast.success('Configuration updated successfully');
			setEditingConfig(null);
		},
		onError: (error) => {
			toast.error(`Failed to update configuration: ${error.message}`);
		}
	});

	// Add new configuration mutation
	const addConfigMutation = useMutation({
		mutationFn: async ({
			key,
			value,
			category
		}: {
			key: string;
			value: string;
			category: string;
		}) => {
			const response = await fetch('/api/admin/database/config', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ key, value, category })
			});
			if (!response.ok) throw new Error('Failed to add config');
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/database/config'] });
			toast.success('Configuration added successfully');
			setNewConfigKey('');
			setNewConfigValue('');
		},
		onError: (error) => {
			toast.error(`Failed to add configuration: ${error.message}`);
		}
	});

	// Sync configuration to database
	const syncConfigMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch('/api/admin/database/sync', {
				method: 'POST'
			});
			if (!response.ok) throw new Error('Failed to sync configuration');
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/database/config'] });
			toast.success('Configuration synced successfully');
		},
		onError: (error) => {
			toast.error(`Failed to sync configuration: ${error.message}`);
		}
	});

	const categories = configData ? [...new Set(configData.map((config) => config.category))] : [];

	const filteredConfig =
		configData?.filter(
			(config) => selectedCategory === 'all' || config.category === selectedCategory
		) || [];

	const pendingMigrations = migrationData?.filter((m) => m.status === 'pending') || [];
	const unsafeMigrations = migrationData?.filter((m) => !m.isSafe) || [];

	return (
		<AdminPageShell title="Database Configuration">
			<p className="text-muted-foreground">
				Manage database configuration and monitor migration status.
			</p>

			{/* Safety Alerts */}
			{unsafeMigrations.length > 0 && (
				<Alert className="border-red-200 bg-red-50">
					<AlertTriangle className="h-4 w-4 text-red-600" />
					<AlertDescription className="text-red-700">
						<strong>Warning:</strong> {unsafeMigrations.length} unsafe migration(s) detected.
						Production deployments require *_safe.sql naming convention.
					</AlertDescription>
				</Alert>
			)}

			<Tabs defaultValue="configuration" className="space-y-4">
				<TabsList>
					<TabsTrigger value="configuration">Configuration</TabsTrigger>
					<TabsTrigger value="migrations">
						Migrations
						{pendingMigrations.length > 0 && (
							<Badge variant="destructive" className="ml-2">
								{pendingMigrations.length}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="sync">Sync Status</TabsTrigger>
				</TabsList>

				<TabsContent value="configuration" className="space-y-4">
					{/* Add New Configuration */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Settings className="h-5 w-5" />
								Add Configuration
							</CardTitle>
							<CardDescription>
								Add new configuration entries. Only touches configuration table, no DDL operations.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label htmlFor="new-key">Configuration Key</Label>
									<Input
										id="new-key"
										placeholder="e.g., forum.max_posts_per_day"
										value={newConfigKey}
										onChange={(e) => setNewConfigKey(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="new-value">Value</Label>
									<Input
										id="new-value"
										placeholder="Configuration value"
										value={newConfigValue}
										onChange={(e) => setNewConfigValue(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="new-category">Category</Label>
									<Input
										id="new-category"
										placeholder="e.g., forum, wallet, xp"
										value={selectedCategory === 'all' ? '' : selectedCategory}
										onChange={(e) => setSelectedCategory(e.target.value || 'all')}
									/>
								</div>
							</div>
							<Button
								onClick={() =>
									addConfigMutation.mutate({
										key: newConfigKey,
										value: newConfigValue,
										category: selectedCategory === 'all' ? 'general' : selectedCategory
									})
								}
								disabled={!newConfigKey || !newConfigValue || addConfigMutation.isPending}
							>
								{addConfigMutation.isPending ? 'Adding...' : 'Add Configuration'}
							</Button>
						</CardContent>
					</Card>

					{/* Configuration Categories */}
					<div className="flex gap-2 flex-wrap">
						<Button
							variant={selectedCategory === 'all' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setSelectedCategory('all')}
						>
							All Categories
						</Button>
						{categories.map((category) => (
							<Button
								key={category}
								variant={selectedCategory === category ? 'default' : 'outline'}
								size="sm"
								onClick={() => setSelectedCategory(category)}
							>
								{category} ({configData?.filter((c) => c.category === category).length})
							</Button>
						))}
					</div>

					{/* Configuration Table */}
					<Card>
						<CardHeader>
							<CardTitle>Configuration Entries</CardTitle>
							<CardDescription>
								Current configuration values. Changes are applied immediately.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{configLoading ? (
								<div className="text-center py-8">Loading configuration...</div>
							) : filteredConfig.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									No configuration entries found for the selected category.
								</div>
							) : (
								<div className="space-y-4">
									{filteredConfig.map((config) => (
										<div key={config.id} className="border rounded-lg p-4 space-y-2">
											<div className="flex items-center justify-between">
												<div className="space-y-1">
													<div className="flex items-center gap-2">
														<code className="text-sm font-mono bg-muted px-2 py-1 rounded">
															{config.key}
														</code>
														<Badge variant="outline">{config.category}</Badge>
														<Badge
															variant={config.environment === 'prod' ? 'destructive' : 'default'}
														>
															{config.environment}
														</Badge>
													</div>
													{config.description && (
														<p className="text-sm text-muted-foreground">{config.description}</p>
													)}
												</div>
												<Button
													variant="outline"
													size="sm"
													onClick={() => setEditingConfig(config)}
												>
													Edit
												</Button>
											</div>

											{editingConfig?.id === config.id ? (
												<div className="space-y-2">
													<Input
														value={editingConfig.value}
														onChange={(e) =>
															setEditingConfig({
																...editingConfig,
																value: e.target.value
															})
														}
													/>
													<div className="flex gap-2">
														<Button
															size="sm"
															onClick={() =>
																updateConfigMutation.mutate({
																	id: config.id,
																	value: editingConfig.value
																})
															}
															disabled={updateConfigMutation.isPending}
														>
															{updateConfigMutation.isPending ? 'Saving...' : 'Save'}
														</Button>
														<Button
															variant="outline"
															size="sm"
															onClick={() => setEditingConfig(null)}
														>
															Cancel
														</Button>
													</div>
												</div>
											) : (
												<div className="text-sm">
													<strong>Value:</strong> <code>{config.value}</code>
												</div>
											)}

											<div className="text-xs text-muted-foreground">
												Last updated: {new Date(config.updatedAt).toLocaleString()} by{' '}
												{config.updatedBy}
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="migrations" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								Migration Status
							</CardTitle>
							<CardDescription>
								Monitor database migration status and safety compliance.
							</CardDescription>
						</CardHeader>
						<CardContent>
							{migrationLoading ? (
								<div className="text-center py-8">Loading migration status...</div>
							) : migrationData?.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">No migrations found.</div>
							) : (
								<div className="space-y-4">
									{migrationData?.map((migration) => (
										<div key={migration.filename} className="border rounded-lg p-4">
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center gap-2">
													<code className="text-sm font-mono">{migration.filename}</code>
													<Badge
														variant={
															migration.status === 'applied'
																? 'default'
																: migration.status === 'failed'
																	? 'destructive'
																	: 'secondary'
														}
													>
														{migration.status}
													</Badge>
													{migration.isSafe ? (
														<Badge variant="outline" className="text-green-600 border-green-200">
															<CheckCircle className="h-3 w-3 mr-1" />
															Safe
														</Badge>
													) : (
														<Badge variant="destructive">
															<AlertTriangle className="h-3 w-3 mr-1" />
															Unsafe
														</Badge>
													)}
												</div>
											</div>
											{migration.description && (
												<p className="text-sm text-muted-foreground mb-2">
													{migration.description}
												</p>
											)}
											{migration.appliedAt && (
												<p className="text-xs text-muted-foreground">
													Applied: {new Date(migration.appliedAt).toLocaleString()}
												</p>
											)}
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="sync" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<RefreshCw className="h-5 w-5" />
								Configuration Sync
							</CardTitle>
							<CardDescription>
								Sync configuration changes to the database and verify forum structure.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-4">
								<Button
									onClick={() => syncConfigMutation.mutate()}
									disabled={syncConfigMutation.isPending}
								>
									{syncConfigMutation.isPending ? (
										<>
											<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
											Syncing...
										</>
									) : (
										<>
											<RefreshCw className="h-4 w-4 mr-2" />
											Sync Configuration
										</>
									)}
								</Button>
							</div>

							<Separator />

							<div className="space-y-4">
								<h4 className="font-medium">Sync Operations</h4>
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<h5 className="text-sm font-medium">Safe Operations</h5>
										<ul className="text-sm text-muted-foreground space-y-1">
											<li>• Update configuration values</li>
											<li>• Sync forum structure from forumMap.config.ts</li>
											<li>• Add new forum categories</li>
											<li>• Update forum rules and permissions</li>
										</ul>
									</div>
									<div className="space-y-2">
										<h5 className="text-sm font-medium">Protected Operations</h5>
										<ul className="text-sm text-muted-foreground space-y-1">
											<li>• No table structure changes</li>
											<li>• No data deletion</li>
											<li>• No schema modifications</li>
											<li>• Configuration-only updates</li>
										</ul>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</AdminPageShell>
	);
}

export default function ProtectedDatabaseConfigPage() {
	return (
		<RequireSuperAdmin>
			<DatabaseConfigPage />
		</RequireSuperAdmin>
	);
}
