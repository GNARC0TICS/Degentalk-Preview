import React from 'react';
import { Link } from 'wouter';

interface LogoProps {
	className?: string;
}

export function Logo({ className }: LogoProps) {
	return (
		<Link href="/">
			<div className={`flex items-center cursor-pointer ${className || ''}`}>
				<span className="text-xl font-bold text-white">
					Degentalk<sup className="text-xs text-zinc-400 font-normal">™</sup>
				</span>
			</div>
		</Link>
	);
}
