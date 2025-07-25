import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Progress } from '@app/components/ui/progress';
import { Crown, Sparkles, Zap, Star } from 'lucide-react';
import type { ReputationTier } from '@app/pages/admin/reputation';

interface ReputationTiersSectionProps {
	tiers: ReputationTier[];
	isLoading: boolean;
}

export function ReputationTiersSection({ tiers, isLoading }: ReputationTiersSectionProps) {
	if (isLoading) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="flex justify-center">
						<p>Loading tier information...</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	const getTierEffectPreview = (tier: ReputationTier) => {
		if (!tier.titleEffect) return null;

		const previewStyles: React.CSSProperties = {
			color: tier.color,
			fontWeight: 'bold'
		};

		if (tier.titleEffect.includes('glow')) {
			previewStyles.textShadow = `0 0 10px ${tier.color}`;
		}

		if (tier.titleEffect.includes('rainbow')) {
			previewStyles.background =
				'linear-gradient(45deg, #ff0000, #ff7700, #ffff00, #00ff00, #0077ff, #0000ff, #7700ff)';
			previewStyles.backgroundClip = 'text';
			previewStyles.WebkitBackgroundClip = 'text';
			previewStyles.WebkitTextFillColor = 'transparent';
		}

		return (
			<div className="mt-2">
				<p className="text-xs text-muted-foreground mb-1">Title Effect Preview:</p>
				<div
					className={`inline-block px-2 py-1 rounded text-sm ${tier.titleEffect?.includes('animated') ? 'animate-pulse' : ''}`}
					style={previewStyles}
				>
					{tier.name} User
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Crown className="h-5 w-5" />
								Reputation Tier Management
							</CardTitle>
							<CardDescription>
								Configure reputation tiers, benefits, and visual effects for users
							</CardDescription>
						</div>
						<Button variant="outline" disabled>
							<Sparkles className="h-4 w-4 mr-2" />
							Coming Soon: Custom Tiers
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						{/* Tier Progression Visualization */}
						<div className="space-y-4">
							<h3 className="font-semibold">Tier Progression</h3>
							<div className="relative">
								<div className="flex items-center space-x-2 mb-4">
									{tiers.map((tier, index) => (
										<React.Fragment key={tier.id}>
											<div className="flex flex-col items-center">
												<div
													className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold border-2"
													style={{
														backgroundColor: tier.color,
														borderColor: tier.color
													}}
												>
													{tier.icon}
												</div>
												<div className="text-center mt-2">
													<p className="text-xs font-medium">{tier.name}</p>
													<p className="text-xs text-muted-foreground">{tier.minReputation}+ reputation</p>
												</div>
											</div>
											{index < tiers.length - 1 && <div className="flex-1 h-px bg-border"></div>}
										</React.Fragment>
									))}
								</div>
							</div>
						</div>

						{/* Detailed Tier Cards */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{tiers.map((tier) => (
								<Card key={tier.id} className="relative overflow-hidden">
									<div
										className="absolute top-0 left-0 w-full h-1"
										style={{ backgroundColor: tier.color }}
									></div>
									<CardHeader className="pb-3">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-3">
												<div
													className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
													style={{ backgroundColor: tier.color }}
												>
													{tier.icon}
												</div>
												<div>
													<h3 className="font-semibold text-lg" style={{ color: tier.color }}>
														{tier.name}
													</h3>
													<p className="text-sm text-muted-foreground">
														{tier.minReputation}+ reputation
														{tier.maxReputation && ` (up to ${tier.maxReputation})`}
													</p>
												</div>
											</div>
											<Badge
												variant="outline"
												style={{ borderColor: tier.color, color: tier.color }}
											>
												Tier {tiers.indexOf(tier) + 1}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="space-y-4">
										<p className="text-sm">{tier.description}</p>

										{/* Benefits */}
										<div>
											<h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
												<Star className="h-3 w-3" />
												Benefits
											</h4>
											<div className="space-y-1">
												{tier.benefits.map((benefit, idx) => (
													<p key={idx} className="text-xs text-muted-foreground">
														• {benefit}
													</p>
												))}
											</div>
										</div>

										{/* Visual Effects */}
										{tier.titleEffect && (
											<div>
												<h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
													<Zap className="h-3 w-3" />
													Visual Effects
												</h4>
												<Badge variant="outline" className="text-xs mb-2">
													{tier.titleEffect}
												</Badge>
												{getTierEffectPreview(tier)}
											</div>
										)}

										{/* Requirements */}
										<div>
											<h4 className="text-sm font-semibold mb-2">Requirements</h4>
											<div className="space-y-2">
												<div className="flex justify-between text-xs">
													<span>Minimum Reputation:</span>
													<span className="font-medium">{tier.minReputation}</span>
												</div>
												{tier.maxReputation && (
													<div className="flex justify-between text-xs">
														<span>Maximum Reputation:</span>
														<span className="font-medium">{tier.maxReputation}</span>
													</div>
												)}
												{tier.minReputation > 0 && (
													<div className="mt-2">
														<div className="flex justify-between text-xs mb-1">
															<span>Progress to next tier:</span>
															<span>
																{tier.maxReputation
																	? `${tier.maxReputation - tier.minReputation + 1} reputation range`
																	: 'Final tier'}
															</span>
														</div>
														{tier.maxReputation && (
															<Progress
																value={50}
																className="h-2"
																style={{
																	backgroundColor: `${tier.color}20`
																}}
															/>
														)}
													</div>
												)}
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>

						{/* Tier System Settings */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Tier System Configuration</CardTitle>
								<CardDescription>Global settings for the reputation tier system</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label className="text-sm font-medium">Tier Calculation Method</label>
										<Badge variant="outline">Total Lifetime Reputation</Badge>
										<p className="text-xs text-muted-foreground">
											Users are ranked by their total accumulated reputation across all activities
										</p>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium">Tier Updates</label>
										<Badge variant="outline">Real-time</Badge>
										<p className="text-xs text-muted-foreground">
											Tier changes apply immediately when reputation thresholds are reached
										</p>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium">Tier Visibility</label>
										<Badge variant="outline">Public</Badge>
										<p className="text-xs text-muted-foreground">
											User tiers are visible on profiles and in forum displays
										</p>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium">Tier Effects</label>
										<Badge variant="outline">Enhanced Titles & Badges</Badge>
										<p className="text-xs text-muted-foreground">
											Higher tiers unlock special visual effects and privileges
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
