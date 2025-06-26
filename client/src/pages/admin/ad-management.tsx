import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Settings,
	Plus,
	Edit,
	Trash2,
	BarChart3,
	Shield,
	DollarSign,
	Users,
	TrendingUp,
	AlertTriangle,
	CheckCircle
} from 'lucide-react';
import { Container } from '@/components/ui/Container';

interface AdSystemConfig {
	placements: {
		enabled: boolean;
		defaultFloorPrice: number;
		maxDailyBudget: number;
		approvalRequired: boolean;
	};
	targeting: {
		enablePersonalization: boolean;
		dataRetentionDays: number;
		requireConsent: boolean;
		allowCrossSiteTracking: boolean;
	};
	revenue: {
		platformCommission: number;
		dgtRewardPool: number;
		minimumPayout: number;
		payoutSchedule: 'daily' | 'weekly' | 'monthly';
	};
	content: {
		autoApproval: boolean;
		adultContentAllowed: boolean;
		cryptoContentOnly: boolean;
		requireDisclaimer: boolean;
	};
	governance: {
		enableCommunityVoting: boolean;
		minimumTokensToVote: number;
		votingPeriodDays: number;
		quorumPercentage: number;
	};
}

interface AdPlacement {
	id: string;
	name: string;
	slug: string;
	position: string;
	dimensions?: string;
	floorPriceCpm: number;
	isActive: boolean;
	analytics: {
		impressions: number;
		revenue: number;
		fillRate: number;
	};
}

interface PlatformAnalytics {
	totalRevenue: number;
	totalImpressions: number;
	averageCtr: number;
	activeCampaigns: number;
	totalAdvertisers: number;
	dgtRewardsDistributed: number;
}

