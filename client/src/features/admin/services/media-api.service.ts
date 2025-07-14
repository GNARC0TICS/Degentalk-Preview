import { apiRequest } from '@/utils/api-request';
import type { EntityId } from '@shared/types/ids';

export type MediaType = 'emoji' | 'lottie' | 'badge' | 'title' | 'flair';

export interface MediaItem {
	id: EntityId;
	url: string;
	type: MediaType;
	createdAt: string;
}

export class MediaApiService {
	async uploadMedia(file: File, type: MediaType): Promise<MediaItem> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('type', type);

		return apiRequest<MediaItem>({
			url: '/api/admin/media',
			method: 'POST',
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		});
	}

	// Back-compat helper
	uploadLottie(file: File) {
		return this.uploadMedia(file, 'lottie');
	}

	async listMedia(type?: MediaType): Promise<MediaItem[]> {
		return apiRequest<MediaItem[]>({
			url: '/api/admin/media',
			method: 'GET',
			params: type ? { type } : undefined
		});
	}

	listLottie() {
		return this.listMedia('lottie');
	}

	async deleteMedia(id: EntityId): Promise<void> {
		return apiRequest<void>({ url: `/api/admin/media/${id}`, method: 'DELETE' });
	}
}

export const mediaApiService = new MediaApiService();
