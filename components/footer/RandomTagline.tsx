'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHydrated } from '@/lib/use-hydrated';

const funnyTaglines = [
	"This is not financial advice. But if it works, you're welcome.",
	'Degentalk is powered by caffeine, cope, and completely unlicensed opinions.',
	"We are not financial advisors. We just yell louder when we're right.",
	'Not financial advice. Consult your local psychic for better accuracy.',
	'Any gains you make are pure coincidence. Any losses are definitely your fault.',
	"This isn't financial advice. It's just aggressive optimism with a side of chaos.",
	'If this feels like good advice, please reconsider everything.',
	'Everything here is entirely theoretical. Especially your profits.',
	"Don't sue us. Sue the market.",
	'Side effects of listening to Degentalk may include delusion, euphoria, or margin calls.',
	'DYOR. Then ignore it and ape anyway.',
	'This is not financial advice, seriously.',
	'Shoutout to the guy who lost his paycheck today.',
	'Up only... in spirit.',
	'Post your wins. Hide your losses.',
	'No charts. Just vibes.',
	"Rugged? Good. Now you're one of us.",
	'Built different. Just not financially stable.',
	"Degens don't cry—we redeposit.",
	'Who needs therapy when you have leverage?',
	'Your portfolio is our entertainment.',
	'Welcome to group therapy with bonus rounds.',
	'0xFaith, 100x Cope.',
	'Lose fast, post faster.',
	"If this site loads, you haven't been liquidated yet.",
	'Do NOT try this at home. Try it on-chain.',
	'Warning: May cause spontaneous aping into shitcoins.',
	'Results not typical. Actually, results not even probable.',
	'Professional bag holders since 2024.',
	'Turning FOMO into an art form.',
	'One rug away from greatness.',
	'Not all moonshots hit. Some just orbit longer.'
];

interface RandomTaglineProps {
	className?: string;
}

// Get a deterministic "random" index based on the current minute
function getDeterministicIndex() {
	const now = new Date();
	const seed = now.getMinutes() + now.getHours();
	return seed % funnyTaglines.length;
}

export function RandomTagline({ className }: RandomTaglineProps) {
	const hydrated = useHydrated();
	const [currentIndex, setCurrentIndex] = useState(getDeterministicIndex());
	const [isGlitching, setIsGlitching] = useState(false);
	
	// Use deterministic tagline until hydrated, then allow randomization
	const tagline = funnyTaglines[currentIndex];

	const handleTaglineHover = useCallback(() => {
		if (!hydrated) return; // Don't change taglines until hydrated
		
		setIsGlitching(true);
		setTimeout(() => {
			const newIndex = Math.floor(Math.random() * funnyTaglines.length);
			setCurrentIndex(newIndex);
			setIsGlitching(false);
		}, 300);
	}, [hydrated]);

	return (
		<motion.div
			className={`italic cursor-pointer select-none min-h-[1rem] ${className}`}
			onHoverStart={handleTaglineHover}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.8 }}
		>
			<AnimatePresence mode="wait">
				<motion.p
					key={tagline}
					initial={hydrated ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					className={`text-xs hover:text-emerald-400 transition-colors text-center md:text-right`}
				>
					{tagline}
				</motion.p>
			</AnimatePresence>
		</motion.div>
	);
}
