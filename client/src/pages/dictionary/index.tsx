import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loader';
import { ErrorDisplay } from '@/components/ui/error-display';
import { AddWordModal } from '@/features/dictionary/components/AddWordModal';
import { Tooltip } from '@/components/ui/tooltip';
import type { DictionaryEntryId } from '@shared/types';

interface DictionaryEntry {
	id: DictionaryEntryId;
	slug: string;
	word: string;
	definition: string;
	upvoteCount: number;
	status: string;
}

export default function DictionaryListPage() {
	const [showModal, setShowModal] = useState(false);
	const { data, isLoading, error } = useQuery<{ entries: DictionaryEntry[] }>({
		queryKey: ['dictionary', 'list'],
		queryFn: async () => {
			const res = await apiRequest({ url: '/api/dictionary', method: 'GET' });
			return res.json();
		}
	});

	if (isLoading) return <LoadingSpinner />;
	if (error || !data) return <ErrorDisplay message="Failed to load dictionary" />;

	return (
		<div className="max-w-4xl mx-auto px-4 py-10">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">📖 Degen Dictionary</h1>
				<Button variant="default" onClick={() => setShowModal(true)}>
					Add Word
				</Button>
			</div>

			<div className="space-y-4">
				{data.entries.map((entry) => (
					<Card key={entry.id} className="hover:shadow-md transition">
						<CardHeader>
							<CardTitle>
								<Link href={`/dictionary/${entry.slug}`}>{entry.word}</Link>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="line-clamp-2 text-sm text-zinc-300">{entry.definition}</p>
							<Tooltip content="Upvotes earned by this holy text">
								<div className="text-xs text-zinc-500 mt-2">{entry.upvoteCount} upvotes</div>
							</Tooltip>
							{entry.status === 'pending' && (
								<span className="text-xs text-amber-400">Awaiting approval</span>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			<AddWordModal open={showModal} onClose={() => setShowModal(false)} />
		</div>
	);
}
