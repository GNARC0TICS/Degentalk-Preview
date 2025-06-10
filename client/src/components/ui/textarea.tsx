import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

const textareaVariants = cva(
	'flex w-full rounded-md border bg-black text-base text-white transition-all duration-200 placeholder:text-zinc-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
	{
		variants: {
			variant: {
				default: 'border-zinc-800 focus:border-zinc-700 focus:ring-0 min-h-[80px]',
				post: 'border-zinc-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 min-h-[120px]',
				comment:
					'border-zinc-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 min-h-[60px]',
				error:
					'border-red-900 bg-red-950/10 focus:border-red-700 focus:ring-1 focus:ring-red-700/20 placeholder:text-red-700/60 min-h-[80px]'
			},
			size: {
				default: 'px-3 py-2',
				sm: 'px-3 py-1 text-xs',
				lg: 'px-4 py-3'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	}
);

export interface TextareaProps
	extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
		VariantProps<typeof textareaVariants> {
	error?: string;
	characterCount?: boolean;
	maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, variant, size, error, characterCount, maxLength, ...props }, ref) => {
		const [count, setCount] = React.useState(0);

		const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
			if (props.onChange) {
				props.onChange(e);
			}
			setCount(e.target.value.length);
		};

		React.useEffect(() => {
			if (props.defaultValue && typeof props.defaultValue === 'string') {
				setCount(props.defaultValue.length);
			}
		}, [props.defaultValue]);

		return (
			<div className="space-y-1.5 w-full">
				<textarea
					className={cn(textareaVariants({ variant: error ? 'error' : variant, size }), className)}
					ref={ref}
					aria-invalid={error ? 'true' : 'false'}
					aria-describedby={error ? `${props.id}-error` : undefined}
					onChange={characterCount ? handleChange : props.onChange}
					maxLength={maxLength}
					{...props}
				/>

				<div className="flex items-center justify-between text-xs">
					{error && (
						<div className="flex items-center space-x-1 text-red-500" id={`${props.id}-error`}>
							<AlertCircle className="h-3.5 w-3.5" />
							<span>{error}</span>
						</div>
					)}

					{characterCount && maxLength && (
						<div
							className={cn(
								'text-zinc-500 ml-auto',
								count > maxLength * 0.9 && 'text-amber-500',
								count === maxLength && 'text-red-500'
							)}
						>
							{count}/{maxLength}
						</div>
					)}
				</div>
			</div>
		);
	}
);
Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
