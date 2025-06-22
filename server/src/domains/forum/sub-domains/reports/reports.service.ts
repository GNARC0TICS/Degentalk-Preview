/**
 * User-facing Reports Service
 *
 * Handles business logic for content reporting.
 */

import { db } from '@db';
import { reportedContent } from '@schema';

export interface CreateReportData {
	contentType: 'post' | 'thread' | 'message';
	contentId: number;
	reason: string;
	details?: string;
	reporterId: string; // UUID in the schema
}

export class ReportsService {
	async createReport(data: CreateReportData) {
		const [report] = await db.insert(reportedContent).values({
			contentType: data.contentType,
			contentId: data.contentId,
			reason: data.reason,
			details: data.details,
			reporterId: data.reporterId,
			status: 'pending'
		}).returning();

		return report;
	}
}

export const reportsService = new ReportsService();