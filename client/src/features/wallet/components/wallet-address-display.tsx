import React, { useState } from 'react';
import { Copy, CheckCircle2, Wallet, ExternalLink, AlertTriangle, QrCode } from 'lucide-react';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { cn } from '@app/utils/utils';

export interface WalletAddressDisplayProps {
	walletAddress: string;
	copiedAddress?: boolean;
	onCopy?: () => void;
	className?: string;
}

export function WalletAddressDisplay({
	walletAddress,
	copiedAddress = false,
	onCopy,
	className
}: WalletAddressDisplayProps) {
	const [isHovered, setIsHovered] = useState(false);

	// Format address for display (show first 6 and last 6 characters on mobile)
	const formatAddressForMobile = (address: string) => {
		if (address.length <= 12) return address;
		return `${address.slice(0, 6)}...${address.slice(-6)}`;
	};

	if (!walletAddress) {
		return (
			<div
				className={cn(
					'bg-gradient-to-br from-zinc-800/40 to-zinc-800/20 rounded-xl p-4 sm:p-6 border border-zinc-700/50 backdrop-blur-sm',
					className
				)}
			>
				<div className="flex items-center space-x-3 mb-4">
					<div className="h-8 w-8 rounded-full bg-gradient-to-r from-zinc-600 to-zinc-500 flex items-center justify-center shadow-lg">
						<Wallet className="h-4 w-4 text-white" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-white">Wallet Address</h3>
						<p className="text-sm text-zinc-400">TRC-20 compatible address</p>
					</div>
				</div>

				<div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800/50 text-center">
					<div className="flex flex-col items-center space-y-3">
						<div className="bg-zinc-800/50 rounded-full p-3">
							<QrCode className="h-6 w-6 text-zinc-500" />
						</div>
						<div>
							<p className="text-zinc-400 font-medium mb-1">No Address Generated</p>
							<p className="text-sm text-zinc-500 leading-relaxed">
								A wallet address will be automatically generated when you make your first deposit.
							</p>
						</div>
					</div>
				</div>

				<div className="flex items-start space-x-2 mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-900/30">
					<AlertTriangle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
					<div className="text-sm text-blue-200">
						<p className="font-medium mb-1">Getting Started</p>
						<p className="text-blue-300/80">
							Your unique TRC-20 wallet address will appear here once generated.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn(
				'bg-gradient-to-br from-zinc-800/40 to-zinc-800/20 rounded-xl p-4 sm:p-6 border border-zinc-700/50 backdrop-blur-sm',
				className
			)}
		>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center space-x-3">
					<div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
						<Wallet className="h-4 w-4 text-black" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-white">Your Wallet Address</h3>
						<p className="text-sm text-zinc-400">TRC-20 compatible • USDT deposits only</p>
					</div>
				</div>

				<Badge
					variant="outline"
					className="text-emerald-400 border-emerald-600/30 bg-emerald-900/20"
				>
					<CheckCircle2 className="h-3 w-3 mr-1" />
					Active
				</Badge>
			</div>

			{/* Address display with enhanced responsiveness */}
			<div className="space-y-4">
				{/* Desktop view - full address */}
				<div className="hidden sm:block">
					<div
						className={cn(
							'bg-black/50 rounded-lg border border-zinc-800/50 p-4 font-mono text-sm transition-all group',
							'hover:border-zinc-700/80 hover:bg-black/70 cursor-pointer',
							isHovered && 'border-emerald-600/50 bg-black/70'
						)}
						onMouseEnter={() => setIsHovered(true)}
						onMouseLeave={() => setIsHovered(false)}
						onClick={onCopy}
					>
						<div className="flex items-center justify-between">
							<div className="text-zinc-300 select-all break-all">{walletAddress}</div>
							<div className="flex items-center space-x-2 ml-4">
								<Button
									variant="ghost"
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										onCopy?.();
									}}
									className={cn(
										'transition-all',
										copiedAddress
											? 'text-emerald-400 bg-emerald-900/30 hover:bg-emerald-900/40'
											: 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
									)}
								>
									{copiedAddress ? (
										<CheckCircle2 className="h-4 w-4" />
									) : (
										<Copy className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Mobile view - truncated address */}
				<div className="sm:hidden">
					<div
						className={cn(
							'bg-black/50 rounded-lg border border-zinc-800/50 p-3 transition-all',
							'hover:border-zinc-700/80 hover:bg-black/70'
						)}
					>
						<div className="flex items-center justify-between">
							<div className="font-mono text-sm text-zinc-300 select-all">
								{formatAddressForMobile(walletAddress)}
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={onCopy}
								className={cn(
									'ml-2 transition-all',
									copiedAddress
										? 'text-emerald-400 bg-emerald-900/30'
										: 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
								)}
							>
								{copiedAddress ? (
									<CheckCircle2 className="h-4 w-4" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>

						{/* Full address button for mobile */}
						<Button
							variant="outline"
							size="sm"
							className="w-full mt-3 text-xs text-zinc-400 border-zinc-700 hover:bg-zinc-800/50"
							onClick={() => {
								// Show full address in an alert or modal on mobile
								alert(`Full Address:\n${walletAddress}`);
							}}
						>
							<ExternalLink className="h-3 w-3 mr-1" />
							View Full Address
						</Button>
					</div>
				</div>

				{/* Copy feedback */}
				{copiedAddress && (
					<div className="flex items-center justify-center space-x-2 py-2 px-3 bg-emerald-900/30 rounded-lg border border-emerald-800/50 animate-in fade-in duration-300">
						<CheckCircle2 className="h-4 w-4 text-emerald-400" />
						<span className="text-sm text-emerald-300 font-medium">
							Address copied to clipboard!
						</span>
					</div>
				)}
			</div>

			{/* Enhanced safety notice */}
			<div className="mt-4 space-y-3">
				<div className="flex items-start space-x-2 p-3 bg-red-900/20 rounded-lg border border-red-900/30">
					<AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
					<div className="text-sm text-red-200">
						<p className="font-medium mb-1">Important Safety Notice</p>
						<p className="text-red-300/80 leading-relaxed">
							Only send USDT (TRC-20) to this address. Sending other tokens or using different
							networks may result in permanent loss of funds.
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
					<div className="flex items-center space-x-2 p-2 bg-zinc-800/30 rounded">
						<div className="h-2 w-2 rounded-full bg-emerald-500"></div>
						<span className="text-zinc-400">Network: TRC-20 (Tron)</span>
					</div>
					<div className="flex items-center space-x-2 p-2 bg-zinc-800/30 rounded">
						<div className="h-2 w-2 rounded-full bg-amber-500"></div>
						<span className="text-zinc-400">Token: USDT Only</span>
					</div>
				</div>
			</div>
		</div>
	);
}
