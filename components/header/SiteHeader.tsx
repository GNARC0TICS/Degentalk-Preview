'use client';

import React from 'react';
import { HeaderThemeWrapper } from './HeaderThemeWrapper';
import { Logo } from './Logo';
import { PrimaryNav } from './PrimaryNav';
import { SearchBox } from './SearchBox';
import { LandingSearchBox } from './LandingSearchBox';
import { MobileNavSimple } from './MobileNavSimple';
import { trackCTAClick } from '@/lib/analytics';

export function SiteHeader() {
	return (
		<HeaderThemeWrapper>
			<div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Left Section: Logo + Navigation */}
					<div className="flex items-center space-x-3 lg:space-x-4">
						<Logo />
						<PrimaryNav />
					</div>

					{/* Search Box - Center with better responsive sizing */}
					<div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm xl:max-w-md mx-4">
						<LandingSearchBox />
					</div>

					{/* FAQ and Contact Us Buttons for Desktop */}
					<div className="hidden md:flex items-center space-x-3">
						<button 
							onClick={() => {
								trackCTAClick('faq_header', 'header');
								const faqSection = document.getElementById('faq');
								if (faqSection) {
									faqSection.scrollIntoView({ behavior: 'smooth' });
								} else {
									// If not on home page, navigate to home and then scroll
									window.location.href = '/#faq';
								}
							}}
							className="
								px-4 py-2 
								text-sm font-medium 
								text-zinc-300 
								hover:text-white hover:bg-zinc-800/50
								transition-colors duration-200
								rounded-md
								focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900
							"
							aria-label="Frequently Asked Questions"
						>
							FAQ
						</button>
						<a
							href="/contact"
							onClick={() => trackCTAClick('contact_header', 'header')}
							className="
								px-4 py-2 
								text-sm font-medium 
								text-zinc-300 
								hover:text-white hover:bg-zinc-800/50
								transition-colors duration-200
								rounded-md
								focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-900
							"
							aria-label="Contact Us"
						>
							Contact Us
						</a>
					</div>

					{/* Mobile Navigation */}
					<MobileNavSimple />
				</div>
			</div>
		</HeaderThemeWrapper>
	);
}