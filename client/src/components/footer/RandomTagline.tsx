import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
	'Turning FOMO into an art form.'
];

interface RandomTaglineProps {
	className?: string;
}

export function RandomTagline({ className }: RandomTaglineProps) {
	const [tagline, setTagline] = useState(funnyTaglines[0]);
	const [isGlitching, setIsGlitching] = useState(false);

	const handleTaglineHover = () => {
		setIsGlitching(true);
		setTimeout(() => {
			const newTagline = funnyTaglines[Math.floor(Math.random() * funnyTaglines.length)];
			setTagline(newTagline);
			setIsGlitching(false);
		}, 300);
	};

	return (
		<motion.div
			className={`italic cursor-pointer select-none ${className}`}
			onHoverStart={handleTaglineHover}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 0.8 }}
		>
			<AnimatePresence mode="wait">
				<motion.p
					key={tagline}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					className={`${isGlitching ? 'animate-glitch' : ''} hover:text-emerald-400 transition-colors text-center md:text-right`}
				>
					{tagline}
				</motion.p>
			</AnimatePresence>
		</motion.div>
	);
}
