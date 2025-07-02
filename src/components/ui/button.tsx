import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  base: "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 !outline-none focus-within:ring-2 focus-within:ring-emerald-800 disabled:opacity-50 disabled:pointer-events-none",
  variants: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md",
    outline: "border border-zinc-800 bg-black hover:bg-zinc-900 hover:border-zinc-700 text-white rounded-md",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md",
    ghost: "hover:bg-zinc-900/50 text-white hover:text-white rounded-md",
  },
  sizes: {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 py-2 text-xs",
    lg: "h-11 px-8 py-2",
    icon: "h-10 w-10",
  }
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variants;
  size?: keyof typeof buttonVariants.sizes;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          buttonVariants.base,
          buttonVariants.variants[variant],
          buttonVariants.sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };