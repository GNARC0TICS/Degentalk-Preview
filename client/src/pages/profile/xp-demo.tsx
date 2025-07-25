import React, { useState } from 'react';
import XPBarsContainer from '../../components/xp/XPBarsContainer';

// Mock initial XP for demo
const initialXP = {
	degen: 420,
	reputation: 1337
};

const XPDemoPage: React.FC = () => {
	const [userXP, setUserXP] = useState(initialXP);

	// Simulate XP gain for demo
	const addXP = (track: 'degen' | 'reputation', amount: number) => {
		setUserXP((prev) => ({ ...prev, [track]: prev[track] + amount }));
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 flex flex-col items-center justify-center p-6">
			<h1 className="text-3xl font-extrabold text-white mb-8 drop-shadow-lg">
				XP & Reputation Bar Demo
			</h1>
			<XPBarsContainer userXP={userXP} />
			<div className="flex gap-4 mt-8">
				<button
					className="px-4 py-2 rounded-lg bg-purple-600 text-white font-bold shadow hover:bg-purple-700 transition"
					onClick={() => addXP('degen', 100)}
				>
					+100 Degen XP
				</button>
				<button
					className="px-4 py-2 rounded-lg bg-orange-500 text-white font-bold shadow hover:bg-orange-600 transition"
					onClick={() => addXP('reputation', 50)}
				>
					+50 Reputation
				</button>
			</div>
			{/*
        Integration notes:
        - Replace mock userXP with real user data from API or context
        - Use onLevelUp prop for level-up events/animations
      */}
		</div>
	);
};

export default XPDemoPage;
