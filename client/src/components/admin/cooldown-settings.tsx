import React from 'react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, Save, CloudRain, Gift } from 'lucide-react';

interface CooldownSettings {
	tipCooldownSeconds: number;
	rainCooldownSeconds: number;
	moderatorBypassCooldown: boolean;
	adminBypassCooldown: boolean;
}

export function CooldownSettings() {
	const { toast } = useToast();
	const queryClient = useQueryClient();

	// Fetch current cooldown settings
	const {
		data: settings,
		isLoading,
		isError,
		error
	} = useQuery({
		queryKey: ['/api/admin/settings/cooldowns'],
		queryFn: async () => {
			const response = await axios.get('/api/admin/settings/cooldowns');
			return response.data as CooldownSettings;
		}
	});

	// Form state
	const [formData, setFormData] = React.useState<CooldownSettings>({
		tipCooldownSeconds: 10,
		rainCooldownSeconds: 60,
		moderatorBypassCooldown: true,
		adminBypassCooldown: true
	});

	// Update form when data loads
	React.useEffect(() => {
		if (settings) {
			setFormData(settings);
		}
	}, [settings]);

	// Handle form changes
	const handleChange = (field: keyof CooldownSettings, value: number | boolean) => {
		setFormData((prev) => ({
			...prev,
			[field]: typeof value === 'boolean' ? value : Number(value)
		}));
	};

	// Save settings mutation
	const saveSettings = useMutation({
		mutationFn: async (data: CooldownSettings) => {
			const response = await axios.post('/api/admin/settings/cooldowns', data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/settings/cooldowns'] });
			toast({
				title: 'Cooldown settings saved',
				description: 'Your cooldown settings have been updated successfully',
				variant: 'default'
			});
		},
		onError: (error: Error) => {
			toast({
				title: 'Error saving cooldown settings',
				description: (error as any).response?.data?.message || 'An error occurred while saving settings',
				variant: 'destructive'
			});
		}
	});

	// Handle form submit
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		saveSettings.mutate(formData);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
				<p className="ml-3 text-lg text-gray-300">Loading cooldown settings...</p>
			</div>
		);
	}

	if (isError) {
		return (
			<Alert variant="destructive" className="mb-6">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					{error instanceof Error ? error.message : 'Error loading cooldown settings'}
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<Card className="border-zinc-800 bg-zinc-950/50">
			<form onSubmit={handleSubmit}>
				<CardHeader>
					<CardTitle className="text-xl flex items-center gap-2">
						<CloudRain className="h-5 w-5 text-emerald-500" />
						<Gift className="h-5 w-5 text-amber-500" />
						Command Cooldown Settings
					</CardTitle>
					<CardDescription>
						Configure cooldown periods for tip and rain commands to prevent spam
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					<div className="space-y-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="tip-cooldown" className="text-base flex items-center">
									<Gift className="h-4 w-4 mr-2 text-amber-400" />
									Tip Command Cooldown
								</Label>
								<span className="text-emerald-400 font-mono">{formData.tipCooldownSeconds}s</span>
							</div>
							<Slider
								id="tip-cooldown"
								min={0}
								max={300}
								step={5}
								value={[formData.tipCooldownSeconds]}
								onValueChange={(value) => handleChange('tipCooldownSeconds', value[0])}
								className="w-full"
							/>
							<p className="text-xs text-zinc-400">
								Time users must wait between tip commands (0 to disable cooldown)
							</p>
						</div>

						<div className="space-y-2 mt-6">
							<div className="flex items-center justify-between">
								<Label htmlFor="rain-cooldown" className="text-base flex items-center">
									<CloudRain className="h-4 w-4 mr-2 text-cyan-400" />
									Rain Command Cooldown
								</Label>
								<span className="text-emerald-400 font-mono">{formData.rainCooldownSeconds}s</span>
							</div>
							<Slider
								id="rain-cooldown"
								min={0}
								max={3600}
								step={30}
								value={[formData.rainCooldownSeconds]}
								onValueChange={(value) => handleChange('rainCooldownSeconds', value[0])}
								className="w-full"
							/>
							<p className="text-xs text-zinc-400">
								Time users must wait between rain commands (0 to disable cooldown)
							</p>
						</div>
					</div>

					<Separator className="my-4 bg-zinc-800" />

					<div className="space-y-4">
						<h3 className="text-lg font-medium">Bypass Settings</h3>

						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="mod-bypass"
								checked={formData.moderatorBypassCooldown}
								onChange={(e) => handleChange('moderatorBypassCooldown', e.target.checked)}
								className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
							/>
							<Label htmlFor="mod-bypass">Moderators bypass cooldowns</Label>
						</div>

						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="admin-bypass"
								checked={formData.adminBypassCooldown}
								onChange={(e) => handleChange('adminBypassCooldown', e.target.checked)}
								className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
							/>
							<Label htmlFor="admin-bypass">Admins bypass cooldowns</Label>
						</div>
					</div>
				</CardContent>

				<CardFooter className="bg-black/30 border-t border-zinc-800 gap-2 flex justify-end">
					<Button
						type="submit"
						disabled={saveSettings.isPending}
						className="bg-emerald-700 hover:bg-emerald-600"
					>
						{saveSettings.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
							</>
						) : (
							<>
								<Save className="mr-2 h-4 w-4" /> Save Cooldown Settings
							</>
						)}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
