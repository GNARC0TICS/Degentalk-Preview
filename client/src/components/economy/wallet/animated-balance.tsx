import React, { useState, useEffect, useRef } from 'react';

interface AnimatedBalanceProps {
	value: number;
	prefix?: string;
	suffix?: string;
	decimalPlaces?: number;
	className?: string;
}

export function AnimatedBalance({
	value = 0,
	prefix = '',
	suffix = '',
	decimalPlaces = 2,
	className = ''
}: AnimatedBalanceProps) {
	const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;

	const [displayValue, setDisplayValue] = useState(safeValue);
	const [animationClass, setAnimationClass] = useState('');
	const prevValueRef = useRef(safeValue);

	useEffect(() => {
		const newValue = typeof value === 'number' && !isNaN(value) ? value : 0;

		if (prevValueRef.current !== newValue) {
			const delta = newValue - prevValueRef.current;

			if (delta > 0) {
				setAnimationClass('balance-increase');
			} else if (delta < 0) {
				setAnimationClass('balance-decrease');
			}

			setDisplayValue(newValue);

			const timeout = setTimeout(() => {
				setAnimationClass('');
			}, 600);

			prevValueRef.current = newValue;

			return () => clearTimeout(timeout);
		}
		return undefined;
	}, [value]);

	const formattedValue =
		typeof displayValue === 'number' && !isNaN(displayValue)
			? displayValue.toLocaleString(undefined, {
					minimumFractionDigits: decimalPlaces,
					maximumFractionDigits: decimalPlaces
				})
			: '0'.padEnd(1 + decimalPlaces, '0');

	return (
		<span className={`${animationClass} ${className}`}>
			{prefix}
			{formattedValue}
			{suffix}
		</span>
	);
}
