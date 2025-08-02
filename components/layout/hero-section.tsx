'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uiConfig } from '@/config/ui.config';
import type { HeroQuote } from '@/config/ui.config';
import { HeroCTAButton } from './HeroCTAButton';
import { BrowseTopicsLink } from './BrowseTopicsLink';

// Fisher-Yates shuffle
function shuffleArray<T>(array: readonly T[]): T[] {
	const arr = [...array];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		// Ensure both values exist before swapping
		const temp = arr[i];
		if (temp !== undefined && arr[j] !== undefined) {
			arr[i] = arr[j];
			arr[j] = temp;
		}
	}
	return arr;
}

export function HeroSection() {
	const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
	const [shuffledQuotes, setShuffledQuotes] = useState<HeroQuote[]>([]);
	const [isMounted, setIsMounted] = useState(false);

	// Use first quote until mounted to avoid hydration mismatch
	useEffect(() => {
		setIsMounted(true);
		// Shuffle quotes only on client side after mount
		setShuffledQuotes(shuffleArray([...uiConfig.heroQuotes]));
	}, []);

	useEffect(() => {
		// Only start rotation after mounted and quotes are shuffled
		if (!isMounted || shuffledQuotes.length === 0) return;
		
		const interval = setInterval(() => {
			setCurrentQuoteIndex((prev) => (prev + 1) % shuffledQuotes.length);
		}, 30000);
		return () => clearInterval(interval);
	}, [shuffledQuotes.length, isMounted]);

	// Use the first quote from config during SSR, shuffled quotes after mount
	const currentQuote: HeroQuote | undefined = isMounted && shuffledQuotes.length > 0
		? shuffledQuotes[currentQuoteIndex]
		: uiConfig.heroQuotes[0];
	
	// Don't render if no quote available
	if (!currentQuote) {
		return null;
	}

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

			<div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10" style={{ isolation: 'isolate' }}>
				<motion.div
					className="max-w-3xl mx-auto text-center"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					{/* Animated headline */}
					<div className="h-[120px] md:h-[140px] lg:h-[168px] flex items-center justify-center mb-8 relative z-30">
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
							className="text-lg md:text-xl text-white mb-14 md:mb-20 flex items-center gap-2 justify-center font-semibold relative z-30"
							style={{ textShadow: '0 0 8px rgba(255,255,255,0.1)' }}
						>
							{currentQuote.subheader}
						</motion.p>
					</AnimatePresence>

					{/* CTA Button - proper z-index for production */}
					<motion.div
						className="flex flex-wrap gap-4 justify-center relative z-20"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6, duration: 0.8 }}
					>
						<HeroCTAButton onClick={() => {
							const newsletterSection = document.getElementById('newsletter-signup');
							if (newsletterSection) {
								newsletterSection.scrollIntoView({ behavior: 'smooth' });
							}
						}} />
					</motion.div>

					{/* Browse Topics Link */}
					<motion.div
						className="mt-10 md:mt-12 flex justify-center relative z-20"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.9, duration: 0.8 }}
					>
						<BrowseTopicsLink variant="shimmer" />
					</motion.div>
				</motion.div>

				{/* The Active Members Widget has been moved to the sidebar via the widget system */}
			</div>
		</section>
	);
}
