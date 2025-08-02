import React from 'react';
import { useHoverAnimation } from '@/lib/animations';

interface FooterBrandProps {
	className?: string;
}

export function FooterBrand({ className }: FooterBrandProps) {
	const hoverRef = useHoverAnimation({ scale: 1.05 });

	return (
		<div className={className}>
			<h3
				ref={hoverRef as React.RefObject<HTMLHeadingElement>}
				className="text-xl font-bold mb-4 text-white cursor-pointer"
			>
				Degentalk<sup className="text-xs text-zinc-400 font-normal">™</sup>
			</h3>
			<p className="text-zinc-400 text-sm leading-relaxed">
				The premier crypto-native forum and social platform for enthusiasts, traders, and
				developers. Where chaos meets community.
			</p>
		</div>
	);
}
