import React from 'react';
import { xpConfig, XPConfig } from './xpConfig';
import XPBarTrack from './XPBarTrack';
// import LevelUpModal from './LevelUpModal'; // Stub for future

export type UserXP = {
	[trackId: string]: number;
};

export type XPBarsContainerProps = {
	userXP: UserXP;
	onLevelUp?: (trackId: string, newLevel: number) => void;
};

const XPBarsContainer: React.FC<XPBarsContainerProps> = ({ userXP, onLevelUp }) => {
	return (
		<div className="xp-bars-container flex flex-col gap-4 w-full max-w-xl mx-auto">
			{xpConfig.tracks.map((track) => (
				<XPBarTrack key={track.id} track={track} xp={userXP[track.id] || 0} onLevelUp={onLevelUp} />
			))}
			{/* <LevelUpOverlay /> */}
		</div>
	);
};

export default XPBarsContainer;
