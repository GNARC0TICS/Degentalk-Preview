import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { XP_EASTER_EGGS, type BankruptcyMessage } from '@/config/easter-eggs.config';

interface BankruptcyEffectProps {
	isOpen: boolean;
	username: string;
	onClose: () => void;
}

export function BankruptcyEffect({ isOpen, username, onClose }: BankruptcyEffectProps) {
	const [currentMessage, setCurrentMessage] = useState<BankruptcyMessage>(
		XP_EASTER_EGGS.liquidationMessages[0]
	);

	useEffect(() => {
		if (isOpen) {
			// Pick a random liquidation message
			const randomMessage =
				XP_EASTER_EGGS.liquidationMessages[
					Math.floor(Math.random() * XP_EASTER_EGGS.liquidationMessages.length)
				];
			setCurrentMessage(randomMessage);

			// Auto-close after 10 seconds if user doesn't interact
			const autoCloseTimer = setTimeout(() => {
				onClose();
			}, 10000);

			return () => clearTimeout(autoCloseTimer);
		}
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 z-[9999] bg-black bg-opacity-95 flex items-center justify-center p-4"
			>
				{/* Glitch Background Effect */}
				<motion.div
					className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-red-800/20"
					animate={{
						backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
					}}
					transition={{
						duration: 2,
						repeat: Infinity,
						ease: 'easeInOut'
					}}
				/>

				{/* Glitch overlay */}
				<motion.div
					className="absolute inset-0 mix-blend-multiply opacity-30"
					style={{
						background:
							'repeating-linear-gradient(90deg, transparent, transparent 98px, rgba(255,0,0,0.1) 100px)'
					}}
					animate={{
						x: [0, 10, -10, 0]
					}}
					transition={{
						duration: 0.1,
						repeat: Infinity,
						repeatType: 'mirror'
					}}
				/>

				{/* Close button */}
				<Button
					variant="ghost"
					size="sm"
					className="absolute top-4 right-4 z-10 text-white hover:bg-red-800/20"
					onClick={onClose}
				>
					<X className="h-4 w-4" />
				</Button>

				{/* Main content */}
				<motion.div
					initial={{ scale: 0.8, y: 50 }}
					animate={{ scale: 1, y: 0 }}
					exit={{ scale: 0.8, y: 50 }}
					className="relative max-w-2xl mx-auto text-center space-y-8"
				>
					{/* Skull icon with glitch effect */}
					<motion.div
						animate={{
							rotate: [0, -5, 5, 0],
							scale: [1, 1.1, 0.9, 1]
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							ease: 'easeInOut'
						}}
						className="flex justify-center"
					>
						<Skull className="h-24 w-24 text-red-500" />
					</motion.div>

					{/* Main title with glitch text effect */}
					<motion.div
						animate={{
							textShadow: [
								'0 0 10px #ff0000',
								'2px 2px 0px #ff0000, -2px -2px 0px #00ffff',
								'0 0 10px #ff0000'
							]
						}}
						transition={{
							duration: 0.5,
							repeat: Infinity,
							repeatType: 'mirror'
						}}
						className="space-y-2"
					>
						<h1 className="text-6xl md:text-8xl font-black text-red-500 tracking-wider uppercase">
							LIQUIDATION
						</h1>
						<h2 className="text-3xl md:text-4xl font-bold text-red-400 tracking-wide uppercase">
							ALERT
						</h2>
					</motion.div>

					{/* User info */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
						className="space-y-4"
					>
						<div className="text-xl md:text-2xl text-white">
							<span className="text-red-400 font-bold">@{username}</span> has entered{' '}
							<span className="text-red-500 font-black">XP HELL</span>
						</div>

						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 1 }}
							className="text-lg md:text-xl text-gray-300 max-w-xl mx-auto leading-relaxed"
						>
							"{currentMessage}"
						</motion.div>
					</motion.div>

					{/* Action button */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 1.5 }}
					>
						<Button
							onClick={onClose}
							className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg font-semibold rounded-lg"
						>
							Close and Reflect
						</Button>
					</motion.div>

					{/* Footer text */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 2 }}
						className="text-sm text-gray-500 italic"
					>
						"In crypto, as in XP, what goes up must come down." 📉
					</motion.div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
