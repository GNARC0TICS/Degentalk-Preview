import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Loader2, CheckCircle2 } from 'lucide-react';
import {
	useEconomyConfig,
	useUpdateEconomyConfig,
	useResetEconomyConfig
} from '@/features/admin/services/economyConfigService';
import { useToast } from '@/hooks/use-toast.ts';

export default function EconomyConfigPage() {
	const { data, isLoading } = useEconomyConfig();
	const { toast } = useToast();
	const [json, setJson] = useState('');
	const [hasOverrides, setHasOverrides] = useState(false);
	const updateMutation = useUpdateEconomyConfig();
	const resetMutation = useResetEconomyConfig();

	useEffect(() => {
		if (data) {
			setJson(JSON.stringify(data.config, null, 2));
			setHasOverrides(data.hasOverrides);
		}
	}, [data]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const parsed = JSON.parse(json);
			updateMutation.mutate(parsed, {
				onSuccess: () => toast({ title: 'Economy config saved' }),
				onError: (err: any) =>
					toast({ title: 'Error', description: err.message, variant: 'destructive' })
			});
		} catch (err: any) {
			toast({ title: 'Invalid JSON', description: err.message, variant: 'destructive' });
		}
	};

	const handleRestoreDefaults = () => {
		resetMutation.mutate(undefined, {
			onSuccess: () => toast({ title: 'Defaults restored' }),
			onError: (err: any) =>
				toast({ title: 'Error', description: err.message, variant: 'destructive' })
		});
	};

	if (isLoading) {
		return (
			<div className="p-8 flex justify-center">
				<Loader2 className="h-6 w-6 animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h1 className="text-3xl font-bold flex items-center gap-2">
				Economy Configuration
				{hasOverrides && <CheckCircle2 className="h-5 w-5 text-yellow-400" title="Overrides active" />}
			</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<Textarea
					value={json}
					onChange={(e) => setJson(e.target.value)}
					className="font-mono min-h-[600px]"
				/>
				<div className="flex gap-2">
					<Button type="submit" disabled={updateMutation.isPending}>
						{updateMutation.isPending ? 'Saving...' : 'Save Config'}
					</Button>
					<Button
						type="button"
						variant="secondary"
						disabled={resetMutation.isPending}
						onClick={handleRestoreDefaults}
					>
						{resetMutation.isPending ? 'Restoring…' : 'Restore Defaults'}
					</Button>
				</div>
			</form>
		</div>
	);
}
