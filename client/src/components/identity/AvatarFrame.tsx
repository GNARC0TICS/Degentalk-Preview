import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarFrameProps {
	avatarUrl: string;
	frame?: {
		imageUrl?: string | null;
		frameStyle?: string | null;
		rarityColor?: string | null;
	} | null;
	size?: number; // px
	className?: string;
}

export const AvatarFrame: React.FC<AvatarFrameProps> = ({
	avatarUrl,
	frame,
	size = 48,
	className
}) => {
	// Map predefined frame styles to class strings
	const getStyleClasses = (style?: string | null) => {
		if (!style) return '';
		switch (style) {
			case 'bronze':
				return 'ring-[#cd7f32]/80 ring-2';
			case 'silver':
				return 'ring-[#c0c0c0]/80 ring-2';
			case 'gold':
				return 'ring-yellow-400/80 ring-2';
			case 'mythic-glow':
				return 'ring-purple-500/80 ring-2 animate-glow';
			case 'chroma-loop':
				return 'ring-white/80 ring-2 animate-chroma';
			default:
				return '';
		}
	};

	return (
		<div className={cn('relative inline-block', className)} style={{ width: size, height: size }}>
			{/* Avatar image */}
			<img src={avatarUrl} alt="avatar" className="rounded-full w-full h-full object-cover" />

			{/* Frame overlay */}
			{frame?.imageUrl && (
				<img
					src={frame.imageUrl as string}
					alt="frame"
					className="absolute inset-0 w-full h-full object-cover pointer-events-none"
					style={frame.rarityColor ? { boxShadow: `0 0 0 2px ${frame.rarityColor}` } : undefined}
				/>
			)}

			{/* Style-based frame */}
			{!frame?.imageUrl && frame?.frameStyle && (
				<span
					className={cn(
						'absolute inset-0 rounded-full pointer-events-none',
						getStyleClasses(frame.frameStyle)
					)}
					style={frame.rarityColor ? { boxShadow: `0 0 0 2px ${frame.rarityColor}` } : undefined}
				/>
			)}
		</div>
	);
};
