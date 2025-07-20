import React from 'react';
import ChartMenu from './candlestick-menu';

interface HamburgerProps {
	isActive?: boolean;
	onClick?: () => void;
	className?: string;
}

/**
 * Legacy Hamburger component
 *
 * This is a wrapper around the ChartMenu component for backwards compatibility.
 * For new code, use the ChartMenu component directly.
 */
const Hamburger: React.FC<HamburgerProps> = ({ isActive = false, onClick, className = '' }) => {
	return (
		<ChartMenu isActive={isActive} onClick={onClick} className={className} id="hamburger-10" />
	);
};

export default Hamburger;
