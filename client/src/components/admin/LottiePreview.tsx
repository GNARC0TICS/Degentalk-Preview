import React from 'react';
import '@lottiefiles/lottie-player';

interface LottiePreviewProps {
    src: string;
    width?: number;
    height?: number;
    speed?: number;
    loop?: boolean;
    autoplay?: boolean;
    background?: string;
}

const LottiePreview: React.FC<LottiePreviewProps> = ({
    src,
    width = 150,
    height = 150,
    speed = 1,
    loop = true,
    autoplay = true,
    background = 'transparent',
}) => {
    if (!src) {
        return <div className="text-xs text-gray-500">No animation source.</div>;
    }

    return (
        <div style={{ width, height }} className="flex items-center justify-center">
            <dotlottie-player
                src={src}
                background={background}
                speed={speed.toString()} // Ensure speed is a string
                style={{ width: '100%', height: '100%' }}
                loop={loop}
                autoplay={autoplay}
            ></dotlottie-player>
        </div>
    );
};

export default LottiePreview; 