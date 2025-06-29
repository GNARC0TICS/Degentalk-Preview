import React from 'react';
import * as Switch from '@radix-ui/react-switch';

export interface SwitchRowProps {
	label: React.ReactNode;
	description?: React.ReactNode;
	checked: boolean;
	onChange: (value: boolean) => void;
	disabled?: boolean;
	className?: string;
}

/**
 * Accessible labelled switch (toggle) with optional description, matching admin UI styling.
 */
export const SwitchRow: React.FC<SwitchRowProps> = ({
	label,
	description,
	checked,
	onChange,
	disabled,
	className
}) => {
	return (
		<div className={className}>
			<div className="flex items-center justify-between gap-4 py-2">
				<div>
					<span className="text-sm font-medium leading-none text-foreground">{label}</span>
					{description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
				</div>
				<Switch.Root
					checked={checked}
					onCheckedChange={onChange}
					disabled={disabled}
					className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring focus-visible:ring-primary/75 disabled:opacity-50 disabled:pointer-events-none"
					style={{
						backgroundColor: checked ? 'var(--primary-500, #10b981)' : 'var(--gray-300, #d1d5db)'
					}}
				>
					<Switch.Thumb
						className="pointer-events-none inline-block h-4 w-4 translate-x-0.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" // Tailwind overrides translate when checked
						style={{ transform: checked ? 'translateX(1.25rem)' : undefined }}
					/>
				</Switch.Root>
			</div>
		</div>
	);
};

export default SwitchRow;
