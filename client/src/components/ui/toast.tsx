import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
	React.ElementRef<typeof ToastPrimitives.Viewport>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Viewport
		ref={ref}
		className={cn(
			'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
			className
		)}
		{...props}
	/>
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
	'group pointer-events-auto relative flex w-full items-center space-x-4 overflow-hidden rounded-lg border shadow-lg backdrop-blur-sm transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full p-4 pr-8',
	{
		variants: {
			variant: {
				default: 'border-zinc-800 bg-black/80 text-white',
				success: 'border-green-900 bg-green-950/80 text-white',
				error: 'border-red-900 bg-red-950/80 text-white',
				warning: 'border-amber-900 bg-amber-950/80 text-white',
				info: 'border-blue-900 bg-blue-950/80 text-white',

				// Crypto-themed toast variants
				wallet: 'border-emerald-900/50 bg-black/90 text-white glow-sm',
				reward: 'border-amber-900/50 bg-black/90 text-white glow-sm',
				tip: 'border-blue-900/50 bg-black/90 text-white glow-sm',
				destructive: 'border-red-900 bg-black/90 text-white glow-sm'
			},
			animation: {
				none: '',
				pulse: 'animate-pulse',
				glow: 'animate-pulse-glow'
			}
		},
		defaultVariants: {
			variant: 'default',
			animation: 'none'
		}
	}
);

interface ToastIconProps {
	variant?:
		| 'default'
		| 'success'
		| 'error'
		| 'warning'
		| 'info'
		| 'wallet'
		| 'reward'
		| 'tip'
		| 'destructive';
}

const ToastIcon = ({ variant = 'default' }: ToastIconProps) => {
	const iconMap = {
		default: null,
		success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
		error: <AlertTriangle className="h-5 w-5 text-red-500" />,
		warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
		info: <Info className="h-5 w-5 text-blue-500" />,
		wallet: <Info className="h-5 w-5 text-emerald-500" />,
		reward: <CheckCircle2 className="h-5 w-5 text-amber-500" />,
		tip: <CheckCircle2 className="h-5 w-5 text-blue-500" />,
		destructive: <AlertCircle className="h-5 w-5 text-red-500" />
	};

	return iconMap[variant] || null;
};

interface ExtendedToastProps
	extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
		VariantProps<typeof toastVariants> {
	showIcon?: boolean;
}

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, ExtendedToastProps>(
	({ className, variant, animation, showIcon = true, children, ...props }, ref) => {
		return (
			<ToastPrimitives.Root
				ref={ref}
				className={cn(toastVariants({ variant, animation }), className)}
				{...props}
			>
				{showIcon && variant && <ToastIcon variant={variant} />}
				<div className="flex-1 flex flex-col gap-1">{children}</div>
			</ToastPrimitives.Root>
		);
	}
);
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
	React.ElementRef<typeof ToastPrimitives.Action>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Action
		ref={ref}
		className={cn(
			'inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-black/50 px-3 text-xs font-medium text-white transition-colors hover:bg-black focus:outline-none focus:ring-1 focus:ring-zinc-700 disabled:pointer-events-none disabled:opacity-50',
			className
		)}
		{...props}
	/>
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
	React.ElementRef<typeof ToastPrimitives.Close>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Close
		ref={ref}
		className={cn(
			'absolute right-2 top-2 rounded-md p-1 text-zinc-400 opacity-70 transition-opacity hover:text-white hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-zinc-700',
			className
		)}
		toast-close=""
		{...props}
	>
		<X className="h-4 w-4" />
	</ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
	React.ElementRef<typeof ToastPrimitives.Title>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Title
		ref={ref}
		className={cn('text-sm font-semibold text-white', className)}
		{...props}
	/>
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
	React.ElementRef<typeof ToastPrimitives.Description>,
	React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
	<ToastPrimitives.Description
		ref={ref}
		className={cn('text-sm text-zinc-300', className)}
		{...props}
	/>
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
	type ToastProps,
	type ToastActionElement,
	ToastProvider,
	ToastViewport,
	Toast,
	ToastTitle,
	ToastDescription,
	ToastClose,
	ToastAction
};
