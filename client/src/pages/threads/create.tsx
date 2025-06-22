import React, { useState, useEffect } from 'react';
import { useLocation, Link, useSearch } from 'wouter';
import { ThreadForm } from '@/features/forum/components/ThreadForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	ArrowLeft,
	Users,
	MessageSquare,
	Sparkles,
	AlertTriangle,
	Home,
	Folder,
	Lightbulb,
	BookOpen,
	Hash,
	Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useForumStructure } from '@/contexts/ForumStructureContext';
import type { MergedForum, MergedZone } from '@/contexts/ForumStructureContext';
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

export default function CreateThreadPage() {
	const { user } = useAuth();
	const searchParams = new URLSearchParams(useSearch());
	const forumSlugFromQuery = searchParams.get('forumSlug');
	const [currentWouterLocation] = useLocation();

	const {
		getForum,
		zones,
		isLoading: isForumStructureLoading,
		error: forumStructureError
	} = useForumStructure();

	const [targetForum, setTargetForum] = useState<MergedForum | undefined>(undefined);
	const [parentZone, setParentZone] = useState<MergedZone | undefined>(undefined);

	useEffect(() => {
		if (!isForumStructureLoading && forumSlugFromQuery) {
			const forum = getForum(forumSlugFromQuery);
			setTargetForum(forum);
			if (forum) {
				// Find the zone that contains this forum
				const zone = zones.find((z) => z.forums.some((f) => f.slug === forumSlugFromQuery));
				setParentZone(zone);
			} else {
				setParentZone(undefined);
			}
		} else if (!forumSlugFromQuery) {
			setTargetForum(undefined);
			setParentZone(undefined);
		}
	}, [forumSlugFromQuery, isForumStructureLoading, getForum, zones]);

	const handleSuccess = () => {
		// ThreadForm handles the redirect
	};

	const breadcrumbItems = React.useMemo(() => {
		const items = [{ label: 'Home', icon: Home, href: '/' }];
		if (parentZone) {
			items.push({ label: parentZone.name, icon: Folder, href: `/zones/${parentZone.slug}` });
		}
		if (targetForum) {
			items.push({
				label: targetForum.name,
				icon: MessageSquare,
				href: `/forums/${targetForum.slug}`
			});
		}
		items.push({
			label: 'Create Thread',
			icon: Sparkles,
			href: `/threads/create${forumSlugFromQuery ? `?forumSlug=${forumSlugFromQuery}` : ''}`
		});
		return items;
	}, [parentZone, targetForum, forumSlugFromQuery]);

	if (isForumStructureLoading) {
		return (
			<div className="min-h-screen flex justify-center items-center bg-zinc-950">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
					<p className="text-zinc-400">Loading forum structure...</p>
				</div>
			</div>
		);
	}

	if (forumStructureError) {
		return (
			<div className="min-h-screen flex justify-center items-center bg-zinc-950">
				<div className="text-center max-w-md">
					<AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<h1 className="text-xl font-semibold text-white mb-2">Error Loading Forums</h1>
					<p className="text-zinc-400 mb-6">{forumStructureError.message}</p>
					<Link href="/">
						<Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
							Return Home
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	if (forumSlugFromQuery && !targetForum && !isForumStructureLoading) {
		return (
			<div className="min-h-screen flex justify-center items-center bg-zinc-950">
				<div className="text-center max-w-md">
					<AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
					<h1 className="text-xl font-semibold text-white mb-2">Forum Not Found</h1>
					<p className="text-zinc-400 mb-6">The forum "{forumSlugFromQuery}" doesn't exist.</p>
					<Link href="/forums">
						<Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
							Browse Forums
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	const canPostInTargetForum = targetForum ? targetForum.rules.allowPosting : true;
	const forumNameForDisplay = targetForum ? targetForum.name : 'Forum';
	const forumRules = targetForum?.rules;

	// Zone-aware styling
	const zoneAccentColor = parentZone?.theme?.color || '#10b981';
	const zoneStyles = {
		'--zone-accent': zoneAccentColor,
		'--zone-accent-rgb': hexToRgb(zoneAccentColor)
	} as React.CSSProperties;

	const tips = [
		{
			icon: <Lightbulb className="h-5 w-5" style={{ color: zoneAccentColor }} />,
			title: 'Clear Title',
			description: 'Make it specific and searchable'
		},
		{
			icon: <BookOpen className="h-5 w-5 text-purple-400" />,
			title: 'Quality Content',
			description: 'Provide context and details'
		},
		{
			icon: <Hash className="h-5 w-5 text-amber-400" />,
			title: 'Tag Wisely',
			description: 'Help others find your thread'
		},
		{
			icon: <Zap className="h-5 w-5 text-cyan-400" />,
			title: 'Be Engaging',
			description: 'Encourage discussion'
		}
	];

	return (
		<div
			className="min-h-[calc(100vh-theme(spacing.16)-theme(spacing.20))] relative"
			style={zoneStyles}
		>
			{/* Background gradient with zone accent */}
			<div
				className="absolute inset-0 -z-10 opacity-20"
				style={{
					backgroundImage: `
            radial-gradient(circle at 20% 30%, ${zoneAccentColor}20 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, ${zoneAccentColor}10 0%, transparent 40%)
          `
				}}
			/>

			<div className="container mx-auto px-4 py-6 max-w-7xl">
				{/* Header with breadcrumbs */}
				<div className="mb-8">
					<Breadcrumb>
						<BreadcrumbList>
							{breadcrumbItems.map((item, index) => {
								const Icon = item.icon;
								return (
									<React.Fragment key={item.href || index}>
										<BreadcrumbItem>
											{index === breadcrumbItems.length - 1 ? (
												<BreadcrumbPage className="flex items-center gap-2 text-zinc-300">
													<Icon className="h-4 w-4" />
													{item.label}
												</BreadcrumbPage>
											) : (
												<BreadcrumbLink asChild>
													<Link
														href={item.href}
														className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
													>
														<Icon className="h-4 w-4" />
														{item.label}
													</Link>
												</BreadcrumbLink>
											)}
										</BreadcrumbItem>
										{index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
									</React.Fragment>
								);
							})}
						</BreadcrumbList>
					</Breadcrumb>
				</div>

				{/* Mobile Rules Box - Collapsible */}
				<div className="lg:hidden mb-6">
					<details className="group">
						<summary className="flex items-center justify-between p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-900/80 transition-colors">
							<span className="flex items-center gap-2 font-medium text-white">
								<BookOpen className="h-4 w-4" style={{ color: zoneAccentColor }} />
								Posting Guidelines
							</span>
							<div className="transition-transform group-open:rotate-180">
								<svg
									className="w-4 h-4 text-zinc-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</div>
						</summary>
						<div className="mt-2 p-4 bg-zinc-800/40 border border-zinc-700/50 rounded-lg space-y-2">
							{tips.map((tip, index) => (
								<div key={index} className="flex gap-2 items-start">
									<div className="flex-shrink-0 mt-0.5">{tip.icon}</div>
									<div>
										<h4 className="font-medium text-white text-xs">{tip.title}</h4>
										<p className="text-[10px] text-zinc-400">{tip.description}</p>
									</div>
								</div>
							))}
						</div>
					</details>
				</div>

				{/* Main content grid */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Desktop Sidebar - Guidelines */}
					<div className="hidden lg:block lg:col-span-4 xl:col-span-3">
						<div className="sticky top-24 space-y-6">
							<Card className="bg-zinc-900/60 border-zinc-800 backdrop-blur-md">
								<CardHeader className="pb-4">
									<CardTitle className="text-base font-medium flex items-center gap-2">
										<BookOpen className="h-4 w-4" style={{ color: zoneAccentColor }} />
										Posting Tips
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									{tips.map((tip, index) => (
										<div
											key={index}
											className="flex gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600/50 transition-colors"
										>
											<div className="flex-shrink-0 mt-0.5">{tip.icon}</div>
											<div>
												<h4 className="font-medium text-white text-sm">{tip.title}</h4>
												<p className="text-xs text-zinc-400 mt-0.5">{tip.description}</p>
											</div>
										</div>
									))}
								</CardContent>
							</Card>

							{targetForum && !canPostInTargetForum && (
								<Alert className="bg-red-900/20 border-red-800">
									<AlertTriangle className="h-4 w-4 text-red-400" />
									<AlertDescription className="text-red-300">
										Posting is currently disabled in {targetForum.name}.
									</AlertDescription>
								</Alert>
							)}
						</div>
					</div>

					{/* Main form area */}
					<div className="lg:col-span-8 xl:col-span-9">
						<Card className="bg-zinc-900/80 border-zinc-800 backdrop-blur-md shadow-2xl">
							<CardHeader className="text-center border-b border-zinc-800 pb-6">
								<div
									className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
									style={{
										background: `linear-gradient(135deg, ${zoneAccentColor}30 0%, ${zoneAccentColor}10 100%)`,
										border: `1px solid ${zoneAccentColor}40`
									}}
								>
									<MessageSquare className="h-8 w-8" style={{ color: zoneAccentColor }} />
								</div>
								<CardTitle className="text-2xl font-bold text-white">
									Create Thread in {forumNameForDisplay}
								</CardTitle>
								<CardDescription className="text-zinc-400 mt-2">
									Share your thoughts with the DegenTalk community
								</CardDescription>
							</CardHeader>

							<CardContent className="p-8">
								{!user ? (
									<div className="text-center py-12">
										<Users className="h-12 w-12 mx-auto mb-4 text-amber-400" />
										<h3 className="text-lg font-semibold text-white mb-2">Sign In Required</h3>
										<p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
											You need to be signed in to create threads and participate in discussions.
										</p>
										<Link href={`/auth?redirect_to=${encodeURIComponent(currentWouterLocation)}`}>
											<Button
												size="lg"
												className={cn(
													'font-semibold shadow-lg',
													'bg-gradient-to-r from-emerald-600 to-cyan-600',
													'hover:from-emerald-500 hover:to-cyan-500'
												)}
											>
												Sign In to Continue
											</Button>
										</Link>
									</div>
								) : !canPostInTargetForum && targetForum ? (
									<div className="text-center py-12">
										<AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-400" />
										<h3 className="text-lg font-semibold text-white mb-2">Posting Disabled</h3>
										<p className="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
											Thread creation is currently disabled in "{targetForum.name}".
										</p>
										<Link href={parentZone ? `/zones/${parentZone.slug}` : '/forums'}>
											<Button
												variant="outline"
												className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
											>
												<ArrowLeft className="h-4 w-4 mr-2" />
												Back to {parentZone ? parentZone.name : 'Forums'}
											</Button>
										</Link>
									</div>
								) : (
									<ThreadForm
										onSuccess={handleSuccess}
										forumSlug={targetForum?.slug}
										forumRules={forumRules}
									/>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
		: '255, 255, 255';
}
