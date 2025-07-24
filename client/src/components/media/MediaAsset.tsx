import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { MediaType } from '@app/features/admin/services/media-api.service';

interface Props {
	url: string;
	mediaType: MediaType;
	size?: number;
}

export const MediaAsset: React.FC<Props> = ({ url, mediaType, size = 64 }) => {
	switch (mediaType) {
		case 'badge':
			return <img src={url} className="rounded-full" style={{ width: size, height: size }} />;
		case 'title':
			return (
				<img src={url} className="rounded-md" style={{ width: size * 3, height: size * 0.6 }} />
			);
		case 'emoji':
			return <img src={url} style={{ width: size * 0.8, height: size * 0.8 }} />;
		case 'lottie':
			return <DotLottieReact src={url} autoplay loop style={{ width: size, height: size }} />;
		case 'flair':
			return <img src={url} className="animate-pulse" style={{ width: size, height: size }} />;
		default:
			return null;
	}
};
