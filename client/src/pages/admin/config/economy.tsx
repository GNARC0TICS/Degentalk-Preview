import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertTriangle, RotateCcw, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdminPageShell } from '@/features/admin/layout/layout/AdminPageShell';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { apiRequest } from '@/utils/queryClient';

interface EconomyConfigResponse {
	config: Record<string, any>;
	hasOverrides: boolean;
}

export default function EconomyConfigPage() {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [json, setJson] = useState('');
	const [jsonError, setJsonError] = useState<string | null>(null);

	// Fetch economy config
	const {
		data: economyData,
		isLoading,
		isError
	} = useQuery({
		queryKey: ['admin-economy-config'],
		queryFn: async (): Promise<EconomyConfigResponse> => {
			return apiRequest({ url: '/api/admin/economy/config', method: 'GET' });
		}
	});

	// Update config mutation
	const updateConfigMutation = useMutation({
		mutationFn: async (config: Record<string, any>) => {
			return apiRequest({ url: '/api/admin/economy/config', method: 'PUT', data: config });
		},
		onSuccess: (data) => {
			queryClient.setQueryData(['admin-economy-config'], data);
			toast({
				title: 'Configuration Updated',
				description: 'Economy configuration has been saved successfully.'
			});
		},
		onError: (error: any) => {
			toast({
				title: 'Update Failed',
				description: error.message || 'Failed to update economy configuration',
				variant: 'destructive'
			});
		}
	});

	// Reset config mutation
	const resetConfigMutation = useMutation({
		mutationFn: async () => {
			return apiRequest({ url: '/api/admin/economy/config', method: 'DELETE' });
		},
		onSuccess: (data) => {
			queryClient.setQueryData(['admin-economy-config'], data);
			toast({
				title: 'Configuration Reset',
				description: 'Economy configuration has been reset to defaults.'
			});
		},
		onError: (error: any) => {
			toast({
				title: 'Reset Failed',
				description: error.message || 'Failed to reset economy configuration',
				variant: 'destructive'
			});
		}
	});

	// Update JSON when data changes
	useEffect(() => {
		if (economyData?.config) {
			const formattedJson = JSON.stringify(economyData.config, null, 2);
			setJson(formattedJson);
			setJsonError(null);
		}
	}, [economyData]);

	// Validate JSON on change
	const handleJsonChange = (value: string) => {
		setJson(value);
		try {
			JSON.parse(value);
			setJsonError(null);
		} catch (error: any) {
			setJsonError(error.message);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (jsonError) {
			toast({
				title: 'Invalid JSON',
				description: jsonError,
				variant: 'destructive'
			});
			return;
		}

		try {
			const parsedConfig = JSON.parse(json);
			updateConfigMutation.mutate(parsedConfig);
		} catch (error: any) {
			toast({
				title: 'Invalid JSON',
				description: error.message,
				variant: 'destructive'
			});
		}
	};

	const handleReset = () => {
		resetConfigMutation.mutate();
	};

	const hasOverrides = economyData?.hasOverrides || false;
	const isUpdating = updateConfigMutation.isPending;
	const isResetting = resetConfigMutation.isPending;

	const pageActions = (
		<div className="flex gap-2">
			<Button type="submit" form="economy-form" disabled={isUpdating || isResetting || !!jsonError}>
				{isUpdating ? (
					<>
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						Saving...
					</>
				) : (
					<>
						<Save className="h-4 w-4 mr-2" />
						Save Config
					</>
				)}
			</Button>
			<Button
				type="button"
				variant="outline"
				disabled={isUpdating || isResetting}
				onClick={handleReset}
			>
				{isResetting ? (
					<>
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						Resetting...
					</>
				) : (
					<>
						<RotateCcw className="h-4 w-4 mr-2" />
						Reset to Defaults
					</>
				)}
			</Button>
		</div>
	);

	const titleWithStatus = (
		<div className="flex items-center gap-2">
			Economy Configuration
			{hasOverrides && (
				<CheckCircle2 className="h-5 w-5 text-yellow-500" aria-label="Custom overrides active" />
			)}
		</div>
	);

	if (isLoading) {
		return (
			<AdminPageShell title="Economy Configuration" pageActions={pageActions}>
				<div className="flex justify-center items-center py-12">
					<div className="flex items-center space-x-2">
						<Loader2 className="h-6 w-6 animate-spin" />
						<span>Loading configuration...</span>
					</div>
				</div>
			</AdminPageShell>
		);
	}

	if (isError) {
		return (
			<AdminPageShell title="Economy Configuration" pageActions={pageActions}>
				<Alert variant="destructive">
					<AlertTriangle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						Failed to load economy configuration. Please try refreshing the page.
					</AlertDescription>
				</Alert>
			</AdminPageShell>
		);
	}

	return (
		<AdminPageShell title={titleWithStatus} pageActions={pageActions}>
			<div className="space-y-6">
				{hasOverrides && (
					<Alert>
						<CheckCircle2 className="h-4 w-4" />
						<AlertTitle>Custom Configuration Active</AlertTitle>
						<AlertDescription>
							This economy configuration has been customized from the defaults. Use "Reset to
							Defaults" to restore the original configuration.
						</AlertDescription>
					</Alert>
				)}

				<Card>
					<CardHeader>
						<CardTitle>Economy Settings</CardTitle>
						<CardDescription>
							Configure economy parameters such as XP rewards, DGT conversion rates, and transaction
							limits. This JSON will override the default configuration.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form id="economy-form" onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<label htmlFor="config-json" className="text-sm font-medium">
									Configuration JSON
								</label>
								<Textarea
									id="config-json"
									value={json}
									onChange={(e) => handleJsonChange(e.target.value)}
									className={`font-mono min-h-[500px] text-sm ${
										jsonError ? 'border-red-500 focus:border-red-500' : ''
									}`}
									placeholder="Loading economy configuration..."
									disabled={isUpdating || isResetting}
								/>
								{jsonError && (
									<div className="text-sm text-red-600">
										<strong>JSON Error:</strong> {jsonError}
									</div>
								)}
							</div>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Configuration Guidelines</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<p>• Only include fields you want to override from the default configuration</p>
						<p>• Changes take effect immediately after saving</p>
						<p>• Invalid JSON will prevent saving and show validation errors</p>
						<p>• Use "Reset to Defaults" to remove all customizations</p>
						<p>• Configuration changes are logged in the admin audit trail</p>
					</CardContent>
				</Card>
			</div>
		</AdminPageShell>
	);
}
