import React, { useState } from 'react';
import { LeaderboardWidget } from '@/components/leaderboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import BackToHomeButton from '@/components/common/BackToHomeButton';

export default function LeaderboardPage() {
	const [activeTab, setActiveTab] = useState<'xp' | 'reputation' | 'tips' | 'activity'>('xp');
	const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('all-time');

	// Animation variants
	const sectionVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: (delay = 0) => ({
			opacity: 1,
			y: 0,
			transition: { duration: 0.5, delay }
		})
	};

	return (
		<div className="max-w-6xl mx-auto px-4 py-8 min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
			<BackToHomeButton />
			<motion.h1
				className="text-3xl font-bold mb-8 text-center text-white"
				variants={sectionVariants}
				initial="hidden"
				animate="visible"
				custom={0}
			>
				Degentalk Leaderboards
			</motion.h1>

			<motion.div
				variants={sectionVariants}
				initial="hidden"
				animate="visible"
				custom={0.1}
			>
				<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
					<TabsList className="grid grid-cols-4 w-full max-w-md mx-auto mb-8">
						<TabsTrigger value="xp">XP</TabsTrigger>
						<TabsTrigger value="reputation">Reputation</TabsTrigger>
						<TabsTrigger value="tips">Tips</TabsTrigger>
						<TabsTrigger value="activity">Activity</TabsTrigger>
					</TabsList>

					<TabsContent value={activeTab}>
						<LeaderboardWidget
							variant="expanded"
							timeframe={timeframe}
							metric={activeTab}
							showViewAll={false}
							animated={true}
							title={`Top Degens by ${activeTab.toUpperCase()}`}
						/>
					</TabsContent>
				</Tabs>
			</motion.div>
		</div>
	);
}
