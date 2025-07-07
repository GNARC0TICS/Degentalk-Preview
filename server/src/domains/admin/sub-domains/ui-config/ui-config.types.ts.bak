import type { UiQuote, UiCollection, NewUiQuote, NewUiCollection } from '@schema';

/**
 * Request/Response types for UI Configuration API
 */

// Base pagination interface
export interface PaginationOptions {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

// Quote filtering interface
export interface QuoteFilters {
	type?: string[];
	tags?: string[];
	intensity?: number[];
	theme?: string[];
	targetAudience?: string[];
	isActive?: boolean;
	searchTerm?: string;
	startDate?: Date;
	endDate?: Date;
}

// Quote response interface
export interface QuotesResponse {
	quotes: UiQuote[];
	total: number;
	page: number;
	limit: number;
	filters: QuoteFilters;
}

// Create quote request interface
export interface CreateQuoteRequest {
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
	metadata?: Record<string, any>;
}

// Update quote request interface
export interface UpdateQuoteRequest extends CreateQuoteRequest {
	id: string;
}

// Reorder quotes request interface
export interface ReorderQuotesRequest {
	quoteOrders: Array<{
		id: string;
		displayOrder: number;
	}>;
}

// Create collection request interface
export interface CreateCollectionRequest {
	name: string;
	description?: string;
	type: string;
	isActive?: boolean;
	priority?: number;
	startDate?: Date;
	endDate?: Date;
	config?: Record<string, any>;
	quoteIds?: string[];
}

// Update collection request interface
export interface UpdateCollectionRequest extends CreateCollectionRequest {
	id: string;
}

// Quote analytics request interface
export interface QuoteAnalyticsRequest {
	quoteId: string;
	eventType?: string;
	startDate?: Date;
	endDate?: Date;
	page?: string;
	position?: string;
}

// Quote analytics response interface
export interface QuoteAnalyticsResponse {
	quoteId: string;
	totalImpressions: number;
	totalClicks: number;
	clickThroughRate: number;
	topPages: Array<{
		page: string;
		count: number;
	}>;
	topPositions: Array<{
		position: string;
		count: number;
	}>;
	dateRange: {
		start: Date;
		end: Date;
	};
}

// Bulk quote operation interface
export interface BulkQuoteOperation {
	action: 'activate' | 'deactivate' | 'delete' | 'update_tags' | 'update_intensity';
	quoteIds: string[];
	data?: Partial<CreateQuoteRequest>;
}

// Import quotes request interface
export interface ImportQuotesRequest {
	quotes: CreateQuoteRequest[];
	overwriteExisting?: boolean;
}

// Export quotes request interface
export interface ExportQuotesRequest {
	filters?: QuoteFilters;
	format?: 'json' | 'csv';
	includeAnalytics?: boolean;
}

// Service interface
export interface UiConfigService {
	// Quote operations
	getQuotes(filters?: QuoteFilters, pagination?: PaginationOptions): Promise<QuotesResponse>;
	getQuoteById(id: string): Promise<UiQuote | null>;
	createQuote(data: CreateQuoteRequest, userId: string): Promise<UiQuote>;
	updateQuote(data: UpdateQuoteRequest, userId: string): Promise<UiQuote>;
	deleteQuote(id: string): Promise<boolean>;
	reorderQuotes(data: ReorderQuotesRequest): Promise<boolean>;

	// Collection operations
	getCollections(): Promise<UiCollection[]>;
	createCollection(data: CreateCollectionRequest, userId: string): Promise<UiCollection>;
	updateCollection(data: UpdateCollectionRequest, userId: string): Promise<UiCollection>;
	deleteCollection(id: string): Promise<boolean>;

	// Analytics operations
	trackQuoteEvent(quoteId: string, eventType: string, context: Record<string, any>): Promise<void>;
	getQuoteAnalytics(request: QuoteAnalyticsRequest): Promise<QuoteAnalyticsResponse>;

	// Bulk operations
	bulkUpdateQuotes(operation: BulkQuoteOperation): Promise<boolean>;
	importQuotes(
		data: ImportQuotesRequest,
		userId: string
	): Promise<{ imported: number; skipped: number }>;
	exportQuotes(request: ExportQuotesRequest): Promise<Buffer | string>;
}

// Frontend integration types
export interface QuoteDisplayConfig {
	type: string;
	filters?: QuoteFilters;
	shuffleOnLoad?: boolean;
	rotationInterval?: number;
	maxQuotes?: number;
	fallbackQuotes?: CreateQuoteRequest[];
}

export interface QuoteContextConfig {
	userLevel?: number;
	userTags?: string[];
	currentPage?: string;
	timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
	userPreferences?: {
		intensity?: number;
		themes?: string[];
	};
}
