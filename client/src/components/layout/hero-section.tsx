import React, { useState, useEffect, lazy } from 'react';
import { Link } from 'wouter';
import { Users, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { motion, AnimatePresence } from 'framer-motion';
import { uiConfig } from '@/config/ui.config';
import type { HeroQuote } from '@/config/ui.config';

const ActiveMembersWidgetLazy = lazy(() => import('@/components/users/ActiveMembersWidget'));

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
	const arr = [...array];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

export function HeroSection() {
	const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
	const [shuffledQuotes, setShuffledQuotes] = useState<HeroQuote[]>(() =>
		shuffleArray(uiConfig.heroQuotes)
	);

	useEffect(() => {
		// Shuffle once per mount/session
		setShuffledQuotes(shuffleArray(uiConfig.heroQuotes));
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentQuoteIndex((prev) => (prev + 1) % shuffledQuotes.length);
		}, 30000);
		return () => clearInterval(interval);
	}, [shuffledQuotes.length]);

	const currentQuote: HeroQuote = shuffledQuotes[currentQuoteIndex];

	return (
		<section
			className="relative overflow-hidden bg-gradient-to-br from-cod-gray-950 via-cod-gray-900 to-black"
			suppressHydrationWarning
		>
			{/* Animated gradient background */}
			<div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-purple-500/5 to-cyan-500/5 animate-gradient-shift" />

			{/* Background image with enhanced overlay */}
			<div
				className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
				style={{
					backgroundImage: 'url("/images/19FA32BC-BF64-4CE2-990E-BDB147C2A159.png")'
				}}
			/>

			{/* Animated mesh gradient overlay */}
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0em0wLTZoLTJWNmgydjR6bTAgMzBoLTJ2LTRoMnY0em0wLTZoLTJ2LTRoMnY0ek0zMCAzNGgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6bTAtNmgtMlY2aDJ2NHptMCAzMGgtMnYtNGgydjR6bTAtNmgtMnYtNGgydjR6TTI0IDM0aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHptMC02aC0yVjZoMnY0em0wIDMwaC0ydi00aDJ2NHptMC02aC0ydi00aDJ2NHoiIC8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
			</div>

			{/* Subtle background effects only */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
				<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
			</div>

			<div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
				<motion.div
					className="max-w-3xl mx-auto text-center"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					{/* Animated headline */}
					<div className="h-[120px] md:h-[140px] lg:h-[168px] flex items-center justify-center mb-4">
						<AnimatePresence mode="wait">
							<motion.h1
								key={currentQuoteIndex}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.5 }}
								className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center"
								style={{
									textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.1)'
								}}
							>
								{currentQuote.headline}
							</motion.h1>
						</AnimatePresence>
					</div>

					{/* Animated subheader */}
					<AnimatePresence mode="wait">
						<motion.p
							key={`subheader-${currentQuoteIndex}`}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="text-lg md:text-xl text-white mb-8 md:mb-10 flex items-center gap-2 justify-center font-semibold"
							style={{ textShadow: '0 0 8px rgba(255,255,255,0.1)' }}
						>
							{currentQuote.subheader}
						</motion.p>
					</AnimatePresence>

					<motion.div
						className="flex flex-wrap gap-4 justify-center"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6, duration: 0.8 }}
					>
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button
								size="lg"
								className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
								onClick={() => (window.location.href = '/auth?mode=signup')}
							>
								<Users className="w-5 h-5 mr-2" />
								Join Community
							</Button>
						</motion.div>
					</motion.div>

					<motion.div
						className="mt-8 md:mt-12 flex justify-center"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.9, duration: 0.8 }}
					>
						<Link href="/forums">
							<motion.div
								className="flex items-center text-emerald-400 hover:text-emerald-300 transition-colors text-sm group"
								whileHover={{ x: 5 }}
							>
								<span>Browse our topics</span>
								<ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
							</motion.div>
						</Link>
					</motion.div>
				</motion.div>

				{/* Active Members Widget (desktop only) */}
				<div className="hidden lg:block mt-10">
					<React.Suspense fallback={null}>
						<ActiveMembersWidgetLazy limit={10} />
					</React.Suspense>
				</div>
			</div>
		</section>
	);
}
