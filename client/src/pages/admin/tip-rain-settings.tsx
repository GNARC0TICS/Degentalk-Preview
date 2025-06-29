import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Settings, CloudRain, Gift, Save } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AdminPageShell } from '@/components/admin/layout/AdminPageShell';

type TipSettings = {
	enabled: boolean;
	minAmountDGT: number;
	minAmountUSDT: number;
	maxAmountDGT: number;
	maxAmountUSDT: number;
	burnPercentage: number;
	processingFeePercentage: number;
	cooldownSeconds: number;
};

type RainSettings = {
	enabled: boolean;
	minAmountDGT: number;
	minAmountUSDT: number;
	maxRecipients: number;
	cooldownSeconds: number;
};

export default function TipRainSettings() {
	const [activeTab, setActiveTab] = useState('tip');
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Fetch tip settings
	const {
		data: tipSettings,
		isLoading: isLoadingTipSettings,
		isError: isTipSettingsError,
		error: tipSettingsError
	} = useQuery({
		queryKey: ['/api/admin/settings/tip'],
		queryFn: async () => {
			const response = await axios.get('/api/admin/settings/tip');
			return response.data as TipSettings;
		}
	});

	// Form state for tip settings
	const [tipFormData, setTipFormData] = useState<TipSettings>({
		enabled: true,
		minAmountDGT: 10,
		minAmountUSDT: 0.1,
		maxAmountDGT: 1000,
		maxAmountUSDT: 100,
		burnPercentage: 5,
		processingFeePercentage: 2.5,
		cooldownSeconds: 60
	});

	// Update form when data loads
	React.useEffect(() => {
		if (tipSettings) {
			setTipFormData(tipSettings);
		}
	}, [tipSettings]);

	// Fetch rain settings
	const {
		data: rainSettings,
		isLoading: isLoadingRainSettings,
		isError: isRainSettingsError,
		error: rainSettingsError
	} = useQuery({
		queryKey: ['/api/admin/settings/rain'],
		queryFn: async () => {
			const response = await axios.get('/api/admin/settings/rain');
			return response.data as RainSettings;
		}
	});

	// Form state for rain settings
	const [rainFormData, setRainFormData] = useState<RainSettings>({
		enabled: true,
		minAmountDGT: 10,
		minAmountUSDT: 1,
		maxRecipients: 15,
		cooldownSeconds: 60
	});

	// Update form when data loads
	React.useEffect(() => {
		if (rainSettings) {
			setRainFormData(rainSettings);
		}
	}, [rainSettings]);

	// Handle tip form changes
	const handleTipChange = (field: keyof TipSettings, value: string | number | boolean) => {
		// FIXME: any → union type
		setTipFormData((prev) => ({
			...prev,
			[field]: field === 'enabled' ? value : Number(value)
		}));
	};

	// Handle rain form changes
	const handleRainChange = (field: keyof RainSettings, value: string | number | boolean) => {
		// FIXME: any → union type
		setRainFormData((prev) => ({
			...prev,
			[field]: field === 'enabled' ? value : Number(value)
		}));
	};

	// Save tip settings mutation
	const saveTipSettings = useMutation({
		mutationFn: async (settings: TipSettings) => {
			const response = await axios.post('/api/admin/settings/tip', settings);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/settings/tip'] });
			toast({
				title: 'Tip settings saved',
				description: 'Your tip settings have been updated successfully',
				variant: 'success'
			});
		},
		onError: (error: unknown) => {
			// FIXME: any → unknown (safe)
			toast({
				title: 'Error saving tip settings',
				description: error.response?.data?.message || 'An error occurred while saving tip settings',
				variant: 'destructive'
			});
		}
	});

	// Save rain settings mutation
	const saveRainSettings = useMutation({
		mutationFn: async (settings: RainSettings) => {
			const response = await axios.post('/api/admin/settings/rain', settings);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/settings/rain'] });
			toast({
				title: 'Rain settings saved',
				description: 'Your rain settings have been updated successfully',
				variant: 'success'
			});
		},
		onError: (error: unknown) => {
			// FIXME: any → unknown (safe)
			toast({
				title: 'Error saving rain settings',
				description:
					error.response?.data?.message || 'An error occurred while saving rain settings',
				variant: 'destructive'
			});
		}
	});

	// Handle form submissions
	const handleSaveTipSettings = (e: React.FormEvent) => {
		e.preventDefault();
		saveTipSettings.mutate(tipFormData);
	};

	const handleSaveRainSettings = (e: React.FormEvent) => {
		e.preventDefault();
		saveRainSettings.mutate(rainFormData);
	};

	if (isLoadingTipSettings || isLoadingRainSettings) {
		return (
			<div className="flex items-center justify-center min-h-[600px]">
				<Loader2 className="h-10 w-10 text-cyan-500 animate-spin" />
				<p className="ml-3 text-lg text-gray-300">Loading settings...</p>
			</div>
		);
	}

	return (
		<AdminPageShell title="Tip & Rain Settings">
			<div className="space-y-8">
				{(isTipSettingsError || isRainSettingsError) && (
					<Alert variant="destructive" className="mb-6">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Error loading settings</AlertTitle>
						<AlertDescription>
							{tipSettingsError instanceof Error ? tipSettingsError.message : ''}
							{rainSettingsError instanceof Error ? rainSettingsError.message : ''}
							{' Please try refreshing the page.'}
						</AlertDescription>
					</Alert>
				)}

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
						<TabsTrigger
							value="tip"
							className="flex items-center gap-2 data-[state=active]:bg-amber-900/30"
						>
							<Gift className="h-4 w-4" />
							<span>Tip Settings</span>
						</TabsTrigger>
						<TabsTrigger
							value="rain"
							className="flex items-center gap-2 data-[state=active]:bg-cyan-900/30"
						>
							<CloudRain className="h-4 w-4" />
							<span>Rain Settings</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="tip">
						<Card className="border-zinc-800 bg-zinc-950/50">
							<form onSubmit={handleSaveTipSettings}>
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-amber-400">
										<Gift className="h-5 w-5" />
										Tip Settings
									</CardTitle>
									<CardDescription>
										Configure how users can tip each other in the shoutbox and across the platform.
									</CardDescription>
								</CardHeader>

								<CardContent className="space-y-6">
									<div className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-zinc-800">
										<div className="space-y-0.5">
											<Label htmlFor="enable-tipping" className="text-base">
												Enable Tipping
											</Label>
											<p className="text-sm text-gray-400">
												Allow users to tip each other using DGT and USDT
											</p>
										</div>
										<Switch
											id="enable-tipping"
											checked={tipFormData.enabled}
											onCheckedChange={(value) => handleTipChange('enabled', value)}
										/>
									</div>

									<Separator className="bg-zinc-800" />

									<div className="space-y-4">
										<h3 className="text-lg font-medium text-white">DGT Tip Settings</h3>

										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="min-dgt">Minimum DGT Tip</Label>
												<Input
													id="min-dgt"
													type="number"
													step="1"
													min="1"
													value={tipFormData.minAmountDGT}
													onChange={(e) => handleTipChange('minAmountDGT', e.target.value)}
													className="bg-zinc-900 border-zinc-800"
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="max-dgt">Maximum DGT Tip</Label>
												<Input
													id="max-dgt"
													type="number"
													step="10"
													min={tipFormData.minAmountDGT}
													value={tipFormData.maxAmountDGT}
													onChange={(e) => handleTipChange('maxAmountDGT', e.target.value)}
													className="bg-zinc-900 border-zinc-800"
												/>
											</div>
										</div>
									</div>

									<div className="space-y-4">
										<h3 className="text-lg font-medium text-white">USDT Tip Settings</h3>

										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="min-usdt">Minimum USDT Tip</Label>
												<Input
													id="min-usdt"
													type="number"
													step="0.1"
													min="0.1"
													value={tipFormData.minAmountUSDT}
													onChange={(e) => handleTipChange('minAmountUSDT', e.target.value)}
													className="bg-zinc-900 border-zinc-800"
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="max-usdt">Maximum USDT Tip</Label>
												<Input
													id="max-usdt"
													type="number"
													step="1"
													min={tipFormData.minAmountUSDT}
													value={tipFormData.maxAmountUSDT}
													onChange={(e) => handleTipChange('maxAmountUSDT', e.target.value)}
													className="bg-zinc-900 border-zinc-800"
												/>
											</div>
										</div>
									</div>

									<div className="space-y-4">
										<h3 className="text-lg font-medium text-white">Tip Economics</h3>

										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="burn-percentage">Burn Percentage (%)</Label>
												<Input
													id="burn-percentage"
													type="number"
													step="0.5"
													min="0"
													max="100"
													value={tipFormData.burnPercentage}
													onChange={(e) => handleTipChange('burnPercentage', e.target.value)}
													className="bg-zinc-900 border-zinc-800"
												/>
												<p className="text-xs text-gray-400">
													Percentage of the tip that gets burned/staked.
												</p>
											</div>

											<div className="space-y-2">
												<Label htmlFor="fee-percentage">Platform Fee (%)</Label>
												<Input
													id="fee-percentage"
													type="number"
													step="0.5"
													min="0"
													max="100"
													value={tipFormData.processingFeePercentage}
													onChange={(e) =>
														handleTipChange('processingFeePercentage', e.target.value)
													}
													className="bg-zinc-900 border-zinc-800"
												/>
												<p className="text-xs text-gray-400">Platform processing fee on tips.</p>
											</div>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="tip-cooldown">Cooldown Period (seconds)</Label>
										<Input
											id="tip-cooldown"
											type="number"
											step="5"
											min="0"
											value={tipFormData.cooldownSeconds}
											onChange={(e) => handleTipChange('cooldownSeconds', e.target.value)}
											className="bg-zinc-900 border-zinc-800 max-w-md"
										/>
										<p className="text-xs text-gray-400">
											Time users must wait between tips (0 to disable).
										</p>
									</div>
								</CardContent>

								<CardFooter className="border-t border-zinc-800 bg-black/30 gap-2 flex justify-end">
									<Button
										type="submit"
										disabled={saveTipSettings.isPending}
										className="bg-amber-700 hover:bg-amber-600 text-white"
									>
										{saveTipSettings.isPending ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
											</>
										) : (
											<>
												<Save className="mr-2 h-4 w-4" /> Save Tip Settings
											</>
										)}
									</Button>
								</CardFooter>
							</form>
						</Card>
					</TabsContent>

					<TabsContent value="rain">
						<Card className="border-zinc-800 bg-zinc-950/50">
							<form onSubmit={handleSaveRainSettings}>
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-cyan-400">
										<CloudRain className="h-5 w-5" />
										Rain Settings
									</CardTitle>
									<CardDescription>
										Configure how users can make it rain tokens to multiple users in the shoutbox.
									</CardDescription>
								</CardHeader>

								<CardContent className="space-y-6">
									<div className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-zinc-800">
										<div className="space-y-0.5">
											<Label htmlFor="enable-rain" className="text-base">
												Enable Rain
											</Label>
											<p className="text-sm text-gray-400">
												Allow users to distribute tokens to random active users
											</p>
										</div>
										<Switch
											id="enable-rain"
											checked={rainFormData.enabled}
											onCheckedChange={(value) => handleRainChange('enabled', value)}
										/>
									</div>

									<Separator className="bg-zinc-800" />

									<div className="space-y-4">
										<h3 className="text-lg font-medium text-white">Rain Amount Settings</h3>

										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="rain-min-dgt">Minimum DGT Rain</Label>
												<Input
													id="rain-min-dgt"
													type="number"
													step="1"
													min="1"
													value={rainFormData.minAmountDGT}
													onChange={(e) => handleRainChange('minAmountDGT', e.target.value)}
													className="bg-zinc-900 border-zinc-800"
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="rain-min-usdt">Minimum USDT Rain</Label>
												<Input
													id="rain-min-usdt"
													type="number"
													step="0.1"
													min="0.1"
													value={rainFormData.minAmountUSDT}
													onChange={(e) => handleRainChange('minAmountUSDT', e.target.value)}
													className="bg-zinc-900 border-zinc-800"
												/>
											</div>
										</div>
									</div>

									<div className="space-y-4">
										<h3 className="text-lg font-medium text-white">Recipient Settings</h3>

										<div className="space-y-2">
											<Label htmlFor="max-recipients">Maximum Recipients</Label>
											<Input
												id="max-recipients"
												type="number"
												step="1"
												min="1"
												max="50"
												value={rainFormData.maxRecipients}
												onChange={(e) => handleRainChange('maxRecipients', e.target.value)}
												className="bg-zinc-900 border-zinc-800 max-w-md"
											/>
											<p className="text-xs text-gray-400">
												Maximum number of users that can receive a rain at once.
											</p>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="rain-cooldown">Cooldown Period (seconds)</Label>
										<Input
											id="rain-cooldown"
											type="number"
											step="10"
											min="0"
											value={rainFormData.cooldownSeconds}
											onChange={(e) => handleRainChange('cooldownSeconds', e.target.value)}
											className="bg-zinc-900 border-zinc-800 max-w-md"
										/>
										<p className="text-xs text-gray-400">
											Time users must wait between rains (0 to disable).
										</p>
									</div>
								</CardContent>

								<CardFooter className="border-t border-zinc-800 bg-black/30 gap-2 flex justify-end">
									<Button
										type="submit"
										disabled={saveRainSettings.isPending}
										className="bg-cyan-700 hover:bg-cyan-600 text-white"
									>
										{saveRainSettings.isPending ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
											</>
										) : (
											<>
												<Save className="mr-2 h-4 w-4" /> Save Rain Settings
											</>
										)}
									</Button>
								</CardFooter>
							</form>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</AdminPageShell>
	);
}
