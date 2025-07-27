import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils/utils';

export const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 !outline-none focus-within:ring-2 focus-within:ring-emerald-800 disabled:opacity-50 disabled:pointer-events-none',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md',
				destructive:
					'bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md',
				outline:
					'border border-zinc-800 bg-black hover:bg-zinc-900 hover:border-zinc-700 text-white rounded-md',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md',
				ghost: 'hover:bg-zinc-900/50 text-white hover:text-white rounded-md',
				link: 'text-primary underline-offset-4 hover:underline',

				// Degentalk crypto-themed variants
				gradient:
					'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-medium rounded-full shadow-[0_0_15px_rgba(0,255,170,0.5)]',
				'gradient-outline':
					'border-2 border-emerald-500 bg-black text-emerald-400 hover:bg-emerald-500/10 rounded-full',
				wallet: 'bg-black border border-zinc-800 hover:bg-zinc-900 text-white rounded-full',
				glow: 'bg-black border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 rounded-md shadow-[0_0_10px_rgba(0,255,170,0.3)] hover:shadow-[0_0_15px_rgba(0,255,170,0.5)]',
				xp: 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-medium rounded-full'
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 px-3 py-2 text-xs',
				lg: 'h-11 px-8 py-2',
				xl: 'h-12 px-10 py-3 text-base',
				icon: 'h-10 w-10',
				'icon-sm': 'h-8 w-8'
			},
			animation: {
				none: '',
				pulse: 'animate-pulse',
				glow: 'animate-pulse-glow'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
			animation: 'none'
		}
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			animation,
			asChild = false,
			leftIcon,
			rightIcon,
			isLoading,
			children,
			...props
		},
		ref
	) => {
		const Comp = asChild ? Slot : 'button';

		return (
			<Comp
				className={cn(buttonVariants({ variant, size, animation, className }))}
				ref={ref}
				disabled={isLoading || props.disabled}
				{...props}
			>
				{asChild ? (
					children
				) : (
					<>
						{isLoading && (
							<svg
								className="animate-spin -ml-1 mr-2 h-4 w-4"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
						)}
						{!isLoading && leftIcon}
						{children}
						{rightIcon}
					</>
				)}
			</Comp>
		);
	}
);
Button.displayName = 'Button';

export { Button };
