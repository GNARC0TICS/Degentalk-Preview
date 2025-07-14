import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/utils';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const inputVariants = cva(
	'flex w-full rounded-md border bg-black text-base text-white transition-all duration-200 placeholder:text-zinc-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
	{
		variants: {
			variant: {
				default: 'border-zinc-800 focus:border-zinc-700 focus:ring-0',
				wallet:
					'border-zinc-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20',
				error:
					'border-red-900 bg-red-950/10 focus:border-red-700 focus:ring-1 focus:ring-red-700/20 placeholder:text-red-700/60',
				success:
					'border-emerald-900 bg-emerald-950/10 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700/20'
			},
			size: {
				default: 'h-10 px-3 py-2',
				sm: 'h-8 px-3 py-1 text-xs',
				lg: 'h-12 px-4 py-3'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	}
);

export interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
		VariantProps<typeof inputVariants> {
	icon?: React.ReactNode;
	error?: string;
	isPassword?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, variant, size, icon, error, isPassword, type, ...props }, ref) => {
		const [showPassword, setShowPassword] = React.useState(false);
		const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;

		const togglePassword = () => {
			setShowPassword(!showPassword);
		};

		return (
			<div className="space-y-1.5 w-full">
				<div className="relative">
					{icon && (
						<div className="absolute inset-y-0 left-3 flex items-center text-zinc-500">{icon}</div>
					)}

					<input
						type={computedType}
						className={cn(
							'flex h-10 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200',
							icon && 'pl-10',
							isPassword && 'pr-10',
							className
						)}
						ref={ref}
						aria-invalid={error ? 'true' : 'false'}
						aria-describedby={error ? `${props.id}-error` : undefined}
						{...props}
					/>

					{isPassword && (
						<button
							type="button"
							onClick={togglePassword}
							className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-zinc-300"
							aria-label={showPassword ? 'Hide password' : 'Show password'}
						>
							{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
						</button>
					)}
				</div>

				{error && (
					<div
						className="flex items-center space-x-1 text-red-500 text-xs"
						id={`${props.id}-error`}
					>
						<AlertCircle className="h-3.5 w-3.5" />
						<span>{error}</span>
					</div>
				)}
			</div>
		);
	}
);
Input.displayName = 'Input';

export { Input, inputVariants };
