import React from 'react';
import { Button } from '@/components/ui/button';
import { NavLink } from './NavLink';

interface AuthButtonsProps {
	className?: string;
}

export function AuthButtons({ className }: AuthButtonsProps) {
	return (
		<div className={`flex items-center space-x-3 ${className}`}>
			<NavLink href="/auth" analyticsLabel="auth_login">
				<Button variant="outline" className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800">
					Log In
				</Button>
			</NavLink>
			<NavLink href="/auth?mode=signup" analyticsLabel="auth_signup">
				<Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500">
					Sign Up
				</Button>
			</NavLink>
		</div>
	);
}
