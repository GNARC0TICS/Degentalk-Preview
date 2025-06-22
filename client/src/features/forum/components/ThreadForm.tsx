import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Loader2, Hash, Eye, Edit3 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import type { MergedRules } from '@/contexts/ForumStructureContext';
import DOMPurify from 'dompurify';

// Form validation schema
const threadFormSchema = z.object({
	title: z
		.string()
		.min(10, 'Title must be at least 10 characters')
		.max(100, 'Title must be less than 100 characters'),
	content: z.string().min(20, 'Content must be at least 20 characters'),
	prefix: z.string().optional(),
	tags: z.string().optional()
});

type ThreadFormData = z.infer<typeof threadFormSchema>;

interface ThreadFormProps {
	forumSlug?: string;
	forumRules?: MergedRules;
	onSuccess: (threadSlug: string) => void;
	className?: string;
}

export function ThreadForm({
	forumSlug,
	/*forumRules*/ _forumRules,
	onSuccess,
	className
}: ThreadFormProps) {
	const [, setLocation] = useLocation();
	const { toast } = useToast();
	const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

	const form = useForm<ThreadFormData>({
		resolver: zodResolver(threadFormSchema),
		defaultValues: {
			title: '',
			content: '',
			prefix: '',
			tags: ''
		}
	});

	const createThreadMutation = useMutation({
		mutationFn: async (data: ThreadFormData) => {
			return apiRequest<{ slug: string }>({
				url: '/api/threads',
				method: 'POST',
				data: {
					...data,
					forumSlug: forumSlug,
					tags: data.tags
						? data.tags
								.split(',')
								.map((t) => t.trim())
								.filter(Boolean)
						: []
				}
			});
		},
		onSuccess: (data) => {
			toast({
				title: 'Thread Created!',
				description: 'Your thread has been posted successfully.'
			});
			onSuccess(data.slug);
			setLocation(`/threads/${data.slug}`);
		},
		onError: (error: Error) => {
			toast({
				title: 'Error',
				description: error.message || 'Failed to create thread',
				variant: 'destructive'
			});
		}
	});

	const onSubmit = (data: ThreadFormData) => {
		createThreadMutation.mutate(data);
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-6', className)}>
			{/* Title Input */}
			<div className="space-y-2">
				<Label htmlFor="title" className="text-sm font-medium text-zinc-300">
					Thread Title
				</Label>
				<Input
					id="title"
					{...form.register('title')}
					placeholder="Enter a descriptive title for your thread..."
					className={cn(
						'bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500',
						'focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20',
						'text-lg md:text-xl py-3',
						form.formState.errors.title && 'border-red-500/50'
					)}
					disabled={createThreadMutation.isPending}
				/>
				{form.formState.errors.title && (
					<p className="text-sm text-red-400 flex items-center gap-1">
						<AlertCircle className="h-3 w-3" />
						{form.formState.errors.title.message}
					</p>
				)}
			</div>

			{/* Prefix Select (optional) */}
			<div className="space-y-2">
				<Label htmlFor="prefix" className="text-sm font-medium text-zinc-300">
					Thread Prefix <span className="text-zinc-500">(optional)</span>
				</Label>
				<select
					id="prefix"
					{...form.register('prefix')}
					className={cn(
						'w-full bg-zinc-900/50 border border-zinc-700 text-white rounded-md px-3 py-2',
						'focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20',
						'disabled:opacity-50 disabled:cursor-not-allowed'
					)}
					disabled={createThreadMutation.isPending}
				>
					<option value="">Select a prefix...</option>
					<option value="question">❓ Question</option>
					<option value="discussion">💬 Discussion</option>
					<option value="guide">📚 Guide</option>
					<option value="news">📰 News</option>
					<option value="poll">📊 Poll</option>
				</select>
			</div>

			{/* Content Editor with Live Preview */}
			<div className="space-y-3">
				<Label htmlFor="content" className="text-sm font-medium text-zinc-300">
					Thread Content
				</Label>

				<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'write' | 'preview')} className="w-full">
					<TabsList className="grid w-full grid-cols-2 bg-zinc-800/50 border border-zinc-700">
						<TabsTrigger 
							value="write" 
							className="flex items-center gap-2 data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
						>
							<Edit3 className="h-4 w-4" />
							Write
						</TabsTrigger>
						<TabsTrigger 
							value="preview" 
							className="flex items-center gap-2 data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
						>
							<Eye className="h-4 w-4" />
							Preview
						</TabsTrigger>
					</TabsList>
					
					<TabsContent value="write" className="mt-2">
						<RichTextEditor
							content={form.watch('content')}
							onChange={(html) => form.setValue('content', html, { shouldValidate: true })}
							placeholder="Share your thoughts, questions, or insights..."
							editorClass="min-h-[300px]"
							readOnly={createThreadMutation.isPending}
						/>
					</TabsContent>
					
					<TabsContent value="preview" className="mt-2">
						<Card className="bg-zinc-900/50 border-zinc-700">
							<CardHeader className="pb-3">
								<CardTitle className="text-lg">Preview</CardTitle>
							</CardHeader>
							<CardContent>
								{form.watch('content') ? (
									<div 
										className="prose prose-invert prose-zinc max-w-none min-h-[250px]"
										dangerouslySetInnerHTML={{ 
											__html: DOMPurify.sanitize(form.watch('content')) 
										}}
									/>
								) : (
									<div className="min-h-[250px] flex items-center justify-center text-zinc-500 text-sm">
										Nothing to preview yet. Switch to "Write" tab to add content.
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				{form.formState.errors.content && (
					<p className="text-sm text-red-400 flex items-center gap-1">
						<AlertCircle className="h-3 w-3" />
						{form.formState.errors.content.message}
					</p>
				)}
			</div>

			{/* Tags Input */}
			<div className="space-y-2">
				<Label htmlFor="tags" className="text-sm font-medium text-zinc-300">
					Tags <span className="text-zinc-500">(optional, comma-separated)</span>
				</Label>
				<div className="relative">
					<Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
					<Input
						id="tags"
						{...form.register('tags')}
						placeholder="crypto, defi, trading, analysis..."
						className={cn(
							'pl-10 bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500',
							'focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20'
						)}
						disabled={createThreadMutation.isPending}
					/>
				</div>
			</div>

			{/* Form Actions */}
			<div className="flex items-center gap-4 pt-4">
				<Button
					type="submit"
					disabled={createThreadMutation.isPending}
					className={cn(
						'min-w-[120px]',
						'bg-gradient-to-r from-emerald-600 to-cyan-600',
						'hover:from-emerald-500 hover:to-cyan-500',
						'disabled:from-zinc-700 disabled:to-zinc-600',
						'shadow-lg shadow-emerald-500/20'
					)}
				>
					{createThreadMutation.isPending ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Creating...
						</>
					) : (
						'Create Thread'
					)}
				</Button>

				<Button
					type="button"
					variant="ghost"
					onClick={() => setLocation(forumSlug ? `/forums/${forumSlug}` : '/forums')}
					disabled={createThreadMutation.isPending}
					className="text-zinc-400 hover:text-white hover:bg-zinc-800"
				>
					Cancel
				</Button>
			</div>

			{/* Form Errors */}
			{createThreadMutation.isError && (
				<Alert className="bg-red-900/20 border-red-700/50">
					<AlertCircle className="h-4 w-4 text-red-400" />
					<AlertDescription className="text-red-300">
						{createThreadMutation.error?.message || 'Failed to create thread. Please try again.'}
					</AlertDescription>
				</Alert>
			)}
		</form>
	);
}
