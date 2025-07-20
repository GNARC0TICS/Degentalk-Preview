import React from 'react';
import { IconRenderer } from '@/components/icons/iconRenderer';
import { Button } from '@/components/ui/button';
import { useHeader } from './HeaderContext.tsx';

interface WalletButtonProps {
	className?: string;
}

export function WalletButton({ className }: WalletButtonProps) {
	const { toggleWallet, user } = useHeader();

	if (!user) {
		return null;
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			className={`text-zinc-400 hover:text-emerald-400 focus:text-emerald-400 transition-all duration-200 ${className}`}
			onClick={toggleWallet}
			aria-label="Open wallet"
		>
			<IconRenderer icon="wallet" className="h-5 w-5" />
		</Button>
	);
}
