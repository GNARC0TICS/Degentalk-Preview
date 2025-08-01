import React from 'react';
import { trackCTAClick } from '@/lib/analytics';

export function PremiumContactButtonCSS() {
	return (
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
	);
}