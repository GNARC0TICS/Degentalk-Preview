import { apiRequest, apiPost, apiPut, apiDelete } from '@/utils/api-request';

// Types for API requests/responses
export interface QuoteFilters {
	type?: string[];
	tags?: string[];
	intensity?: string[];
	theme?: string[];
	targetAudience?: string[];
	isActive?: boolean;
	searchTerm?: string;
	startDate?: Date;
	endDate?: Date;
}

export interface PaginationOptions {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

export interface CreateQuoteData {
	type: string;
	headline: string;
	subheader?: string;
	tags?: string[];
	intensity?: number;
	theme?: string;
	targetAudience?: string;
	isActive?: boolean;
	displayOrder?: number;
	weight?: number;
	startDate?: Date;
	endDate?: Date;
	variant?: string;
	metadata?: Record<string, unknown>;
}

export interface UpdateQuoteData extends CreateQuoteData {
	id: string;
}

export interface ReorderQuotesData {
	quoteOrders: Array<{ id: string; displayOrder: number }>;
}

export interface BulkOperation {
	action: 'activate' | 'deactivate' | 'delete' | 'update_tags' | 'update_intensity';
	quoteIds: string[];
	data?: Partial<CreateQuoteData>;
}

export interface QuoteAnalyticsData {
	quoteId: string;
	eventType?: string;
	startDate?: Date;
	endDate?: Date;
	page?: string;
	position?: string;
}

// Helper function to build query string
const buildQueryString = <T extends Record<string, any>>(params: T): string => {
	const searchParams = new URLSearchParams();
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			if (Array.isArray(value)) {
				value.forEach((item) => searchParams.append(key, item.toString()));
			} else {
				searchParams.append(key, value.toString());
			}
		}
	});
	return searchParams.toString();
};

// Quote Management API
export const uiConfigApi = {
	// Get quotes with filtering and pagination
	getQuotes: async (filters?: QuoteFilters, pagination?: PaginationOptions) => {
		const queryParams = { ...filters, ...pagination };
		const queryString = buildQueryString(queryParams);
		const url = `/api/admin/ui-config/quotes${queryString ? `?${queryString}` : ''}`;
		return apiRequest({ url, method: 'GET' });
	},

	// Get single quote by ID
	getQuote: (id: string) => apiRequest({ url: `/api/admin/ui-config/quotes/${id}`, method: 'GET' }),

	// Create new quote
	createQuote: (data: CreateQuoteData) => apiPost('/api/admin/ui-config/quotes', data),

	// Update existing quote
	updateQuote: (data: UpdateQuoteData) => apiPut(`/api/admin/ui-config/quotes/${data.id}`, data),

	// Delete quote
	deleteQuote: (id: string) => apiDelete(`/api/admin/ui-config/quotes/${id}`),

	// Reorder quotes
	reorderQuotes: (data: ReorderQuotesData) => apiPost('/api/admin/ui-config/quotes/reorder', data),

	// Bulk operations
	bulkUpdateQuotes: (operation: BulkOperation) =>
		apiPost('/api/admin/ui-config/quotes/bulk', operation),

	// Collections Management
	getCollections: () => apiRequest({ url: '/api/admin/ui-config/collections', method: 'GET' }),

	createCollection: (data: {
		name: string;
		description?: string;
		type: string;
		isActive?: boolean;
		priority?: number;
		startDate?: Date;
		endDate?: Date;
		quoteIds?: string[];
		config?: Record<string, unknown>;
	}) => apiPost('/api/admin/ui-config/collections', data),

	updateCollection: (id: string, data: Record<string, unknown>) =>
		apiPut(`/api/admin/ui-config/collections/${id}`, data),

	deleteCollection: (id: string) => apiDelete(`/api/admin/ui-config/collections/${id}`),

	// Analytics
	trackQuoteEvent: (quoteId: string, eventType: string, context: Record<string, unknown>) =>
		apiPost('/api/admin/ui-config/analytics/track', {
			quoteId,
			eventType,
			context
		}),

	getQuoteAnalytics: (params: QuoteAnalyticsData) => {
		const queryString = buildQueryString(params);
		const url = `/api/admin/ui-config/analytics/quotes/${params.quoteId}${queryString ? `?${queryString}` : ''}`;
		return apiRequest({ url, method: 'GET' });
	},

	// Import/Export
	importQuotes: (data: { quotes: CreateQuoteData[]; overwriteExisting?: boolean }) =>
		apiPost('/api/admin/ui-config/quotes/import', data),

	exportQuotes: async (
		filters?: QuoteFilters,
		format: 'json' | 'csv' = 'json',
		includeAnalytics = false
	) => {
		const queryParams = { ...filters, format, includeAnalytics };
		const queryString = buildQueryString(queryParams);
		const url = `/api/admin/ui-config/quotes/export${queryString ? `?${queryString}` : ''}`;

		if (format === 'csv') {
			// For CSV, we need to handle blob response differently
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});
			return response;
		}

		return apiPost(url, {});
	}
};

// React Query hooks for easier data fetching
export const useQuotes = (filters?: QuoteFilters, pagination?: PaginationOptions) => {
	return {
		// You can add react-query hooks here later
		// For now, just export the raw API functions
	};
};

export default uiConfigApi;
