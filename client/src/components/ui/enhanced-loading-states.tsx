import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap, MessageSquare, Eye, Clock, Crown } from 'lucide-react';
import { cn } from '@app/utils/utils';

// Enhanced loading spinner with micro-animations
export const EnhancedSpinner = memo(
	({
		size = 'default',
		variant = 'default',
		className
	}: {
		size?: 'sm' | 'default' | 'lg';
		variant?: 'default' | 'emerald' | 'gradient';
		className?: string;
	}) => {
		const sizeClasses = {
			sm: 'h-4 w-4',
			default: 'h-6 w-6',
			lg: 'h-8 w-8'
		};

		const variantClasses = {
			default: 'text-zinc-400',
			emerald: 'text-emerald-400',
			gradient: 'text-emerald-400'
		};

		return (
			<motion.div
				initial={{ scale: 0.8, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.8, opacity: 0 }}
				transition={{ duration: 0.2 }}
				className={cn('flex items-center justify-center', className)}
			>
				{variant === 'gradient' ? (
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
						className={cn(
							'rounded-full bg-gradient-to-r from-emerald-400 to-blue-500',
							sizeClasses[size]
						)}
						style={{
							background: 'conic-gradient(from 0deg, #10b981, #3b82f6, #10b981)',
							borderRadius: '50%',
							maskImage: 'radial-gradient(circle, transparent 40%, black 40%)',
							WebkitMaskImage: 'radial-gradient(circle, transparent 40%, black 40%)'
						}}
					/>
				) : (
					<Loader2 className={cn('animate-spin', sizeClasses[size], variantClasses[variant])} />
				)}
			</motion.div>
		);
	}
);

// Enhanced skeleton for thread cards
export const ThreadCardSkeleton = memo(
	({ variant = 'default' }: { variant?: 'default' | 'compact' | 'mobile' }) => {
		const shimmerVariants = {
			initial: { x: '-100%' },
			animate: {
				x: '100%',
				transition: {
					duration: 1.5,
					repeat: Infinity,
					ease: 'linear'
				}
			}
		};

		if (variant === 'mobile') {
			return (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="bg-zinc-900/90 border border-zinc-800/50 rounded-lg p-4 space-y-3"
				>
					{/* Header skeleton */}
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-zinc-800 rounded-full animate-pulse" />
						<div className="flex-1 space-y-1">
							<div className="h-3 bg-zinc-800 rounded w-20 animate-pulse" />
							<div className="h-2 bg-zinc-800 rounded w-16 animate-pulse" />
						</div>
						<div className="w-4 h-4 bg-zinc-800 rounded animate-pulse" />
					</div>

					{/* Title skeleton */}
					<div className="space-y-2">
						<div className="h-4 bg-zinc-800 rounded w-full animate-pulse" />
						<div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" />
					</div>

					{/* Stats skeleton */}
					<div className="flex items-center justify-between pt-2">
						<div className="flex gap-4">
							<div className="h-3 bg-zinc-800 rounded w-12 animate-pulse" />
							<div className="h-3 bg-zinc-800 rounded w-8 animate-pulse" />
						</div>
						<div className="flex gap-2">
							<div className="h-6 bg-zinc-800 rounded-full w-12 animate-pulse" />
							<div className="h-6 bg-zinc-800 rounded-full w-6 animate-pulse" />
						</div>
					</div>

					{/* Zone badge skeleton */}
					<div className="h-5 bg-zinc-800 rounded w-16 animate-pulse" />
				</motion.div>
			);
		}

		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="bg-zinc-900/90 border border-zinc-800/50 rounded-lg p-6 space-y-4 relative overflow-hidden"
			>
				{/* Enhanced shimmer overlay */}
				<motion.div
					variants={shimmerVariants}
					initial="initial"
					animate="animate"
					className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-700/10 to-transparent"
				/>

				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-zinc-800 rounded-full animate-pulse" />
						<div className="space-y-2">
							<div className="h-4 bg-zinc-800 rounded w-24 animate-pulse" />
							<div className="h-3 bg-zinc-800 rounded w-20 animate-pulse" />
						</div>
					</div>
					<div className="flex gap-2">
						<div className="h-8 bg-zinc-800 rounded w-12 animate-pulse" />
						<div className="h-8 bg-zinc-800 rounded w-8 animate-pulse" />
					</div>
				</div>

				{/* Title */}
				<div className="space-y-3">
					<div className="h-6 bg-zinc-800 rounded w-full animate-pulse" />
					<div className="h-6 bg-zinc-800 rounded w-4/5 animate-pulse" />
				</div>

				{/* Stats */}
				<div className="flex items-center justify-between">
					<div className="flex gap-6">
						<div className="h-4 bg-zinc-800 rounded w-16 animate-pulse" />
						<div className="h-4 bg-zinc-800 rounded w-20 animate-pulse" />
						<div className="h-4 bg-zinc-800 rounded w-14 animate-pulse" />
					</div>
					<div className="h-5 bg-zinc-800 rounded w-20 animate-pulse" />
				</div>
			</motion.div>
		);
	}
);

// Loading state for thread lists
export const ThreadListSkeleton = memo(
	({
		count = 5,
		variant = 'default'
	}: {
		count?: number;
		variant?: 'default' | 'compact' | 'mobile';
	}) => {
		return (
			<div className="space-y-4">
				{Array.from({ length: count }, (_, i) => (
					<ThreadCardSkeleton key={i} variant={variant} />
				))}
			</div>
		);
	}
);

