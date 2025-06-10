import React from 'react';

interface ProfileBackgroundProps {
	imagePath?: string;
}

export const ProfileBackground: React.FC<ProfileBackgroundProps> = ({
	// Use the known working image as the default
	imagePath = '/images/19FA32BC-BF64-4CE2-990E-BDB147C2A159.png'
}) => {
	// Use an effect to confirm the component is mounting
	React.useEffect(() => {
		console.log('ProfileBackground mounted with image:', imagePath);
	}, [imagePath]);

	return (
		<>
			{/* Main background layer - using absolute instead of fixed positioning */}
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: `url('${imagePath}')`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
					zIndex: -1 // Behind everything
				}}
			>
				{/* Semi-transparent overlay for readability */}
				<div
					className="absolute inset-0 bg-gradient-to-b from-zinc-900/65 to-black/80"
					style={{ zIndex: 0 }}
				></div>
			</div>

			{/* Debug indicator - bright colored element to verify the component is rendering */}
			{process.env.NODE_ENV === 'development' && (
				<div
					className="fixed top-0 left-0 p-1 text-xs bg-green-500 text-black rounded-br"
					style={{ zIndex: 9999 }}
				>
					BG Loaded
				</div>
			)}
		</>
	);
};
