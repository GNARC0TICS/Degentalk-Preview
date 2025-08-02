import React from 'react';
import { motion } from 'framer-motion';

interface FooterBrandProps {
	className?: string;
}

export function FooterBrand({ className }: FooterBrandProps) {
	return (
		<div className={className}>
			<motion.h3
				className="text-xl font-bold mb-4 text-white"
				whileHover={{ scale: 1.05 }}
				transition={{ type: 'spring', stiffness: 400 }}
			>
				Degentalk<sup className="text-xs text-zinc-400 font-normal">™</sup>
			</motion.h3>
			<p className="text-zinc-400 text-sm">
				The premier crypto-native forum and social platform for enthusiasts, traders, and
				developers. Where chaos meets community.
			</p>
		</div>
	);
}
