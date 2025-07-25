import React, { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Thread } from '@shared/types/thread.types';
import type { ThreadId, UserId, ZoneId, StructureId, ForumId } from '@shared/types/ids';
import type { CanonicalForum } from '@app/types/canonical.types';
import {
	Wand2,
	Sparkles,
	Layout,
	Palette,
	Zap,
	Eye,
	Code,
	Save,
	Download,
	Upload,
	RotateCcw,
	Settings,
	Grid3X3,
	List,
	Columns,
	MonitorSpeaker
} from 'lucide-react';

import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Slider } from '@app/components/ui/slider';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@app/components/ui/select';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@app/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { cn } from '@app/utils/utils';

import ThreadCard from '@app/components/forum/ThreadCard';
import ZoneCard from '@app/components/forum/ZoneCard';
import CryptoEngagementBar from '@app/components/forum/enhanced/CryptoEngagementBar';
import QuickReactions from '@app/components/forum/enhanced/QuickReactions';

export interface MagicForumBuilderProps {
	onSave?: (config: ForumLayoutConfig) => void;
	onPreview?: (config: ForumLayoutConfig) => void;
	onExport?: (config: ForumLayoutConfig) => void;
	initialConfig?: Partial<ForumLayoutConfig>;
	className?: string;
}

export interface ForumLayoutConfig {
	layout: 'grid' | 'list' | 'masonry' | 'carousel';
	columns: number;
	spacing: number;
	cardVariant: 'default' | 'compact' | 'featured';
	showEngagement: boolean;
	showReactions: boolean;
	animations: {
		enabled: boolean;
		speed: number;
		type: 'slide' | 'fade' | 'scale' | 'bounce';
	};
	theme: {
		accentColor: string;
		backgroundStyle: 'solid' | 'gradient' | 'blur';
		borderRadius: number;
		shadows: boolean;
	};
	responsive: {
		mobileColumns: number;
		tabletColumns: number;
		breakpoints: {
			mobile: number;
			tablet: number;
			desktop: number;
		};
	};
	filters: {
		enabled: boolean;
		position: 'sidebar' | 'top' | 'floating';
		sticky: boolean;
	};
}

const defaultConfig: ForumLayoutConfig = {
	layout: 'list',
	columns: 1,
	spacing: 4,
	cardVariant: 'default',
	showEngagement: true,
	showReactions: true,
	animations: {
		enabled: true,
		speed: 0.3,
		type: 'slide'
	},
	theme: {
		accentColor: '#10b981',
		backgroundStyle: 'blur',
		borderRadius: 8,
		shadows: true
	},
	responsive: {
		mobileColumns: 1,
		tabletColumns: 2,
		breakpoints: {
			mobile: 768,
			tablet: 1024,
			desktop: 1280
		}
	},
	filters: {
		enabled: true,
		position: 'sidebar',
		sticky: true
	}
};

