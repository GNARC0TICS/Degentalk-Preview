export class AdminApi {
	private readonly basePath = '/api/admin';

	get<T = any>(endpoint: string, init: RequestInit = {}) {
		return this.request<T>('GET', endpoint, undefined, init);
	}

	post<T = any, B = any>(endpoint: string, body: B, init: RequestInit = {}) {
		return this.request<T>('POST', endpoint, body, init);
	}

	put<T = any, B = any>(endpoint: string, body: B, init: RequestInit = {}) {
		return this.request<T>('PUT', endpoint, body, init);
	}

	patch<T = any, B = any>(endpoint: string, body: B, init: RequestInit = {}) {
		return this.request<T>('PATCH', endpoint, body, init);
	}

	delete<T = any>(endpoint: string, init: RequestInit = {}) {
		return this.request<T>('DELETE', endpoint, undefined, init);
	}

	private async request<T = any, B = any>(
		method: string,
		endpoint: string,
		body?: B,
		init: RequestInit = {}
	) {
		// Lazy import to avoid circular deps if apiRequest imports from this file later
		const { apiRequest } = await import('@/utils/api-request');

		return apiRequest<T>(`${this.basePath}${endpoint}`, {
			...init,
			method,
			body: body !== undefined ? JSON.stringify(body) : undefined
		});
	}
}

export const adminApi = new AdminApi();
