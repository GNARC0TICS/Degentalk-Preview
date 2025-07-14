import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useToast } from '@/hooks/use-toast.ts';
import { apiRequest, queryClient } from '@/utils/queryClient.ts';

export default function ZoneConfigPage() {
	const { toast } = useToast();
	const { data, isLoading } = useQuery<any>({
		queryKey: ['/api/admin/config/zones'],
		queryFn: () => apiRequest({ url: '/api/admin/config/zones', method: 'GET' })
	});

	const [json, setJson] = useState('');

	useEffect(() => {
		if (data) setJson(JSON.stringify(data, null, 2));
	}, [data]);

	const saveMutation = useMutation({
		mutationFn: async (body: string) => {
			const parsed = JSON.parse(body);
			await apiRequest({ url: '/api/admin/config/zones', method: 'PUT', data: parsed });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/config/zones'] });
			toast({ title: 'Config saved', description: 'Zone configuration updated.' });
		},
		onError: (err: any) => {
			toast({ title: 'Error', description: err.message, variant: 'destructive' });
		}
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		saveMutation.mutate(json);
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
			<h1 className="text-3xl font-bold">Forum Zones</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<Textarea
					value={json}
					onChange={(e) => setJson(e.target.value)}
					className="font-mono min-h-[400px]"
				/>
				<Button type="submit" disabled={saveMutation.isPending}>
					{saveMutation.isPending ? 'Saving...' : 'Save Config'}
				</Button>
			</form>
		</div>
	);
}
