import React from 'react';
import { motion } from 'framer-motion';
import { LiveStats } from './LiveStats';
import { FooterBrand } from './FooterBrand';
import { FooterSection } from './FooterSection';
import { RandomTagline } from './RandomTagline';
import { footerNavigation } from '@/config/footer-navigation';

export function SiteFooter() {
	return (
		<footer className="bg-gradient-to-b from-zinc-900/50 to-zinc-950 border-t border-zinc-800 py-8 mt-auto">
			{/* Animated gradient border */}
			<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 animate-gradient-shift" />

			<div className="px-4 max-w-7xl mx-auto">
				{/* Live Stats Section - Enhanced Easter Egg */}
				<LiveStats />

				{/* Main Footer Content Grid */}
				<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 mb-6 lg:mb-8">
					{/* Brand Section - Full width on mobile, spans across on larger screens */}
					<FooterBrand className="col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-1" />

					{/* Navigation Sections */}
					{footerNavigation.map((section, index) => (
						<FooterSection
							key={section.title}
							title={section.title}
							links={section.links}
							animationDelay={section.animationDelay}
						/>
					))}
				</div>

				{/* Bottom Section */}
				<div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
					<motion.div
						className="order-2 md:order-1"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6 }}
					>
						&copy; {new Date().getFullYear()} Degentalk. All rights reserved.
					</motion.div>

					{/* Random Tagline Easter Egg */}
					<RandomTagline className="order-1 md:order-2 md:max-w-md" />
				</div>
			</div>
		</footer>
	);
}