const MagicForumBuilder = memo(
	({ onSave, onPreview, onExport, initialConfig = {}, className }: MagicForumBuilderProps) => {
		const [config, setConfig] = useState<ForumLayoutConfig>({ ...defaultConfig, ...initialConfig });
		const [isPreviewMode, setIsPreviewMode] = useState(false);
		const [activeTab, setActiveTab] = useState('layout');

		const updateConfig = useCallback((updates: Partial<ForumLayoutConfig>) => {
			setConfig((prev) => ({ ...prev, ...updates }));
		}, []);

		const updateNestedConfig = useCallback(<K extends keyof ForumLayoutConfig>(
			path: K, 
			updates: Partial<ForumLayoutConfig[K]>
		) => {
			setConfig((prev) => ({
				...prev,
				[path]: Object.assign({}, prev[path], updates)
			}));
		}, []);

		const handleSave = () => {
			onSave?.(config);
		};

		const handlePreview = () => {
			setIsPreviewMode(!isPreviewMode);
			onPreview?.(config);
		};

		const handleExport = () => {
			onExport?.(config);
		};

		const resetToDefaults = () => {
			setConfig(defaultConfig);
		};

		// Sample data for preview - typed as Thread
		const sampleThreads: Thread[] = [
			{
				id: '1' as ThreadId,
				title: 'Sample Thread: What are your thoughts on the latest DeFi protocols?',
				slug: 'sample-thread-1',
				excerpt:
					'Looking for community insights on the newest DeFi protocols and their potential...',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				viewCount: 234,
				postCount: 15,
				firstPostLikeCount: 0,
				isSticky: false,
				isLocked: false,
				isHidden: false,
				isSolved: false,
				structureId: 'struct_1' as StructureId,
				userId: '1' as UserId,
				user: {
					id: '1' as UserId,
					username: 'CryptoDegen',
					avatarUrl: '',
					role: 'user' as const,
					forumStats: {
						level: 5,
						xp: 1200,
						reputation: 850,
						totalPosts: 45,
						totalThreads: 8,
						totalLikes: 120,
						totalTips: 250
					},
					isOnline: true,
					joinedAt: new Date().toISOString(),
					isAdmin: false,
					isModerator: false,
					isVerified: false,
					isBanned: false
				},
				zone: {
					id: 'zone_1' as ZoneId,
					name: 'The Pit',
					slug: 'pit',
					colorTheme: 'pit',
					isPrimary: true,
					sortOrder: 1,
					isVisible: true,
					forums: [],
					stats: {
						totalForums: 5,
						totalThreads: 150,
						totalPosts: 2400
					}
				} as unknown as Thread['zone'],
				structure: {
					id: 'struct_1' as StructureId,
					name: 'General Discussion',
					slug: 'general',
					type: 'forum' as const
				},
				tags: [],
				permissions: {
					canEdit: false,
					canDelete: false,
					canReply: true,
					canMarkSolved: false,
					canModerate: false
				},
				engagement: {
					totalTips: 45,
					uniqueTippers: 8,
					momentum: 'bullish' as const,
					reputationScore: 890,
					bookmarks: 12,
					tipLeaderboard: [
						{ username: 'CryptoWhale', amount: 15, avatarUrl: '' },
						{ username: 'DeFiMaster', amount: 10, avatarUrl: '' }
					],
					shares: 5
				}
			},
			{
				id: '2' as ThreadId,
				title: 'Market Analysis: Bears vs Bulls in Q4',
				slug: 'sample-thread-2',
				excerpt: 'Comprehensive analysis of market trends and predictions for the final quarter...',
				createdAt: new Date(Date.now() - 86400000).toISOString(),
				updatedAt: new Date(Date.now() - 86400000).toISOString(),
				viewCount: 567,
				postCount: 32,
				firstPostLikeCount: 0,
				isSticky: false,
				isLocked: false,
				isHidden: false,
				isSolved: false,
				structureId: 'struct_2' as StructureId,
				userId: '2' as UserId,
				user: {
					id: '2' as UserId,
					username: 'MarketWizard',
					avatarUrl: '',
					role: 'user' as const,
					forumStats: {
						level: 8,
						xp: 2100,
						reputation: 1250,
						totalPosts: 89,
						totalThreads: 15,
						totalLikes: 250,
						totalTips: 780
					},
					isOnline: false,
					joinedAt: new Date().toISOString(),
					isAdmin: false,
					isModerator: false,
					isVerified: true,
					isBanned: false
				},
				zone: {
					id: 'zone_2' as ZoneId,
					name: 'Mission Control',
					slug: 'mission',
					colorTheme: 'mission',
					isPrimary: true,
					sortOrder: 2,
					isVisible: true,
					forums: [],
					stats: {
						totalForums: 3,
						totalThreads: 89,
						totalPosts: 1450
					}
				} as unknown as Thread['zone'],
				structure: {
					id: 'struct_2' as StructureId,
					name: 'Market Analysis',
					slug: 'analysis',
					type: 'forum' as const
				},
				tags: [],
				permissions: {
					canEdit: false,
					canDelete: false,
					canReply: true,
					canMarkSolved: false,
					canModerate: false
				},
				engagement: {
					totalTips: 78,
					uniqueTippers: 15,
					momentum: 'neutral' as const,
					reputationScore: 1100,
					bookmarks: 28,
					tipLeaderboard: [
						{ username: 'TraderPro', amount: 25, avatarUrl: '' },
						{ username: 'BullRunner', amount: 20, avatarUrl: '' },
						{ username: 'MarketSage', amount: 15, avatarUrl: '' }
					],
					shares: 12
				}
			}
		];

		const sampleReactions = [
			{
				id: '1',
				type: 'diamond_hands' as const,
				emoji: '💎',
				label: 'Diamond Hands',
				count: 24,
				hasReacted: true,
				color: 'text-cyan-400',
				bgColor: 'bg-cyan-900/20',
				borderColor: 'border-cyan-500/30'
			},
			{
				id: '2',
				type: 'bullish' as const,
				emoji: '📈',
				label: 'Bullish',
				count: 18,
				hasReacted: false,
				color: 'text-green-400',
				bgColor: 'bg-green-900/20',
				borderColor: 'border-green-500/30'
			}
		];

		const layoutIcons = {
			grid: Grid3X3,
			list: List,
			masonry: Columns,
			carousel: MonitorSpeaker
		};

		return (
			<div className={cn('h-full flex flex-col bg-zinc-950', className)}>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-zinc-800/50 bg-zinc-900/50">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
							<Wand2 className="w-4 h-4 text-white" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-white">Magic Forum Builder</h2>
							<p className="text-xs text-zinc-400">Design your perfect forum layout</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={resetToDefaults}
							className="text-zinc-400 hover:text-white"
						>
							<RotateCcw className="w-4 h-4 mr-2" />
							Reset
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={handlePreview}
							className={cn(
								isPreviewMode
									? 'text-emerald-400 bg-emerald-900/20'
									: 'text-zinc-400 hover:text-white'
							)}
						>
							<Eye className="w-4 h-4 mr-2" />
							Preview
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleExport}
							className="text-zinc-400 hover:text-white"
						>
							<Download className="w-4 h-4 mr-2" />
							Export
						</Button>
						<Button size="sm" onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
							<Save className="w-4 h-4 mr-2" />
							Save
						</Button>
					</div>
				</div>

				<div className="flex-1 flex overflow-hidden">
					{/* Controls Panel */}
					{!isPreviewMode && (
						<motion.div
							initial={{ width: 0 }}
							animate={{ width: 400 }}
							exit={{ width: 0 }}
							className="w-96 border-r border-zinc-800/50 bg-zinc-900/30 overflow-y-auto"
						>
							<Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
								<TabsList className="grid w-full grid-cols-4 bg-zinc-800/50">
									<TabsTrigger value="layout" className="text-xs">
										Layout
									</TabsTrigger>
									<TabsTrigger value="style" className="text-xs">
										Style
									</TabsTrigger>
									<TabsTrigger value="features" className="text-xs">
										Features
									</TabsTrigger>
									<TabsTrigger value="responsive" className="text-xs">
										Mobile
									</TabsTrigger>
								</TabsList>

								<TabsContent value="layout" className="space-y-4 mt-6">
									<Card className="bg-zinc-800/30 border-zinc-700/50">
										<CardHeader className="pb-3">
											<CardTitle className="text-sm text-white flex items-center gap-2">
												<Layout className="w-4 h-4" />
												Layout Structure
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4">
											<div>
												<Label className="text-xs text-zinc-300">Layout Type</Label>
												<div className="grid grid-cols-2 gap-2 mt-2">
													{Object.entries(layoutIcons).map(([layoutType, Icon]) => (
														<Button
															key={layoutType}
															variant={config.layout === layoutType ? 'default' : 'ghost'}
															size="sm"
															className="h-16 flex flex-col gap-1"
															onClick={() => updateConfig({ layout: layoutType as ForumLayoutConfig['layout'] })}
														>
															<Icon className="w-4 h-4" />
															<span className="text-xs capitalize">{layoutType}</span>
														</Button>
													))}
												</div>
											</div>

											{config.layout === 'grid' && (
												<div>
													<Label className="text-xs text-zinc-300">Columns: {config.columns}</Label>
													<Slider
														value={[config.columns]}
														onValueChange={([value]) => updateConfig({ columns: value })}
														max={6}
														min={1}
														step={1}
														className="mt-2"
													/>
												</div>
											)}

											<div>
												<Label className="text-xs text-zinc-300">Spacing: {config.spacing}</Label>
												<Slider
													value={[config.spacing]}
													onValueChange={([value]) => updateConfig({ spacing: value })}
													max={8}
													min={1}
													step={1}
													className="mt-2"
												/>
											</div>

											<div>
												<Label className="text-xs text-zinc-300">Card Variant</Label>
												<Select
													value={config.cardVariant}
													onValueChange={(value) => updateConfig({ cardVariant: value as ForumLayoutConfig['cardVariant'] })}
												>
													<SelectTrigger className="mt-2 bg-zinc-800/50 border-zinc-700/50">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="default">Default</SelectItem>
														<SelectItem value="compact">Compact</SelectItem>
														<SelectItem value="featured">Featured</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</CardContent>
									</Card>
								</TabsContent>

								<TabsContent value="style" className="space-y-4 mt-6">
									<Card className="bg-zinc-800/30 border-zinc-700/50">
										<CardHeader className="pb-3">
											<CardTitle className="text-sm text-white flex items-center gap-2">
												<Palette className="w-4 h-4" />
												Visual Styling
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4">
											<div>
												<Label className="text-xs text-zinc-300">Accent Color</Label>
												<Input
													type="color"
													value={config.theme.accentColor}
													onChange={(e) =>
														updateNestedConfig('theme', { accentColor: e.target.value })
													}
													className="mt-2 h-10 bg-zinc-800/50 border-zinc-700/50"
												/>
											</div>

											<div>
												<Label className="text-xs text-zinc-300">Background Style</Label>
												<Select
													value={config.theme.backgroundStyle}
													onValueChange={(value) =>
														updateNestedConfig('theme', { backgroundStyle: value as 'solid' | 'gradient' | 'blur' })
													}
												>
													<SelectTrigger className="mt-2 bg-zinc-800/50 border-zinc-700/50">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="solid">Solid</SelectItem>
														<SelectItem value="gradient">Gradient</SelectItem>
														<SelectItem value="blur">Blur</SelectItem>
													</SelectContent>
												</Select>
											</div>

											<div>
												<Label className="text-xs text-zinc-300">
													Border Radius: {config.theme.borderRadius}px
												</Label>
												<Slider
													value={[config.theme.borderRadius]}
													onValueChange={([value]) =>
														updateNestedConfig('theme', { borderRadius: value })
													}
													max={24}
													min={0}
													step={2}
													className="mt-2"
												/>
											</div>
										</CardContent>
									</Card>
								</TabsContent>

								<TabsContent value="features" className="space-y-4 mt-6">
									<Card className="bg-zinc-800/30 border-zinc-700/50">
										<CardHeader className="pb-3">
											<CardTitle className="text-sm text-white flex items-center gap-2">
												<Sparkles className="w-4 h-4" />
												Interactive Features
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="flex items-center justify-between">
												<Label className="text-xs text-zinc-300">Show Engagement</Label>
												<Button
													variant={config.showEngagement ? 'default' : 'ghost'}
													size="sm"
													onClick={() => updateConfig({ showEngagement: !config.showEngagement })}
												>
													{config.showEngagement ? 'On' : 'Off'}
												</Button>
											</div>

											<div className="flex items-center justify-between">
												<Label className="text-xs text-zinc-300">Show Reactions</Label>
												<Button
													variant={config.showReactions ? 'default' : 'ghost'}
													size="sm"
													onClick={() => updateConfig({ showReactions: !config.showReactions })}
												>
													{config.showReactions ? 'On' : 'Off'}
												</Button>
											</div>

											<div className="flex items-center justify-between">
												<Label className="text-xs text-zinc-300">Animations</Label>
												<Button
													variant={config.animations.enabled ? 'default' : 'ghost'}
													size="sm"
													onClick={() =>
														updateNestedConfig('animations', {
															enabled: !config.animations.enabled
														})
													}
												>
													{config.animations.enabled ? 'On' : 'Off'}
												</Button>
											</div>

											{config.animations.enabled && (
												<>
													<div>
														<Label className="text-xs text-zinc-300">
															Animation Speed: {config.animations.speed}s
														</Label>
														<Slider
															value={[config.animations.speed]}
															onValueChange={([value]) =>
																updateNestedConfig('animations', { speed: value })
															}
															max={1}
															min={0.1}
															step={0.1}
															className="mt-2"
														/>
													</div>

													<div>
														<Label className="text-xs text-zinc-300">Animation Type</Label>
														<Select
															value={config.animations.type}
															onValueChange={(value) =>
																updateNestedConfig('animations', { type: value as 'slide' | 'fade' | 'scale' | 'bounce' })
															}
														>
															<SelectTrigger className="mt-2 bg-zinc-800/50 border-zinc-700/50">
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="slide">Slide</SelectItem>
																<SelectItem value="fade">Fade</SelectItem>
																<SelectItem value="scale">Scale</SelectItem>
																<SelectItem value="bounce">Bounce</SelectItem>
															</SelectContent>
														</Select>
													</div>
												</>
											)}
										</CardContent>
									</Card>
								</TabsContent>

								<TabsContent value="responsive" className="space-y-4 mt-6">
									<Card className="bg-zinc-800/30 border-zinc-700/50">
										<CardHeader className="pb-3">
											<CardTitle className="text-sm text-white flex items-center gap-2">
												<MonitorSpeaker className="w-4 h-4" />
												Responsive Design
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4">
											<div>
												<Label className="text-xs text-zinc-300">
													Mobile Columns: {config.responsive.mobileColumns}
												</Label>
												<Slider
													value={[config.responsive.mobileColumns]}
													onValueChange={([value]) =>
														updateNestedConfig('responsive', { mobileColumns: value })
													}
													max={3}
													min={1}
													step={1}
													className="mt-2"
												/>
											</div>

											<div>
												<Label className="text-xs text-zinc-300">
													Tablet Columns: {config.responsive.tabletColumns}
												</Label>
												<Slider
													value={[config.responsive.tabletColumns]}
													onValueChange={([value]) =>
														updateNestedConfig('responsive', { tabletColumns: value })
													}
													max={4}
													min={1}
													step={1}
													className="mt-2"
												/>
											</div>
										</CardContent>
									</Card>
								</TabsContent>
							</Tabs>
						</motion.div>
					)}

					{/* Preview Area */}
					<div className="flex-1 bg-zinc-950 overflow-auto">
						<div className="p-6">
							<div className="mb-6 flex items-center justify-between">
								<div>
									<h3 className="text-xl font-semibold text-white mb-2">Preview</h3>
									<div className="flex items-center gap-2 text-sm text-zinc-400">
										<Badge variant="outline" className="text-xs">
											{config.layout}
										</Badge>
										<Badge variant="outline" className="text-xs">
											{config.cardVariant}
										</Badge>
										{config.animations.enabled && (
											<Badge variant="outline" className="text-xs">
												Animated
											</Badge>
										)}
									</div>
								</div>
							</div>

							<motion.div
								key={`${config.layout}-${config.columns}-${config.spacing}`}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: config.animations.speed }}
								className={cn(
									'transition-all duration-300',
									config.layout === 'grid' && `grid gap-${config.spacing}`,
									config.layout === 'grid' && config.columns === 1 && 'grid-cols-1',
									config.layout === 'grid' && config.columns === 2 && 'grid-cols-1 md:grid-cols-2',
									config.layout === 'grid' &&
										config.columns === 3 &&
										'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
									config.layout === 'list' && `space-y-${config.spacing}`,
									config.layout === 'masonry' &&
										`columns-1 md:columns-2 lg:columns-${config.columns} gap-${config.spacing}`
								)}
							>
								{sampleThreads.map((thread, index) => (
									<motion.div
										key={thread.id}
										initial={config.animations.enabled ? { opacity: 0, y: 20 } : {}}
										animate={config.animations.enabled ? { opacity: 1, y: 0 } : {}}
										transition={
											config.animations.enabled
												? {
														delay: index * 0.1,
														duration: config.animations.speed,
														type: config.animations.type === 'bounce' ? 'spring' : 'tween'
													}
												: {}
										}
										className="space-y-3"
									>
										<ThreadCard
											thread={thread}
											variant={config.cardVariant}
											onTip={(id, amount) => {
												/* TODO: Implement tip functionality */
											}}
											onBookmark={(id) => {
												/* TODO: Implement bookmark functionality */
											}}
											className={cn(
												config.theme.shadows && 'shadow-lg',
												`rounded-[${config.theme.borderRadius}px]`
											)}
										/>

										{config.showEngagement && thread.engagement && (
											<CryptoEngagementBar
												engagement={thread.engagement}
												onTip={(amount) => {
													/* TODO: Implement tip functionality */
												}}
												onBookmark={() => {
													/* TODO: Implement bookmark functionality */
												}}
											/>
										)}

										{config.showReactions && (
											<QuickReactions
												reactions={sampleReactions}
												onReact={(type) => {}}
												compact={config.cardVariant === 'compact'}
											/>
										)}
									</motion.div>
								))}
							</motion.div>
						</div>
					</div>
				</div>
			</div>
		);
	}
);

MagicForumBuilder.displayName = 'MagicForumBuilder';

export default MagicForumBuilder;
