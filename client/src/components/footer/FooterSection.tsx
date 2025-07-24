import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { FooterLink } from '@app/config/footer-navigation';

interface FooterSectionProps {
	title: string;
	links: FooterLink[];
	animationDelay?: number | undefined;
}

export function FooterSection({ title, links, animationDelay = 0 }: FooterSectionProps) {
	return (
		<div>
			<h4 className="font-medium mb-3 text-zinc-300">{title}</h4>
			<ul className="space-y-2 text-sm">
				{links.map((item, index) => (
					<motion.li
						key={item.label}
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: index * 0.1 + animationDelay }}
					>
						{item.external ? (
							<motion.a
								href={item.href}
								target="_blank"
								rel="noopener noreferrer"
								className="text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer inline-block"
								whileHover={{ x: 5 }}
							>
								{item.label} ↗
							</motion.a>
						) : (
							<Link to={item.href}>
								<motion.span
									className="text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer inline-block"
									whileHover={{ x: 5 }}
								>
									{item.label}
								</motion.span>
							</Link>
						)}
					</motion.li>
				))}
			</ul>
		</div>
	);
}
