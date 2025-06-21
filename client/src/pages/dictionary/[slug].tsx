import React from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { LoadingSpinner } from '@/components/ui/loader';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { dictionaryApi } from '@/features/dictionary/services/dictionaryApi';

interface DictionaryEntry {
	id: number;
	slug: string;
	word: string;
	definition: string;
	usageExample?: string;
	upvoteCount: number;
	hasUpvoted?: boolean;
	status: string;
}

export default function DictionaryDetailPage() {
	const { slug } = useParams<{ slug: string }>();
	const queryClient = useQueryClient();

	const { data, isLoading, error } = useQuery<DictionaryEntry>({
		queryKey: ['dictionary', slug],
		queryFn: async () => {
			const res = await apiRequest({ url: `/api/dictionary/${slug}`, method: 'GET' });
			return res;
		}
	});

	const upvoteMutation = useMutation((id: number) => dictionaryApi.upvote(id), {
		onMutate: async () => {
			if (!data) return;
			queryClient.setQueryData(['dictionary', slug], (old: any) => {
				if (!old) return old;
				return {
					...old,
					upvoteCount: old.upvoteCount + (old.hasUpvoted ? -1 : 1),
					hasUpvoted: !old.hasUpvoted
				};
			});
		},
		onError: () => {
			queryClient.invalidateQueries(['dictionary', slug]);
		}
	});

	if (isLoading) return <LoadingSpinner />;
	if (error || !data) return <ErrorDisplay message="Entry not found" />;

	return (
		<div className="max-w-3xl mx-auto px-4 py-10">
			<h1 className="text-4xl font-bold mb-4">{data.word}</h1>
			<p className="text-lg whitespace-pre-line mb-6">{data.definition}</p>
			{data.usageExample && (
				<blockquote className="italic border-l-4 pl-4 mb-6">{data.usageExample}</blockquote>
			)}

			<div className="flex items-center gap-4 mb-10">
				<Tooltip content={data.hasUpvoted ? 'You already upvoted this word.' : 'Upvote this word'}>
					<Button
						onClick={() => upvoteMutation.mutate(data.id)}
						disabled={upvoteMutation.isLoading || data.hasUpvoted}
					>
						👍 {data.upvoteCount}
					</Button>
				</Tooltip>
				{data.status === 'pending' && <span className="text-amber-400">Awaiting approval</span>}
			</div>

			<Link href="/dictionary" className="text-blue-400 underline">
				← Back to list
			</Link>
		</div>
	);
}