export default function AdManagementPage() {
	const [config, setConfig] = useState<AdSystemConfig | null>(null);
	const [placements, setPlacements] = useState<AdPlacement[]>([]);
	const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('overview');

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);

			// Load configuration
			const configResponse = await fetch('/api/ads/admin/config');
			const configData = await configResponse.json();
			setConfig(configData);

			// Load placements
			const placementsResponse = await fetch('/api/ads/admin/placements');
			const placementsData = await placementsResponse.json();
			setPlacements(placementsData);

			// Load analytics
			const analyticsResponse = await fetch('/api/ads/admin/analytics');
			const analyticsData = await analyticsResponse.json();
			setAnalytics(analyticsData);
		} catch (error) {
			console.error('Failed to load ad management data:', error);
		} finally {
			setLoading(false);
		}
	};

	const updateConfig = async (updates: Partial<AdSystemConfig>) => {
		try {
			const response = await fetch('/api/ads/admin/config', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updates)
			});

			if (response.ok) {
				const updatedConfig = await response.json();
				setConfig(updatedConfig);
			}
		} catch (error) {
			console.error('Failed to update configuration:', error);
		}
	};

	if (loading) {
		return (
			<Container className="py-8">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
					<p className="text-zinc-400">Loading ad management...</p>
				</div>
			</Container>
		);
	}

	return (
		<Container className="py-8">
			<div className="space-y-8">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold text-white">Ad System Management</h1>
						<p className="text-zinc-400 mt-2">
							Configure and monitor the Degentalk advertising platform
						</p>
					</div>
					<Button className="bg-emerald-600 hover:bg-emerald-700">
						<Plus className="h-4 w-4 mr-2" />
						Create Placement
					</Button>
				</div>

				{/* Analytics Overview */}
				{analytics && (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
						<Card className="bg-zinc-900 border-zinc-800">
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-zinc-400">Total Revenue</p>
										<p className="text-2xl font-bold text-white">
											${analytics.totalRevenue.toLocaleString()}
										</p>
									</div>
									<DollarSign className="h-8 w-8 text-emerald-500" />
								</div>
							</CardContent>
						</Card>

						<Card className="bg-zinc-900 border-zinc-800">
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-zinc-400">Impressions</p>
										<p className="text-2xl font-bold text-white">
											{(analytics.totalImpressions / 1000000).toFixed(1)}M
										</p>
									</div>
									<BarChart3 className="h-8 w-8 text-blue-500" />
								</div>
							</CardContent>
						</Card>

						<Card className="bg-zinc-900 border-zinc-800">
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-zinc-400">Average CTR</p>
										<p className="text-2xl font-bold text-white">
											{(analytics.averageCtr * 100).toFixed(2)}%
										</p>
									</div>
									<TrendingUp className="h-8 w-8 text-purple-500" />
								</div>
							</CardContent>
						</Card>

						<Card className="bg-zinc-900 border-zinc-800">
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-zinc-400">Active Campaigns</p>
										<p className="text-2xl font-bold text-white">{analytics.activeCampaigns}</p>
									</div>
									<Settings className="h-8 w-8 text-orange-500" />
								</div>
							</CardContent>
						</Card>

						<Card className="bg-zinc-900 border-zinc-800">
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-zinc-400">Advertisers</p>
										<p className="text-2xl font-bold text-white">{analytics.totalAdvertisers}</p>
									</div>
									<Users className="h-8 w-8 text-cyan-500" />
								</div>
							</CardContent>
						</Card>

						<Card className="bg-zinc-900 border-zinc-800">
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-zinc-400">DGT Rewards</p>
										<p className="text-2xl font-bold text-white">
											{analytics.dgtRewardsDistributed.toLocaleString()}
										</p>
									</div>
									<CheckCircle className="h-8 w-8 text-yellow-500" />
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Main Content Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-5">
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="placements">Placements</TabsTrigger>
						<TabsTrigger value="configuration">Configuration</TabsTrigger>
						<TabsTrigger value="campaigns">Campaigns</TabsTrigger>
						<TabsTrigger value="governance">Governance</TabsTrigger>
					</TabsList>

					{/* Overview Tab */}
					<TabsContent value="overview" className="space-y-6">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{/* System Status */}
							<Card className="bg-zinc-900 border-zinc-800">
								<CardHeader>
									<CardTitle className="text-white flex items-center">
										<Shield className="h-5 w-5 mr-2 text-emerald-500" />
										System Status
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center justify-between">
										<span className="text-zinc-300">Ad Serving</span>
										<Badge variant="default" className="bg-emerald-600">
											Active
										</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-zinc-300">Campaign Approval</span>
										<Badge variant="secondary">Required</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-zinc-300">Community Voting</span>
										<Badge variant="default" className="bg-blue-600">
											Enabled
										</Badge>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-zinc-300">Fraud Detection</span>
										<Badge variant="default" className="bg-emerald-600">
											Active
										</Badge>
									</div>
								</CardContent>
							</Card>

							{/* Recent Activity */}
							<Card className="bg-zinc-900 border-zinc-800">
								<CardHeader>
									<CardTitle className="text-white">Recent Activity</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="text-sm">
										<p className="text-zinc-300">
											New campaign "DeFi Yield Farming" submitted for review
										</p>
										<p className="text-xs text-zinc-500">2 hours ago</p>
									</div>
									<div className="text-sm">
										<p className="text-zinc-300">
											Placement "Thread Header" generated $2,450 revenue today
										</p>
										<p className="text-xs text-zinc-500">4 hours ago</p>
									</div>
									<div className="text-sm">
										<p className="text-zinc-300">
											Governance proposal "Increase DGT rewards" passed
										</p>
										<p className="text-xs text-zinc-500">1 day ago</p>
									</div>
									<div className="text-sm">
										<p className="text-zinc-300">Fraud alert: Suspicious click patterns detected</p>
										<p className="text-xs text-zinc-500">2 days ago</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>

					{/* Placements Tab */}
					<TabsContent value="placements" className="space-y-6">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold text-white">Ad Placements</h2>
							<Button className="bg-emerald-600 hover:bg-emerald-700">
								<Plus className="h-4 w-4 mr-2" />
								New Placement
							</Button>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
							{placements.map((placement) => (
								<Card key={placement.id} className="bg-zinc-900 border-zinc-800">
									<CardHeader className="pb-3">
										<div className="flex items-center justify-between">
											<CardTitle className="text-white text-lg">{placement.name}</CardTitle>
											<Badge variant={placement.isActive ? 'default' : 'secondary'}>
												{placement.isActive ? 'Active' : 'Inactive'}
											</Badge>
										</div>
										<p className="text-sm text-zinc-400">{placement.position}</p>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="grid grid-cols-2 gap-4 text-sm">
											<div>
												<p className="text-zinc-500">Floor CPM</p>
												<p className="text-white font-semibold">${placement.floorPriceCpm}</p>
											</div>
											<div>
												<p className="text-zinc-500">Fill Rate</p>
												<p className="text-white font-semibold">
													{(placement.analytics.fillRate * 100).toFixed(1)}%
												</p>
											</div>
											<div>
												<p className="text-zinc-500">Impressions</p>
												<p className="text-white font-semibold">
													{placement.analytics.impressions.toLocaleString()}
												</p>
											</div>
											<div>
												<p className="text-zinc-500">Revenue</p>
												<p className="text-white font-semibold">
													${placement.analytics.revenue.toFixed(2)}
												</p>
											</div>
										</div>

										<div className="flex gap-2 pt-2">
											<Button variant="outline" size="sm" className="flex-1">
												<Edit className="h-4 w-4 mr-1" />
												Edit
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="flex-1 text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
											>
												<Trash2 className="h-4 w-4 mr-1" />
												Delete
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</TabsContent>

					{/* Configuration Tab */}
					<TabsContent value="configuration" className="space-y-6">
						{config && <ConfigurationPanel config={config} onUpdate={updateConfig} />}
					</TabsContent>

					{/* Campaigns Tab */}
					<TabsContent value="campaigns" className="space-y-6">
						<CampaignManagementPanel />
					</TabsContent>

					{/* Governance Tab */}
					<TabsContent value="governance" className="space-y-6">
						<GovernancePanel />
					</TabsContent>
				</Tabs>
			</div>
		</Container>
	);
}

// Configuration Panel Component
function ConfigurationPanel({
	config,
	onUpdate
}: {
	config: AdSystemConfig;
	onUpdate: (updates: Partial<AdSystemConfig>) => void;
}) {
	const [localConfig, setLocalConfig] = useState(config);

	const handleSave = () => {
		onUpdate(localConfig);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-white">System Configuration</h2>
				<Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
					Save Changes
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Placement Settings */}
				<Card className="bg-zinc-900 border-zinc-800">
					<CardHeader>
						<CardTitle className="text-white">Placement Settings</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<Label htmlFor="placements-enabled" className="text-zinc-300">
								Enable Ad Placements
							</Label>
							<Switch
								id="placements-enabled"
								checked={localConfig.placements.enabled}
								onCheckedChange={(checked) =>
									setLocalConfig((prev) => ({
										...prev,
										placements: { ...prev.placements, enabled: checked }
									}))
								}
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-zinc-300">Default Floor Price (CPM)</Label>
							<Input
								type="number"
								step="0.01"
								value={localConfig.placements.defaultFloorPrice}
								onChange={(e) =>
									setLocalConfig((prev) => ({
										...prev,
										placements: {
											...prev.placements,
											defaultFloorPrice: parseFloat(e.target.value)
										}
									}))
								}
								className="bg-zinc-800 border-zinc-700 text-white"
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-zinc-300">Max Daily Budget</Label>
							<Input
								type="number"
								value={localConfig.placements.maxDailyBudget}
								onChange={(e) =>
									setLocalConfig((prev) => ({
										...prev,
										placements: { ...prev.placements, maxDailyBudget: parseInt(e.target.value) }
									}))
								}
								className="bg-zinc-800 border-zinc-700 text-white"
							/>
						</div>

						<div className="flex items-center justify-between">
							<Label htmlFor="approval-required" className="text-zinc-300">
								Require Approval
							</Label>
							<Switch
								id="approval-required"
								checked={localConfig.placements.approvalRequired}
								onCheckedChange={(checked) =>
									setLocalConfig((prev) => ({
										...prev,
										placements: { ...prev.placements, approvalRequired: checked }
									}))
								}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Revenue Settings */}
				<Card className="bg-zinc-900 border-zinc-800">
					<CardHeader>
						<CardTitle className="text-white">Revenue Settings</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label className="text-zinc-300">Platform Commission (%)</Label>
							<Input
								type="number"
								min="0"
								max="100"
								value={localConfig.revenue.platformCommission}
								onChange={(e) =>
									setLocalConfig((prev) => ({
										...prev,
										revenue: { ...prev.revenue, platformCommission: parseInt(e.target.value) }
									}))
								}
								className="bg-zinc-800 border-zinc-700 text-white"
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-zinc-300">DGT Reward Pool</Label>
							<Input
								type="number"
								value={localConfig.revenue.dgtRewardPool}
								onChange={(e) =>
									setLocalConfig((prev) => ({
										...prev,
										revenue: { ...prev.revenue, dgtRewardPool: parseInt(e.target.value) }
									}))
								}
								className="bg-zinc-800 border-zinc-700 text-white"
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-zinc-300">Minimum Payout</Label>
							<Input
								type="number"
								value={localConfig.revenue.minimumPayout}
								onChange={(e) =>
									setLocalConfig((prev) => ({
										...prev,
										revenue: { ...prev.revenue, minimumPayout: parseInt(e.target.value) }
									}))
								}
								className="bg-zinc-800 border-zinc-700 text-white"
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-zinc-300">Payout Schedule</Label>
							<Select
								value={localConfig.revenue.payoutSchedule}
								onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
									setLocalConfig((prev) => ({
										...prev,
										revenue: { ...prev.revenue, payoutSchedule: value }
									}))
								}
							>
								<SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="daily">Daily</SelectItem>
									<SelectItem value="weekly">Weekly</SelectItem>
									<SelectItem value="monthly">Monthly</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Content Settings */}
				<Card className="bg-zinc-900 border-zinc-800">
					<CardHeader>
						<CardTitle className="text-white">Content Settings</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<Label htmlFor="auto-approval" className="text-zinc-300">
								Auto Approval
							</Label>
							<Switch
								id="auto-approval"
								checked={localConfig.content.autoApproval}
								onCheckedChange={(checked) =>
									setLocalConfig((prev) => ({
										...prev,
										content: { ...prev.content, autoApproval: checked }
									}))
								}
							/>
						</div>

						<div className="flex items-center justify-between">
							<Label htmlFor="crypto-only" className="text-zinc-300">
								Crypto Content Only
							</Label>
							<Switch
								id="crypto-only"
								checked={localConfig.content.cryptoContentOnly}
								onCheckedChange={(checked) =>
									setLocalConfig((prev) => ({
										...prev,
										content: { ...prev.content, cryptoContentOnly: checked }
									}))
								}
							/>
						</div>

						<div className="flex items-center justify-between">
							<Label htmlFor="require-disclaimer" className="text-zinc-300">
								Require Disclaimer
							</Label>
							<Switch
								id="require-disclaimer"
								checked={localConfig.content.requireDisclaimer}
								onCheckedChange={(checked) =>
									setLocalConfig((prev) => ({
										...prev,
										content: { ...prev.content, requireDisclaimer: checked }
									}))
								}
							/>
						</div>
					</CardContent>
				</Card>

				{/* Governance Settings */}
				<Card className="bg-zinc-900 border-zinc-800">
					<CardHeader>
						<CardTitle className="text-white">Governance Settings</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<Label htmlFor="community-voting" className="text-zinc-300">
								Enable Community Voting
							</Label>
							<Switch
								id="community-voting"
								checked={localConfig.governance.enableCommunityVoting}
								onCheckedChange={(checked) =>
									setLocalConfig((prev) => ({
										...prev,
										governance: { ...prev.governance, enableCommunityVoting: checked }
									}))
								}
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-zinc-300">Minimum Tokens to Vote</Label>
							<Input
								type="number"
								value={localConfig.governance.minimumTokensToVote}
								onChange={(e) =>
									setLocalConfig((prev) => ({
										...prev,
										governance: {
											...prev.governance,
											minimumTokensToVote: parseInt(e.target.value)
										}
									}))
								}
								className="bg-zinc-800 border-zinc-700 text-white"
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-zinc-300">Voting Period (Days)</Label>
							<Input
								type="number"
								value={localConfig.governance.votingPeriodDays}
								onChange={(e) =>
									setLocalConfig((prev) => ({
										...prev,
										governance: { ...prev.governance, votingPeriodDays: parseInt(e.target.value) }
									}))
								}
								className="bg-zinc-800 border-zinc-700 text-white"
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-zinc-300">Quorum Percentage</Label>
							<Input
								type="number"
								min="1"
								max="100"
								value={localConfig.governance.quorumPercentage}
								onChange={(e) =>
									setLocalConfig((prev) => ({
										...prev,
										governance: { ...prev.governance, quorumPercentage: parseInt(e.target.value) }
									}))
								}
								className="bg-zinc-800 border-zinc-700 text-white"
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

// Campaign Management Panel Component
function CampaignManagementPanel() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-white">Campaign Management</h2>
				<div className="flex gap-2">
					<Button variant="outline">Export Data</Button>
					<Button className="bg-emerald-600 hover:bg-emerald-700">Bulk Actions</Button>
				</div>
			</div>

			<Alert className="border-yellow-500 bg-yellow-500/10">
				<AlertTriangle className="h-4 w-4" />
				<AlertDescription className="text-yellow-200">
					3 campaigns are pending review. Review them to maintain platform quality.
				</AlertDescription>
			</Alert>

			{/* Campaign filters and list would go here */}
			<Card className="bg-zinc-900 border-zinc-800">
				<CardHeader>
					<CardTitle className="text-white">Pending Reviews</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-zinc-400">Campaign review interface would be implemented here.</p>
				</CardContent>
			</Card>
		</div>
	);
}

// Governance Panel Component
function GovernancePanel() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-white">Community Governance</h2>
				<Button className="bg-emerald-600 hover:bg-emerald-700">
					<Plus className="h-4 w-4 mr-2" />
					New Proposal
				</Button>
			</div>

			{/* Active proposals would go here */}
			<Card className="bg-zinc-900 border-zinc-800">
				<CardHeader>
					<CardTitle className="text-white">Active Proposals</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-zinc-400">Governance proposals interface would be implemented here.</p>
				</CardContent>
			</Card>
		</div>
	);
}
