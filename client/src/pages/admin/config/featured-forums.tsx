import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@app/components/ui/textarea';
import { Button } from '@app/components/ui/button';
import { useToast } from '@app/hooks/use-toast';
import { apiRequest, queryClient } from '@app/utils/queryClient';

export default function FeaturedForumConfigPage() {
	const { toast } = useToast();
	const { data, isLoading } = useQuery<any>({
		queryKey: ['/api/admin/config/featured-forums'],
		queryFn: () => apiRequest({ url: '/api/admin/config/featured-forums', method: 'GET' })
	});

	const [json, setJson] = useState('');

	useEffect(() => {
		if (data) setJson(JSON.stringify(data, null, 2));
	}, [data]);

	const saveMutation = useMutation({
		mutationFn: async (body: string) => {
			const parsed = JSON.parse(body);
			await apiRequest({ url: '/api/admin/config/featured-forums', method: 'PUT', data: parsed });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['/api/admin/config/featured-forums'] });
			toast({ title: 'Config saved', description: 'Featured Forums configuration updated.' });
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
