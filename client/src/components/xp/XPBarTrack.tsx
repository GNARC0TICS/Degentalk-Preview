import React from 'react';
import { getProgressWithinLevel } from '@/shared/economy/reward-calculator';
import type { XPTrack } from './tracks';

export type XPBarTrackProps = {
	track: XPTrack;
	xp: number;
};

const XPBarTrack: React.FC<XPBarTrackProps> = ({ track, xp }) => {
	const { level, progress, nextLevelXp } = getProgressWithinLevel(xp);

	return (
		<div
			className="xp-bar-track flex flex-col gap-1 p-4 rounded-xl shadow-lg bg-opacity-60 backdrop-blur-md"
			style={{ background: 'rgba(30, 30, 40, 0.7)' }}
			aria-label={`${track.label} Progress Bar`}
			role="progressbar"
			aria-valuenow={xp}
			aria-valuemin={track.minXP}
			aria-valuemax={track.maxXP}
			tabIndex={0}
		>
			<div className="flex items-center justify-between mb-1">
				<span className="font-bold text-lg text-white drop-shadow">{track.label}</span>
				<span className="text-sm text-gray-300">Level {level}</span>
			</div>
			<div
				className="relative h-6 w-full rounded-full overflow-hidden"
				style={{ background: '#222' }}
			>
				<div
					className="absolute inset-0"
					style={{
						background: track.gradient,
						opacity: 0.25,
						zIndex: 0
					}}
				/>
				<div
					className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
					style={{
						width: `${progress * 100}%`,
						background: track.gradient,
						zIndex: 1
					}}
				/>
				<div className="relative z-10 flex items-center h-full px-3">
					<span className="text-xs text-white font-mono">
						{xp} / {nextLevelXp} XP to next level
					</span>
				</div>
			</div>
		</div>
	);
};

export default XPBarTrack;
