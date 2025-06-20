import React from 'react';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHeader } from './HeaderContext';

interface WalletButtonProps {
	className?: string;
}

export function WalletButton({ className }: WalletButtonProps) {
	const { toggleWallet } = useHeader();

	return (
		<Button
			variant="ghost"
			size="icon"
			className={`text-zinc-400 hover:text-emerald-400 focus:text-emerald-400 transition-all duration-200 ${className}`}
			onClick={toggleWallet}
			aria-label="Open wallet"
		>
			<Wallet className="h-5 w-5" />
		</Button>
	);
}
