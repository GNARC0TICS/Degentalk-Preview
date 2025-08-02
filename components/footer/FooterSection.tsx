import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/lib/router-compat';
import { Lock } from 'lucide-react';
import type { FooterLink } from '@/config/footer-navigation';

interface FooterSectionProps {
	title: string;
	links: FooterLink[];
	animationDelay?: number | undefined;
}

export function FooterSection({ title, links, animationDelay = 0 }: FooterSectionProps) {
	const handleDisabledClick = (e: React.MouseEvent) => {
		e.preventDefault();
	};

	return (
		<div>
			<h4 className="text-lg font-semibold mb-4 text-zinc-200">{title}</h4>
			<ul className="space-y-2.5 text-sm list-none">
				{links.map((item, index) => {
					return (
						<motion.li
							key={item.label}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.1 + animationDelay }}
						>
							{item.comingSoon ? (
								<motion.span
									className="text-zinc-600 cursor-not-allowed inline-flex items-center gap-1.5"
									whileHover={{ x: 0 }}
								>
									<Lock className="w-3 h-3" />
									{item.label}
									<span className="text-xs ml-1 opacity-60">soon</span>
								</motion.span>
							) : item.external ? (
								<a
									href={item.href}
									target="_blank"
									rel="noopener noreferrer"
									className="text-zinc-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
								>
									<motion.span whileHover={{ x: 5 }}>
										{item.label} ↗
									</motion.span>
								</a>
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
