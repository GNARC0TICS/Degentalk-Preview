import React from 'react';
import { PlaygroundSection } from '@/pages/dev';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { userTitles } from '../demo-data';
import { frameRarityConfig } from '@/config/frames.config';

export const AvatarBadgesSection: React.FC = () => (
	<PlaygroundSection id="avatars" title="Avatar Frames & User Titles">
		{/* Avatar Frames */}
		<h3 className="text-xl font-bold mb-4">Avatar Frames</h3>
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
			{Object.entries(frameRarityConfig).map(([rarity, cfg]) => (
				<div key={rarity} className="text-center space-y-3">
					<div className="relative inline-block">
						<div
							className={`w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center ${cfg.borderClass ?? ''} ${cfg.glowClass ?? ''} ${cfg.backgroundClass ? 'p-[2px]' : ''}`}
						>
							{cfg.backgroundClass ? (
								<div className="w-full h-full rounded-full bg-black flex items-center justify-center">
									<Users className="h-8 w-8 text-white" />
								</div>
							) : (
								<Users className="h-8 w-8 text-white" />
							)}
						</div>
					</div>
					<p className="text-sm font-medium capitalize">{rarity}</p>
				</div>
			))}
		</div>

		{/* User Titles */}
		<h3 className="text-xl font-bold mb-4">User Titles</h3>
		<div className="flex flex-wrap gap-4">
			{userTitles.map((title) => {
				const cfg = frameRarityConfig[title.rarity as keyof typeof frameRarityConfig];
				const borderClass = cfg?.glowClass?.replace('ring-2', 'border');
				return (
					<Badge
						key={title.title}
						variant="outline"
						className={`py-2 px-4 text-sm ${borderClass} ${cfg?.glowClass ?? ''}`}
					>
						{title.title}
					</Badge>
				);
			})}
		</div>
	</PlaygroundSection>
);

export default AvatarBadgesSection;
