import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
	fallbackSrc?: string;
}

export const SafeImage = ({
	src,
	fallbackSrc = '/images/profile-background.png',
	alt = '',
	...props
}: SafeImageProps) => {
	const [imgSrc, setImgSrc] = useState(src);

	return <img {...props} src={imgSrc} alt={alt} onError={() => setImgSrc(fallbackSrc)} />;
};

export default SafeImage;
