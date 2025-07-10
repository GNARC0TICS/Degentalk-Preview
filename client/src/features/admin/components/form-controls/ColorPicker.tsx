import React from 'react';
import { HexColorPicker } from 'react-colorful';

export interface ColorPickerProps {
	/** Current color value as hex string (#RRGGBB) */
	color: string;
	/** Callback invoked when color changes */
	onChange: (next: string) => void;
	/** Optional label shown above the picker */
	label?: React.ReactNode | undefined;
	/** Additional class names */
	className?: string;
	/** Optional helper text */
	helperText?: string;
	/** Whether the picker is disabled */
	disabled?: boolean | undefined;
	/** Show input field */
	showInput?: boolean | undefined;
	/** Compact mode */
	compact?: boolean | undefined;
}

/**
 * Reusable hex color picker control used across admin visual config pages.
 * Wraps react-colorful component and renders a small preview swatch.
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label, className }) => {
	return (
		<div className={className}>
			{label && (
				<label className="block mb-1 text-sm font-medium text-muted-foreground">{label}</label>
			)}
			<div className="flex items-center gap-4">
				<div className="w-8 h-8 rounded border shadow-inner" style={{ backgroundColor: color }} />
				<HexColorPicker color={color} onChange={onChange} className="w-64 h-32" />
				<input
					type="text"
					value={color}
					onChange={(e) => onChange(e.target.value)}
					className="ml-auto w-28 rounded border px-2 py-1 text-sm font-mono"
				/>
			</div>
		</div>
	);
};

export default ColorPicker;
