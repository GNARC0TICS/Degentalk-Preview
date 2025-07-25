import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, Compass, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { useForumStructure } from '@app/features/forum/contexts/ForumStructureContext';

interface ForumNotFoundProps {
	forumSlug?: string;
	onBack?: () => void;
}

export function ForumNotFound({ forumSlug, onBack }: ForumNotFoundProps) {
	const { zones } = useForumStructure();

	// Get popular zones to suggest
	const popularZones = zones
		.filter((zone) => zone.isFeatured)
		.slice(0, 4)
		.map((zone) => ({
			name: zone.name,
			slug: zone.slug,
			description: zone.description,
			threadCount: zone.threadCount,
			icon: zone.icon
		}));

	return (
		<div className="min-h-[60vh] flex items-center justify-center p-4">
			<Card className="w-full max-w-2xl bg-zinc-900/80 border-zinc-800">
				<CardHeader className="text-center">
					<div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
						<AlertTriangle className="h-8 w-8 text-blue-500" />
					</div>
					<CardTitle className="text-2xl text-white">Forum Not Found</CardTitle>
					<p className="text-zinc-400 mt-2">
						The forum you're looking for doesn't exist, may have been moved, or you don't have
						permission to access it.
					</p>
					{forumSlug && <p className="text-xs text-zinc-500 mt-1">Forum slug: {forumSlug}</p>}
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Quick Actions */}
					<div className="flex flex-wrap gap-3 justify-center">
						{onBack && (
							<Button variant="outline" onClick={onBack} className="gap-2">
								<ArrowLeft className="h-4 w-4" />
								Go Back
							</Button>
						)}

						<Link to="/forums">
							<Button variant="outline" className="gap-2">
								<Compass className="h-4 w-4" />
								Browse All Forums
							</Button>
						</Link>

						<Link to="/search">
							<Button variant="outline" className="gap-2">
								<Search className="h-4 w-4" />
								Search Forums
							</Button>
						</Link>

						<Link to="/">
							<Button className="gap-2">
								<Home className="h-4 w-4" />
								Go Home
							</Button>
						</Link>
					</div>

					{/* Popular Zones */}
					{popularZones.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold text-white mb-4 text-center">
								Popular discussion zones
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{popularZones.map((zone) => (
									<Link key={zone.slug} to={`/zones/${zone.slug}`} className="block">
										<div className="p-4 bg-zinc-800/50 hover:bg-zinc-800/70 rounded-lg border border-zinc-700/50 hover:border-zinc-600 transition-all cursor-pointer">
											<div className="flex items-start gap-3">
												{zone.icon && <div className="text-2xl flex-shrink-0">{zone.icon}</div>}
												<div className="flex-1 min-w-0">
													<h4 className="font-medium text-white text-sm mb-1">{zone.name}</h4>
													{zone.description && (
														<p className="text-xs text-zinc-400 line-clamp-2 mb-1">
															{zone.description}
														</p>
													)}
													<div className="text-xs text-zinc-500">{zone.threadCount} threads</div>
												</div>
											</div>
										</div>
									</Link>
								))}
							</div>
						</div>
					)}

					{/* Helpful Tips */}
					<div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/50">
						<h4 className="text-sm font-medium text-white mb-2">Looking for something specific?</h4>
						<ul className="text-xs text-zinc-400 space-y-1">
							<li>• Check if the forum name has changed or moved</li>
							<li>• Use the search function to find topics you're interested in</li>
							<li>• Browse our zone directory to discover new discussions</li>
							<li>• Contact support if you believe this is an error</li>
						</ul>
					</div>

					{/* Help Text */}
					<div className="text-center text-sm text-zinc-500 pt-4 border-t border-zinc-800">
						<p>
							Can't find what you're looking for? Our community is always growing with new
							discussions.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
