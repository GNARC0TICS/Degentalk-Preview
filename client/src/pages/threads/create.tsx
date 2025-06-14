import React, { useState, useEffect } from 'react';
import { useLocation, Link, useSearch } from 'wouter';
import { CreateThreadForm } from '@/features/forum/components/CreateThreadForm';
import { SiteFooter } from '@/components/layout/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, MessageSquare, TrendingUp, Star, Sparkles, AlertTriangle, Home, ChevronRight, Folder } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
// import { forumMap } from '@/config/forumMap.config'; // To be replaced by context
// import type { Forum, Zone } from '@/config/forumMap.config'; // To be replaced by context types
import { useForumStructure } from '@/contexts/ForumStructureContext'; // Import context hook
import type { MergedForum, MergedZone } from '@/contexts/ForumStructureContext'; // Import context types
import NotFoundPage from '@/pages/not-found';
import {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function CreateThreadPage() {
	const [isModalOpen, setIsModalOpen] = useState(true);
	const [, setLocation] = useLocation();
	const { user } = useAuth();
	const searchParams = new URLSearchParams(useSearch());
	const forumSlugFromQuery = searchParams.get('forumSlug');
	const [currentWouterLocation] = useLocation(); // For redirect

	const { getForum, getZoneByForumSlug, isLoading: isForumStructureLoading, error: forumStructureError } = useForumStructure();

	const [targetForum, setTargetForum] = useState<MergedForum | undefined>(undefined);
	const [parentZone, setParentZone] = useState<MergedZone | undefined>(undefined);

	useEffect(() => {
		if (!isForumStructureLoading && forumSlugFromQuery) {
			const forum = getForum(forumSlugFromQuery);
			setTargetForum(forum);
			if (forum) {
				const zone = getZoneByForumSlug(forumSlugFromQuery);
				setParentZone(zone);
			} else {
				setParentZone(undefined);
			}
		} else if (!forumSlugFromQuery) {
			setTargetForum(undefined);
			setParentZone(undefined);
		}
	}, [forumSlugFromQuery, isForumStructureLoading, getForum, getZoneByForumSlug]);
	
	const handleCloseModal = () => {
		setIsModalOpen(false);
		setLocation(targetForum ? `/forums/${targetForum.slug}` : '/forums');
	};

	const handleSuccess = (newThreadSlug: string) => {
		setIsModalOpen(false);
	};

	const breadcrumbItems = React.useMemo(() => {
		const items = [{ label: <Home className="h-4 w-4"/>, href: '/' }];
		if (parentZone) {
			items.push({ label: <>{parentZone.name}</>, href: `/zones/${parentZone.slug}` });
		}
		if (targetForum) {
			items.push({ label: <>{targetForum.name}</>, href: `/forums/${targetForum.slug}` });
		}
		items.push({ label: <>Create Thread</>, href: `/threads/create${forumSlugFromQuery ? `?forumSlug=${forumSlugFromQuery}`: ''}`});
		return items;
	}, [parentZone, targetForum, forumSlugFromQuery]);

	if (isForumStructureLoading) {
		return (
			<div className="min-h-screen flex justify-center items-center bg-black">
				<p className="text-white">Loading forum structure...</p>
			</div>
		);
	}

	// Custom NotFoundPage rendering for errors
	const renderNotFound = (message: string) => (
		<div style={{ textAlign: 'center', padding: '50px' }}>
			<h1>Error</h1>
			<p>{message}</p>
			<Link href="/"><span style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}>Go back to Home</span></Link>
		</div>
	);

	if (forumStructureError) {
		return renderNotFound(`Error loading forum structure: ${forumStructureError.message}`);
	}

	if (forumSlugFromQuery && !targetForum && !isForumStructureLoading) {
		return renderNotFound(`Forum with slug '${forumSlugFromQuery}' not found.`);
	}
	
	// Enhanced rule check: use allowPosting from rules. isLocked needs to be added to MergedForum if available from API.
	// For now, assuming isLocked is not yet part of MergedForum.
	const canPostInTargetForum = targetForum ? targetForum.rules.allowPosting /* && !targetForum.isLocked */ : true;
	const forumNameForDisplay = targetForum ? targetForum.name : 'a New Forum';
	// Prepare rules to pass to CreateThreadForm
	const forumRules = targetForum?.rules;


	const tips = [
		{ icon: <MessageSquare className="h-5 w-5 text-emerald-400" />, title: 'Clear Subject', description: 'Use a descriptive title that summarizes your topic' },
		{ icon: <Users className="h-5 w-5 text-purple-400" />, title: 'Engage Community', description: 'Ask questions and encourage discussion' },
		{ icon: <TrendingUp className="h-5 w-5 text-amber-400" />, title: 'Add Value', description: 'Share insights, analysis, or helpful resources' },
		{ icon: <Star className="h-5 w-5 text-cyan-400" />, title: 'Use Tags', description: 'Help others find your content with relevant tags' },
	];

	return (
		<div className="min-h-screen flex flex-col relative bg-zinc-900 text-white">
			<div className="absolute inset-0 -z-10" style={{ backgroundImage: `radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.05) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.04) 0%, transparent 40%)` }} />

			<header className="relative z-10 border-b border-zinc-800/50 bg-zinc-900/80 backdrop-blur-sm">
				<div className="container mx-auto px-4 py-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Link href={targetForum ? `/forums/${targetForum.slug}` : '/forums'}>
								<Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back to {targetForum ? targetForum.name : 'Forums'}
								</Button>
							</Link>
						</div>
						<h1 className="text-lg font-semibold text-white flex items-center">
							<Sparkles className="h-5 w-5 mr-2 text-purple-400" />
							Create Thread {targetForum ? `in ${targetForum.name}` : ''}
						</h1>
						{user ? (
							<>
								<div className="flex items-center gap-2">
									<span className="text-sm text-zinc-300 hidden sm:inline">{user.username}</span>
									<div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
										{user.username?.charAt(0).toUpperCase()}
									</div>
								</div>
							</>
						) : (
							<div className="w-8 h-8" />
						)}
					</div>
				</div>
			</header>
			
			<div className="container mx-auto px-4 py-4">
				<Breadcrumb className="mb-6 text-sm">
					<BreadcrumbList>
						{breadcrumbItems.map((item, index) => (
							<React.Fragment key={item.href || index}>
								<BreadcrumbItem>
									{index === breadcrumbItems.length - 1 ? (
										<BreadcrumbPage>{item.label}</BreadcrumbPage>
									) : (
										<BreadcrumbLink asChild>
											<Link href={item.href}>{item.label}</Link>
										</BreadcrumbLink>
									)}
								</BreadcrumbItem>
								{index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
							</React.Fragment>
						))}
					</BreadcrumbList>
				</Breadcrumb>
			</div>

			<main className="flex-1 py-2 pb-8 relative z-10">
				<div className="container mx-auto px-4 max-w-6xl">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-1 order-2 lg:order-1">
							<Card className="bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50 sticky top-6">
								<CardHeader>
									<CardTitle className="text-md text-emerald-300">Posting Guidelines</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									{tips.map((tip, index) => (
										<div key={index} className="flex gap-3 p-2.5 rounded-md bg-zinc-700/40 border border-zinc-600/50">
											<div className="flex-shrink-0 mt-0.5">{tip.icon}</div>
											<div>
												<h4 className="font-medium text-white text-xs">{tip.title}</h4>
												<p className="text-[11px] text-zinc-400 mt-0.5">{tip.description}</p>
											</div>
										</div>
									))}
									{targetForum && !canPostInTargetForum && (
										<div className="p-3 rounded-md bg-red-800/30 border border-red-700/50 text-red-300 text-sm flex items-center gap-2">
											<AlertTriangle size={18} /> Posting is currently disabled in {targetForum.name}.
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						<div className="lg:col-span-2 order-1 lg:order-2">
							<Card className="bg-zinc-800/50 backdrop-blur-sm border-zinc-700/50 shadow-lg">
								<CardHeader className="text-center border-b border-zinc-700/50 pb-4">
									<div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-600/30 to-violet-600/30 flex items-center justify-center">
										<MessageSquare className="h-6 w-6 text-purple-300" />
									</div>
									<CardTitle className="text-xl text-white">
										Share Your Thoughts in {forumNameForDisplay}
									</CardTitle>
									<CardDescription className="text-zinc-400 text-xs">
										Craft a compelling post to engage the DegenTalk community.
									</CardDescription>
								</CardHeader>
								<CardContent className="p-6">
									{!user ? (
										<div className="text-center py-10">
											<Users className="h-10 w-10 mx-auto mb-3 text-amber-400" />
											<h3 className="text-lg font-semibold text-white mb-1">Authentication Required</h3>
											<p className="text-zinc-400 text-sm mb-5">You need to be signed in to create a new thread.</p>
											<Link href={`/auth?redirect_to=${encodeURIComponent(currentWouterLocation)}`}>
												<Button className="bg-emerald-600 hover:bg-emerald-500 text-white">Sign In to Create Thread</Button>
											</Link>
										</div>
									) : !canPostInTargetForum && targetForum ? (
										<div className="text-center py-10">
											<AlertTriangle className="h-10 w-10 mx-auto mb-3 text-red-400" />
											<h3 className="text-lg font-semibold text-white mb-1">Posting Disabled</h3>
											<p className="text-zinc-400 text-sm mb-5">
												Thread creation is currently disabled in the "{targetForum.name}" forum.
												Please select a different forum or check back later.
											</p>
											<Link href={parentZone ? `/zones/${parentZone.slug}` : '/forums' }>
												<Button variant="outline" className="border-zinc-600 text-zinc-300 hover:bg-zinc-700">
													Back to {parentZone ? parentZone.name : 'Forums'}
												</Button>
											</Link>
										</div>
									) : (
										<CreateThreadForm 
											onSuccess={handleSuccess} 
											forumSlug={targetForum?.slug}
											// Pass down specific rules needed by the form
											// Example:
											// allowPolls={forumRules?.canCreatePolls ?? true} 
											// allowAttachments={forumRules?.canUploadAttachments ?? true}
											// minTags={forumRules?.minTags}
											// maxTags={forumRules?.maxTags}
											// etc.
											// For now, we'll assume CreateThreadForm handles undefined rules gracefully
											// or we'll update it in the next step.
											// Pass the correct prop names as defined in CreateThreadFormProps
											forumRules={forumRules}
											// isForumLocked={targetForum?.isLocked || false} // isLocked not on MergedForum yet
											forumName={targetForum?.name}
										/>
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</main>
			<SiteFooter />
		</div>
	);
}
