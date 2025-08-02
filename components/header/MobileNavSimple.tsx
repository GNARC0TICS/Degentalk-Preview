'use client';

import React, { useState } from 'react';
import { Link } from '@/lib/router-compat';
import { primaryNavigation } from '@/config/navigation';
import { trackCTAClick } from '@/lib/analytics';

export function MobileNavSimple() {
	const [isOpen, setIsOpen] = useState(false);

	const toggleMenu = () => setIsOpen(!isOpen);

	return (
		<div className="md:hidden">
			{/* Hamburger Button */}
			<button
				onClick={toggleMenu}
				className="p-2 text-zinc-300 hover:text-white transition-colors"
				aria-label="Toggle mobile menu"
				aria-expanded={isOpen}
			>
				<svg 
					className="w-6 h-6" 
					fill="none" 
					stroke="currentColor" 
					viewBox="0 0 24 24"
				>
					{isOpen ? (
						<path 
							strokeLinecap="round" 
							strokeLinejoin="round" 
							strokeWidth={2} 
							d="M6 18L18 6M6 6l12 12" 
						/>
					) : (
						<path 
							strokeLinecap="round" 
							strokeLinejoin="round" 
							strokeWidth={2} 
							d="M4 6h16M4 12h16M4 18h16" 
						/>
					)}
				</svg>
			</button>

			{/* Mobile Menu Overlay */}
			{isOpen && (
				<div className="fixed inset-0 z-50 bg-black bg-opacity-95">
					<div className="flex flex-col h-full">
						{/* Header */}
						<div className="flex items-center justify-between p-6">
							<Link href="/" className="text-xl font-bold text-white" onClick={() => setIsOpen(false)}>
								Degentalk<sup className="text-xs text-zinc-400 font-normal">™</sup>
							</Link>
							<button
								onClick={toggleMenu}
								className="p-2 text-zinc-300 hover:text-white transition-colors"
								aria-label="Close mobile menu"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Navigation Links */}
						<nav className="flex-1 px-6 py-8" role="navigation" aria-label="Mobile navigation">
							<ul className="space-y-6">
								{primaryNavigation.map((item) => {
									const isComingSoon = ['Forum', 'Shop', 'Leaderboard'].includes(item.label);
									
									return (
										<li key={item.label}>
											{isComingSoon ? (
												<span className="flex items-center text-2xl font-medium text-zinc-500 cursor-not-allowed">
													{React.cloneElement(item.icon, { className: 'w-6 h-6 mr-3' })}
													{item.label}
													<span className="ml-2 text-sm text-zinc-600">(Coming Soon)</span>
												</span>
											) : (
												<Link
													href={item.href}
													className="flex items-center text-2xl font-medium text-zinc-300 hover:text-emerald-400 transition-colors"
													onClick={() => {
														if (item.analyticsLabel) {
															trackCTAClick(item.analyticsLabel, 'mobile_nav');
														}
														setIsOpen(false);
													}}
												>
													{React.cloneElement(item.icon, { className: 'w-6 h-6 mr-3' })}
													{item.label}
												</Link>
											)}
										</li>
									);
								})}
							</ul>
						</nav>

						{/* Footer Actions */}
						<div className="p-6 border-t border-zinc-800">
							<div className="space-y-4">
								<button 
									onClick={() => {
										trackCTAClick('faq_mobile', 'mobile_nav');
										const faqSection = document.getElementById('faq');
										if (faqSection) {
											faqSection.scrollIntoView({ behavior: 'smooth' });
											setIsOpen(false);
										} else {
											window.location.href = '/#faq';
										}
									}}
									className="w-full px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white transition-colors border border-zinc-700 rounded-lg"
								>
									FAQ
								</button>
								<a
									href="/contact"
									onClick={() => trackCTAClick('contact_mobile', 'mobile_nav')}
									className="block w-full px-4 py-3 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-center"
								>
									Contact Us
								</a>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}