// Loading overlay with context-aware messaging
export const LoadingOverlay = memo(
	({
		message = 'Loading...',
		subMessage,
		progress,
		className
	}: {
		message?: string;
		subMessage?: string;
		progress?: number;
		className?: string;
	}) => {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className={cn(
					'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center',
					className
				)}
			>
				<motion.div
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.9, opacity: 0 }}
					transition={{ duration: 0.3 }}
					className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-8 max-w-sm w-full mx-4 text-center"
				>
					<EnhancedSpinner size="lg" variant="gradient" className="mb-4" />

					<h3 className="text-lg font-semibold text-white mb-2">{message}</h3>

					{subMessage && <p className="text-sm text-zinc-400 mb-4">{subMessage}</p>}

					{progress !== undefined && (
						<div className="w-full bg-zinc-800 rounded-full h-2 mb-4">
							<motion.div
								className="bg-gradient-to-r from-emerald-400 to-blue-500 h-2 rounded-full"
								initial={{ width: 0 }}
								animate={{ width: `${progress}%` }}
								transition={{ duration: 0.5 }}
							/>
						</div>
					)}
				</motion.div>
			</motion.div>
		);
	}
);

// Smart loading states that adapt to content
export const SmartLoadingState = memo(
	({
		type = 'threads',
		isLoading = true,
		isEmpty = false,
		error,
		children,
		className
	}: {
		type?: 'threads' | 'posts' | 'users' | 'general';
		isLoading?: boolean;
		isEmpty?: boolean;
		error?: string | null;
		children: React.ReactNode;
		className?: string;
	}) => {
		const loadingMessages = {
			threads: 'Loading threads...',
			posts: 'Loading posts...',
			users: 'Loading users...',
			general: 'Loading...'
		};

		const emptyMessages = {
			threads: 'No threads found',
			posts: 'No posts yet',
			users: 'No users found',
			general: 'No content available'
		};

		const emptyIcons = {
			threads: MessageSquare,
			posts: MessageSquare,
			users: Crown,
			general: Zap
		};

		if (error) {
			return (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className={cn('flex flex-col items-center justify-center py-12 text-center', className)}
				>
					<div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
						<Zap className="w-6 h-6 text-red-400" />
					</div>
					<h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
					<p className="text-zinc-400 max-w-md">{error}</p>
				</motion.div>
			);
		}

		if (isLoading) {
			return (
				<div className={className}>
					{type === 'threads' ? (
						<ThreadListSkeleton count={5} />
					) : (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="flex flex-col items-center justify-center py-12"
						>
							<EnhancedSpinner size="lg" variant="emerald" className="mb-4" />
							<p className="text-zinc-400">{loadingMessages[type]}</p>
						</motion.div>
					)}
				</div>
			);
		}

		if (isEmpty) {
			const EmptyIcon = emptyIcons[type];
			return (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className={cn('flex flex-col items-center justify-center py-12 text-center', className)}
				>
					<div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
						<EmptyIcon className="w-8 h-8 text-zinc-400" />
					</div>
					<h3 className="text-lg font-semibold text-white mb-2">{emptyMessages[type]}</h3>
					<p className="text-zinc-400 max-w-md">
						{type === 'threads' && 'Be the first to start a discussion!'}
						{type === 'posts' && 'Start the conversation by posting a reply.'}
						{type === 'users' && 'No users match your criteria.'}
						{type === 'general' && 'Nothing to show right now.'}
					</p>
				</motion.div>
			);
		}

		return <div className={className}>{children}</div>;
	}
);

// Progress indicator for long operations
export const ProgressIndicator = memo(
	({
		progress,
		steps,
		currentStep,
		className
	}: {
		progress?: number;
		steps?: string[];
		currentStep?: number;
		className?: string;
	}) => {
		return (
			<div className={cn('space-y-4', className)}>
				{/* Progress bar */}
				{progress !== undefined && (
					<div className="w-full bg-zinc-800 rounded-full h-2">
						<motion.div
							className="bg-gradient-to-r from-emerald-400 to-blue-500 h-2 rounded-full"
							initial={{ width: 0 }}
							animate={{ width: `${progress}%` }}
							transition={{ duration: 0.5 }}
						/>
					</div>
				)}

				{/* Step indicators */}
				{steps && currentStep !== undefined && (
					<div className="space-y-2">
						{steps.map((step, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0.3 }}
								animate={{
									opacity: index <= currentStep ? 1 : 0.3,
									scale: index === currentStep ? 1.02 : 1
								}}
								className={cn(
									'flex items-center gap-3 p-2 rounded',
									index === currentStep && 'bg-emerald-500/10'
								)}
							>
								<div
									className={cn(
										'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
										index < currentStep
											? 'bg-emerald-500 text-black'
											: index === currentStep
												? 'bg-blue-500 text-white'
												: 'bg-zinc-700 text-zinc-400'
									)}
								>
									{index < currentStep ? '✓' : index + 1}
								</div>
								<span
									className={cn('text-sm', index <= currentStep ? 'text-white' : 'text-zinc-400')}
								>
									{step}
								</span>
							</motion.div>
						))}
					</div>
				)}
			</div>
		);
	}
);

EnhancedSpinner.displayName = 'EnhancedSpinner';
ThreadCardSkeleton.displayName = 'ThreadCardSkeleton';
ThreadListSkeleton.displayName = 'ThreadListSkeleton';
LoadingOverlay.displayName = 'LoadingOverlay';
SmartLoadingState.displayName = 'SmartLoadingState';
ProgressIndicator.displayName = 'ProgressIndicator';
