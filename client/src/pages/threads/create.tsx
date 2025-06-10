import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { CreateThreadForm } from '@/features/forum/components/CreateThreadForm';
import { SiteFooter } from '@/components/layout/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, MessageSquare, TrendingUp, Star, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function CreateThreadPage() {
	const [isModalOpen, setIsModalOpen] = useState(true);
	const [, setLocation] = useLocation();
	const { user } = useAuth();

	const handleCloseModal = () => {
		setIsModalOpen(false);
		// Redirect back to forums when modal closes
		setLocation('/forums');
	};

	const handleSuccess = () => {
		setIsModalOpen(false);
		// The form component will handle navigation to the new thread
	};

	// Quick tips for creating threads
	const tips = [
		{
			icon: <MessageSquare className="h-5 w-5 text-emerald-400" />,
			title: 'Clear Subject',
			description: 'Use a descriptive title that summarizes your topic'
		},
		{
			icon: <Users className="h-5 w-5 text-purple-400" />,
			title: 'Engage Community',
			description: 'Ask questions and encourage discussion'
		},
		{
			icon: <TrendingUp className="h-5 w-5 text-amber-400" />,
			title: 'Add Value',
			description: 'Share insights, analysis, or helpful resources'
		},
		{
			icon: <Star className="h-5 w-5 text-cyan-400" />,
			title: 'Use Tags',
			description: 'Help others find your content with relevant tags'
		}
	];

	return (
		<div className="min-h-screen flex flex-col relative">
			{/* Enhanced Background */}
			<div
				className="absolute inset-0 -z-10"
				style={{
					backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(245, 158, 11, 0.06) 0%, transparent 50%),
            linear-gradient(135deg, rgb(9, 9, 11) 0%, rgb(24, 24, 27) 50%, rgb(9, 9, 11) 100%)
          `
				}}
			/>

			{/* Header Navigation */}
			<header className="relative z-10 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Link href="/forums">
								<Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back to Forums
								</Button>
							</Link>
							<div className="h-6 w-px bg-zinc-700" />
							<div>
								<h1 className="text-xl font-bold text-white flex items-center">
									<Sparkles className="h-5 w-5 mr-2 text-purple-400" />
									Create New Thread
								</h1>
								<p className="text-sm text-zinc-400">Share your thoughts with the community</p>
							</div>
						</div>

						{user && (
							<div className="flex items-center gap-3">
								<div className="text-right hidden sm:block">
									<p className="text-sm font-medium text-white">{user.username}</p>
									<p className="text-xs text-zinc-400">Level {user.level || 1}</p>
								</div>
								<div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
									{user.username?.charAt(0).toUpperCase()}
								</div>
							</div>
						)}
					</div>
				</div>
			</header>

			<main className="flex-1 py-8 relative z-10">
				<div className="container mx-auto px-4 max-w-6xl">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Tips Sidebar */}
						<div className="lg:col-span-1 order-2 lg:order-1">
							<Card className="bg-zinc-900/70 backdrop-blur-sm border-zinc-700/50 sticky top-8">
								<CardHeader>
									<CardTitle className="text-lg text-emerald-300">Thread Guidelines</CardTitle>
									<CardDescription>Tips for creating engaging discussions</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									{tips.map((tip, index) => (
										<div
											key={index}
											className="flex gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/30"
										>
											<div className="flex-shrink-0 mt-0.5">{tip.icon}</div>
											<div>
												<h4 className="font-medium text-white text-sm">{tip.title}</h4>
												<p className="text-xs text-zinc-400 mt-1">{tip.description}</p>
											</div>
										</div>
									))}
								</CardContent>
							</Card>

							{/* Community Stats */}
							<Card className="bg-zinc-900/70 backdrop-blur-sm border-zinc-700/50 mt-6">
								<CardHeader>
									<CardTitle className="text-lg text-purple-300">Community Activity</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span className="text-sm text-zinc-400">Active Members</span>
											<Badge variant="secondary" className="bg-emerald-900/50 text-emerald-300">
												1,247
											</Badge>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm text-zinc-400">Threads Today</span>
											<Badge variant="secondary" className="bg-purple-900/50 text-purple-300">
												89
											</Badge>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm text-zinc-400">Your Level</span>
											<Badge variant="secondary" className="bg-amber-900/50 text-amber-300">
												{user?.level || 1}
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Main Form Area */}
						<div className="lg:col-span-2 order-1 lg:order-2">
							<Card className="bg-zinc-900/70 backdrop-blur-sm border-zinc-700/50 shadow-xl">
								<CardHeader className="text-center">
									<CardTitle className="text-2xl text-white flex items-center justify-center">
										<MessageSquare className="h-6 w-6 mr-2 text-emerald-400" />
										Create Your Thread
									</CardTitle>
									<CardDescription className="text-zinc-300">
										Start a new discussion and engage with the DegenTalk community
									</CardDescription>
								</CardHeader>
								<CardContent className="p-6">
									{!user ? (
										<div className="text-center py-12">
											<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
												<Users className="h-8 w-8 text-amber-400" />
											</div>
											<h3 className="text-xl font-semibold text-white mb-2">
												Authentication Required
											</h3>
											<p className="text-zinc-400 mb-6">
												You need to be signed in to create a new thread
											</p>
											<div className="flex gap-3 justify-center">
												<Link href="/auth">
													<Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 border-0">
														Sign In
													</Button>
												</Link>
												<Link href="/forums">
													<Button
														variant="outline"
														className="border-zinc-600 text-zinc-400 hover:bg-zinc-800"
													>
														Browse Forums
													</Button>
												</Link>
											</div>
										</div>
									) : (
										<div className="text-center py-8">
											<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
												<Sparkles className="h-8 w-8 text-emerald-400" />
											</div>
											<h3 className="text-xl font-semibold text-white mb-2">Ready to Share?</h3>
											<p className="text-zinc-400 mb-6">
												Click below to open the thread creation form
											</p>
											<Button
												onClick={() => setIsModalOpen(true)}
												className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 border-0 shadow-lg"
											>
												<MessageSquare className="h-4 w-4 mr-2" />
												Start Writing
											</Button>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Quick Actions */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
								<Link href="/forums">
									<Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-700/50 hover:bg-zinc-800/70 transition-colors cursor-pointer">
										<CardContent className="p-4 text-center">
											<MessageSquare className="h-6 w-6 mx-auto mb-2 text-cyan-400" />
											<h4 className="font-medium text-white text-sm">Browse Forums</h4>
											<p className="text-xs text-zinc-400">Explore discussions</p>
										</CardContent>
									</Card>
								</Link>

								<Link href="/forums?sort=hot">
									<Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-700/50 hover:bg-zinc-800/70 transition-colors cursor-pointer">
										<CardContent className="p-4 text-center">
											<TrendingUp className="h-6 w-6 mx-auto mb-2 text-amber-400" />
											<h4 className="font-medium text-white text-sm">Hot Topics</h4>
											<p className="text-xs text-zinc-400">Trending now</p>
										</CardContent>
									</Card>
								</Link>

								<Link href="/profile">
									<Card className="bg-zinc-900/50 backdrop-blur-sm border-zinc-700/50 hover:bg-zinc-800/70 transition-colors cursor-pointer">
										<CardContent className="p-4 text-center">
											<Users className="h-6 w-6 mx-auto mb-2 text-purple-400" />
											<h4 className="font-medium text-white text-sm">Your Profile</h4>
											<p className="text-xs text-zinc-400">View your activity</p>
										</CardContent>
									</Card>
								</Link>
							</div>
						</div>
					</div>
				</div>
			</main>

			<SiteFooter />

			{/* Create Thread Form Modal */}
			<CreateThreadForm isOpen={isModalOpen} onClose={handleCloseModal} onSuccess={handleSuccess} />
		</div>
	);
}
