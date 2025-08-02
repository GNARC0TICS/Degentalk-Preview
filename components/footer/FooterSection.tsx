import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/lib/router-compat';
import type { FooterLink } from '@/config/footer-navigation';

interface FooterSectionProps {
	title: string;
	links: FooterLink[];
	animationDelay?: number | undefined;
}

// List of pages that actually exist
const EXISTING_PAGES = [
	'/legal/privacy',
	'/legal/terms',
	'/contact',
	'/'
];

export function FooterSection({ title, links, animationDelay = 0 }: FooterSectionProps) {
	const handleDisabledClick = (e: React.MouseEvent) => {
		e.preventDefault();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};
	return (
		<div>
			<h4 className="text-lg font-display uppercase tracking-wider mb-3 text-zinc-200">{title}</h4>
			<ul className="space-y-2 text-sm list-none">
				{links.map((item, index) => {
					const isExistingPage = EXISTING_PAGES.includes(item.href);
					const isDisabled = !isExistingPage;
					
					return (
						<motion.li
							key={item.label}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.1 + animationDelay }}
						>
							{item.external ? (
								<motion.a
									href="#"
									onClick={handleDisabledClick}
									className="text-zinc-600 hover:text-zinc-500 transition-colors cursor-not-allowed inline-block"
									whileHover={{ x: 0 }}
								>
									{item.label} ↗
								</motion.a>
							) : isDisabled ? (
								<motion.a
									href="#"
									onClick={handleDisabledClick}
									className="text-zinc-600 hover:text-zinc-500 transition-colors cursor-not-allowed inline-block"
									whileHover={{ x: 0 }}
								>
									{item.label}
								</motion.a>
							) : (
								<Link href={item.href}>
									<motion.span
										className="text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer inline-block"
										whileHover={{ x: 5 }}
									>
										{item.label}
									</motion.span>
								</Link>
							)}
						</motion.li>
					);
				})}
			</ul>
		</div>
	);
}
