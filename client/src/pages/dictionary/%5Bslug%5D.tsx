import React from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { LoadingSpinner } from '@/components/ui/loader';
import { ErrorDisplay } from '@/components/ui/error-display';
import { Button } from '@/components/ui/button';

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
            return res.json();
        }
    });

    const upvoteMutation = useMutation({
        mutationFn: async () => {
            await apiRequest({ url: `/api/dictionary/${data?.id}/upvote`, method: 'POST' });
        },
        onSuccess: () => {
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
                <Button onClick={() => upvoteMutation.mutate()} disabled={upvoteMutation.isLoading}>
                    👍 {data.upvoteCount}
                </Button>
                {data.status === 'pending' && <span className="text-amber-400">Awaiting approval</span>}
            </div>

            <Link href="/dictionary" className="text-blue-400 underline">
                ← Back to list
            </Link>
        </div>
    );
} 