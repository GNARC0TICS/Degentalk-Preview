import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/utils';
import { useBreakpoint } from '@/hooks/useMediaQuery';
import type { EntityId } from '@shared/types/ids';

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
				// Enhanced variants for better UX
				emerald: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800',
				'emerald-outline':
					'border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 active:bg-emerald-500/20',
				glass:
					'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 active:bg-white/30',
				floating:
					'bg-zinc-900/90 backdrop-blur-lg border border-zinc-700/50 text-white hover:bg-zinc-800/90 hover:border-zinc-600/50 shadow-lg hover:shadow-xl'
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				xl: 'h-12 rounded-lg px-10 text-base',
				icon: 'h-10 w-10',
				'icon-sm': 'h-8 w-8',
				'icon-lg': 'h-12 w-12',
				// Touch-friendly sizes for mobile
				touch: 'h-12 px-6 min-w-[48px]',
				'touch-sm': 'h-10 px-4 min-w-[40px]'
			},
			// Enhanced feedback for better UX
			feedback: {
				none: '',
				subtle: 'hover:scale-[1.02] active:scale-[0.98]',
				pronounced: 'hover:scale-105 active:scale-95',
				bounce: 'hover:animate-pulse active:animate-bounce'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
			feedback: 'subtle'
		}
	}
);

export interface EnhancedButtonProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	loading?: boolean;
	loadingText?: string;
	hapticFeedback?: boolean;
	ripple?: boolean;
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
	(
		{
			className,
			variant,
			size,
			feedback,
			asChild = false,
			loading = false,
			loadingText,
			hapticFeedback = true,
			ripple = false,
			children,
			disabled,
			onClick,
			...props
		},
		ref
	) => {
		const { isMobile } = useBreakpoint();
		const [ripples, setRipples] = React.useState<Array<{ id: EntityId; x: number; y: number }>>([]);

		// Auto-adjust size for mobile
		const adjustedSize = isMobile && (size === 'default' || size === 'sm') ? 'touch' : size;

		const Comp = asChild ? Slot : motion.button;

		// Enhanced click handler with haptic feedback
		const handleClick = React.useCallback(
			(event: React.MouseEvent<HTMLButtonElement>) => {
				if (disabled || loading) return;

				// Haptic feedback on supported devices
				if (hapticFeedback && 'vibrate' in navigator && isMobile) {
					navigator.vibrate(10); // Short, subtle vibration
				}

				// Ripple effect
				if (ripple) {
					const rect = event.currentTarget.getBoundingClientRect();
					const x = event.clientX - rect.left;
					const y = event.clientY - rect.top;
					const newRipple = { id: Date.now().toString() as EntityId, x, y };

					setRipples((prev) => [...prev, newRipple]);

					// Remove ripple after animation
					setTimeout(() => {
						setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
					}, 600);
				}

				onClick?.(event);
			},
			[disabled, loading, hapticFeedback, ripple, isMobile, onClick]
		);

		// Motion variants for enhanced animations
		const motionVariants = {
			idle: { scale: 1 },
			hover: {
				scale: feedback === 'pronounced' ? 1.05 : feedback === 'subtle' ? 1.02 : 1,
				transition: { type: 'spring', stiffness: 400, damping: 25 }
			},
			tap: {
				scale: feedback === 'pronounced' ? 0.95 : feedback === 'subtle' ? 0.98 : 1,
				transition: { type: 'spring', stiffness: 400, damping: 25 }
			}
		};

		const buttonProps = {
			className: cn(
				buttonVariants({ variant, size: adjustedSize, feedback, className }),
				loading && 'cursor-not-allowed',
				ripple && 'relative overflow-hidden',
				// Enhanced focus styles for accessibility
				'focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900'
			),
			ref,
			disabled: disabled || loading,
			onClick: handleClick,
			...props
		};
		
		const motionProps = asChild ? {} : {
			variants: motionVariants,
			initial: "idle",
			whileHover: !disabled && !loading ? 'hover' : 'idle',
			whileTap: !disabled && !loading ? 'tap' : 'idle'
		};

		return (
			<Comp {...buttonProps} {...motionProps}>
				{/* Ripple effect */}
				{ripple && (
					<span className="absolute inset-0 overflow-hidden rounded-[inherit]">
						{ripples.map((ripple) => (
							<motion.span
								key={ripple.id}
								className="absolute bg-white/30 rounded-full pointer-events-none"
								style={{
									left: ripple.x - 10,
									top: ripple.y - 10,
									width: 20,
									height: 20
								}}
								initial={{ scale: 0, opacity: 1 }}
								animate={{ scale: 4, opacity: 0 }}
								transition={{ duration: 0.6 }}
							/>
						))}
					</span>
				)}

				{/* Loading state */}
				{loading && (
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						className="mr-2"
					>
						<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
								fill="none"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
					</motion.div>
				)}

				{/* Button content */}
				<motion.span
					initial={false}
					animate={{ opacity: loading ? 0.7 : 1 }}
					transition={{ duration: 0.2 }}
				>
					{loading && loadingText ? loadingText : children}
				</motion.span>
			</Comp>
		);
	}
);

EnhancedButton.displayName = 'EnhancedButton';

export { EnhancedButton, buttonVariants };
