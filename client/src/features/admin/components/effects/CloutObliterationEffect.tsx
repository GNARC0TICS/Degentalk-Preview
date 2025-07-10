import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Zap, AlertTriangle } from 'lucide-react';
import { CLOUT_EASTER_EGGS, type ObliterationMessage } from '@/config/easter-eggs.config';

interface CloutObliterationEffectProps {
	isOpen: boolean;
	username: string;
	onClose: () => void;
}

export function CloutObliterationEffect({
	isOpen,
	username,
	onClose
}: CloutObliterationEffectProps) {
	const [message, setMessage] = useState<ObliterationMessage>(
		CLOUT_EASTER_EGGS.obliterationMessages[0]
	);

	useEffect(() => {
		if (isOpen) {
			// Pick random obliteration message
			const randomMessage =
				CLOUT_EASTER_EGGS.obliterationMessages[
					Math.floor(Math.random() * CLOUT_EASTER_EGGS.obliterationMessages.length)
				];
			setMessage(randomMessage as typeof CLOUT_EASTER_EGGS.obliterationMessages[number]);

			// Auto close after duration
			const timer = setTimeout(() => {
				onClose();
			}, 3500);

			return () => clearTimeout(timer);
		}
		return undefined;
	}, [isOpen, onClose]);

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90"
					onClick={onClose}
				>
					<motion.div
						initial={{ scale: 0.5, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.5, opacity: 0 }}
						transition={{ type: 'spring', duration: 0.5 }}
						className="relative max-w-2xl mx-4 p-8 bg-gradient-to-br from-red-900 via-red-800 to-red-900 border-2 border-red-500 rounded-2xl text-center shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Glitch overlay effect */}
						<motion.div
							animate={{
								opacity: [0, 1, 0, 1, 0],
								x: [0, -2, 2, -1, 0],
								filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(0deg)']
							}}
							transition={{
								duration: 0.3,
								repeat: 8,
								ease: 'linear'
							}}
							className="absolute inset-0 bg-gradient-to-r from-red-500 via-transparent to-red-500 opacity-20 rounded-2xl"
						/>

						{/* Warning icons */}
						<div className="flex justify-center items-center gap-4 mb-6">
							<motion.div
								animate={{ rotate: [0, 180, 360] }}
								transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
							>
								<AlertTriangle className="h-12 w-12 text-red-400" />
							</motion.div>
							<motion.div
								animate={{ scale: [1, 1.2, 1] }}
								transition={{ duration: 1, repeat: Infinity }}
							>
								<Skull className="h-16 w-16 text-red-300" />
							</motion.div>
							<motion.div
								animate={{ rotate: [360, 180, 0] }}
								transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
							>
								<Zap className="h-12 w-12 text-red-400" />
							</motion.div>
						</div>

						{/* Title */}
						<motion.h1
							animate={{
								scale: [1, 1.05, 1],
								textShadow: [
									'0 0 10px #ef4444',
									'0 0 20px #ef4444, 0 0 30px #dc2626',
									'0 0 10px #ef4444'
								]
							}}
							transition={{ duration: 1, repeat: Infinity }}
							className="text-5xl font-black text-red-100 mb-4 tracking-wider"
						>
							⚠️ CLOUT OBLITERATED ⚠️
						</motion.h1>

						{/* Username */}
						<motion.div
							animate={{ opacity: [1, 0.7, 1] }}
							transition={{ duration: 0.8, repeat: Infinity }}
							className="text-2xl font-bold text-red-200 mb-6"
						>
							{username}
						</motion.div>

						{/* Obliteration message */}
						<motion.p
							animate={{ opacity: [0.8, 1, 0.8] }}
							transition={{ duration: 1.5, repeat: Infinity }}
							className="text-lg text-red-100 mb-8 font-medium leading-relaxed"
						>
							{message}
						</motion.p>

						{/* Effects description */}
						<div className="text-sm text-red-300 space-y-2">
							<div className="flex items-center justify-center gap-2">
								<Skull className="h-4 w-4" />
								<span>Reputation Status: OBLITERATED</span>
							</div>
							<div className="flex items-center justify-center gap-2">
								<Zap className="h-4 w-4" />
								<span>Clout Level: CRITICAL FAILURE</span>
							</div>
						</div>

						{/* Auto-close indicator */}
						<motion.div
							initial={{ width: '100%' }}
							animate={{ width: '0%' }}
							transition={{ duration: 3.5, ease: 'linear' }}
							className="absolute bottom-0 left-0 h-1 bg-red-400 rounded-b-2xl"
						/>

						{/* Particle effects overlay */}
						<motion.div
							animate={{
								background: [
									'radial-gradient(circle, transparent, transparent)',
									'radial-gradient(circle, rgba(239, 68, 68, 0.1), transparent)',
									'radial-gradient(circle, transparent, transparent)'
								]
							}}
							transition={{ duration: 2, repeat: Infinity }}
							className="absolute inset-0 rounded-2xl pointer-events-none"
						/>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
