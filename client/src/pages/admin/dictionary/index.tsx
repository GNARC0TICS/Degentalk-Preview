import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../admin-layout';
import { dictionaryApi } from '@/features/dictionary/services/dictionaryApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loader';
import { ErrorDisplay } from '@/components/ui/error-display';

interface PendingEntry {
	id: string;
	word: string;
	definition: string;
	author: { username: string };
}

const DictionaryPendingCard: React.FC<{
	entry: PendingEntry;
	onApprove: () => void;
	onReject: () => void;
}> = ({ entry, onApprove, onReject }) => (
	<Card className="border-amber-500/30">
		<CardHeader>
			<CardTitle className="flex justify-between items-center">
				<span>{entry.word}</span>
				<div className="space-x-2">
					<Button size="sm" onClick={onApprove}>
						Approve ✅
					</Button>
					<Button size="sm" variant="destructive" onClick={onReject}>
						Reject ❌
					</Button>
				</div>
			</CardTitle>
		</CardHeader>
		<CardContent>
			<p className="text-sm mb-2 whitespace-pre-wrap line-clamp-3">{entry.definition}</p>
			<span className="text-xs text-zinc-400">by {entry.author?.username ?? 'Unknown'}</span>
		</CardContent>
	</Card>
);

export default function DictionaryAdminQueue() {
	const queryClient = useQueryClient();

	const { data, isLoading, error } = useQuery<{ entries: PendingEntry[] }>({
		queryKey: ['dictionary', 'pending'],
		queryFn: async () => {
			const res = await dictionaryApi.list({ status: 'pending', limit: 100 });
			return res.json();
		}
	});

	const moderateMutation = useMutation({
		mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
			dictionaryApi.moderate(id, status),
		onSuccess: () => {
			queryClient.invalidateQueries(['dictionary', 'pending']);
			queryClient.invalidateQueries(['dictionary', 'list']);
		}
	});

	if (isLoading) return <LoadingSpinner />;
	if (error || !data) return <ErrorDisplay message="Failed to load pending entries" />;

	return (
		<AdminLayout>
			<div className="max-w-4xl mx-auto p-8 space-y-4">
				<h1 className="text-2xl font-bold mb-4">Pending Dictionary Entries</h1>

				{data.entries.length === 0 && <p>No pending entries. Time to relax 🛀</p>}

				{data.entries.map((entry) => (
					<DictionaryPendingCard
						key={entry.id}
						entry={entry}
						onApprove={() => moderateMutation.mutate({ id: entry.id, status: 'approved' })}
						onReject={() => moderateMutation.mutate({ id: entry.id, status: 'rejected' })}
					/>
				))}
			</div>
		</AdminLayout>
	);
}
