import React from 'react';
import XPBarTrack from './XPBarTrack.tsx';
import { xpTracks } from './tracks.ts';
// import LevelUpModal from './LevelUpModal.tsx'; // Stub for future

export type UserXP = {
	[trackId: string]: number;
};

export type XPBarsContainerProps = {
	userXP: UserXP;
};

const XPBarsContainer: React.FC<XPBarsContainerProps> = ({ userXP }) => {
	return (
		<div className="xp-bars-container flex flex-col gap-4 w-full max-w-xl mx-auto">
			{xpTracks.map((track) => (
				<XPBarTrack key={track.id} track={track} xp={userXP[track.id] || 0} />
			))}
			{/* <LevelUpOverlay /> */}
		</div>
	);
};

export default XPBarsContainer;
