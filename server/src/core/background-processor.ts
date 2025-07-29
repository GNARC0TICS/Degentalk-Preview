/**
 * Background Processor
 *
 * Handles background processing of achievement events and other asynchronous tasks.
 */

import { db } from '@degentalk/db';
import { eq } from 'drizzle-orm';
import { achievementEvents } from '@schema';
import { AchievementProcessorService } from '../domains/gamification/achievements/achievement-processor.service';
import { logger } from './logger';
import type { AchievementEventType } from '@schema';

export class BackgroundProcessor {
	private processorService = new AchievementProcessorService();
	private intervalId: NodeJS.Timeout | null = null;
	private isProcessing = false;

	/**
	 * Process pending achievement events
	 */
	async processAchievementEvents(): Promise<void> {
		if (this.isProcessing) {
			logger.debug('BACKGROUND_PROCESSOR', 'Achievement processing already in progress, skipping');
			return;
		}

		this.isProcessing = true;

		try {
			// Get pending events (limit to avoid overwhelming the processor)
			const pendingEvents = await db
				.select()
				.from(achievementEvents)
				.where(eq(achievementEvents.processingStatus, 'pending'))
				.limit(100);

			if (pendingEvents.length === 0) {
				return;
			}

			logger.info('BACKGROUND_PROCESSOR', `Processing ${pendingEvents.length} achievement events`);

			// Process each event
			for (const event of pendingEvents) {
				try {
					// Mark as processing to avoid duplicate processing
					await db
						.update(achievementEvents)
						.set({ processingStatus: 'processing' })
						.where(eq(achievementEvents.id, event.id));

					// Process the event
					await this.processorService.processEvent(
						event.eventType as AchievementEventType,
						event.userId,
						event.eventData
					);

					logger.debug('BACKGROUND_PROCESSOR', `Processed achievement event ${event.id}`, {
						eventType: event.eventType,
						userId: event.userId
					});
				} catch (error) {
					logger.error('BACKGROUND_PROCESSOR', `Failed to process achievement event ${event.id}`, {
						eventId: event.id,
						eventType: event.eventType,
						userId: event.userId,
						error: error instanceof Error ? error.message : String(error)
					});

					// Mark as failed
					await db
						.update(achievementEvents)
						.set({
							processingStatus: 'failed',
							processedAt: new Date()
						})
						.where(eq(achievementEvents.id, event.id));
				}
			}

			logger.info(
				'BACKGROUND_PROCESSOR',
				`Completed processing ${pendingEvents.length} achievement events`
			);
		} catch (error) {
			logger.error('BACKGROUND_PROCESSOR', 'Error in achievement event processing', {
				error: error instanceof Error ? error.message : String(error)
			});
		} finally {
			this.isProcessing = false;
		}
	}

	/**
	 * Start the background processor
	 */
	start(): void {
		if (this.intervalId) {
			logger.warn('BACKGROUND_PROCESSOR', 'Background processor already started');
			return;
		}

		logger.info('BACKGROUND_PROCESSOR', 'Starting background processor');

		// Process events every 30 seconds
		this.intervalId = setInterval(() => {
			this.processAchievementEvents().catch((error) => {
				logger.error('BACKGROUND_PROCESSOR', 'Unhandled error in achievement processing', {
					error: error instanceof Error ? error.message : String(error)
				});
			});
		}, 30000); // 30 seconds

		// Process once immediately
		this.processAchievementEvents().catch((error) => {
			logger.error('BACKGROUND_PROCESSOR', 'Initial achievement processing failed', {
				error: error instanceof Error ? error.message : String(error)
			});
		});
	}

	/**
	 * Stop the background processor
	 */
	stop(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
			logger.info('BACKGROUND_PROCESSOR', 'Background processor stopped');
		}
	}

	/**
	 * Get processor status
	 */
	getStatus(): {
		isRunning: boolean;
		isProcessing: boolean;
	} {
		return {
			isRunning: this.intervalId !== null,
			isProcessing: this.isProcessing
		};
	}
}

// Create singleton instance
export const backgroundProcessor = new BackgroundProcessor();

// Auto-start in production and development (but not in tests)
if (process.env.NODE_ENV !== 'test') {
	backgroundProcessor.start();

	// Graceful shutdown
	process.on('SIGINT', () => {
		logger.info('BACKGROUND_PROCESSOR', 'Received SIGINT, stopping background processor');
		backgroundProcessor.stop();
	});

	process.on('SIGTERM', () => {
		logger.info('BACKGROUND_PROCESSOR', 'Received SIGTERM, stopping background processor');
		backgroundProcessor.stop();
	});
}
