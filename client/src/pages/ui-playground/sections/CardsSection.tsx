import React from 'react';
import { PlaygroundSection } from '@/pages/dev';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export const CardsSection: React.FC = () => (
	<PlaygroundSection id="cards" title="Cards">
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{/* Stat card */}
			<Card className="bg-zinc-900/60 border-zinc-800">
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<TrendingUp className="h-5 w-5 text-emerald-500" />
						Stat Card
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold text-emerald-400">+42.69%</div>
					<p className="text-zinc-400 text-sm mt-1">Portfolio gains this week</p>
				</CardContent>
			</Card>

			{/* Loading skeleton card */}
			<Card className="bg-zinc-900/60 border-zinc-800">
				<CardHeader>
					<CardTitle className="text-lg">Loading State</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<Skeleton className="h-4 w-full bg-zinc-800" />
					<Skeleton className="h-4 w-3/4 bg-zinc-800" />
					<Skeleton className="h-8 w-1/2 bg-zinc-800" />
				</CardContent>
			</Card>

			{/* Badge demonstration */}
			<Card className="bg-zinc-900/60 border-zinc-800">
				<CardHeader>
					<CardTitle className="text-lg">Badges</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-3">
						<Badge className="gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-black">
							Gold
						</Badge>
						<Badge className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
							Epic
						</Badge>
						<Badge className="gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black">
							Rare
						</Badge>
					</div>
				</CardContent>
			</Card>
		</div>
	</PlaygroundSection>
);

export default CardsSection;
