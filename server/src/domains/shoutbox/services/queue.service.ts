/**
 * Message Queue Service
 *
 * Handles:
 * - Message queuing for rate-limited users
 * - Reliable message delivery
 * - Command processing queue
 * - Broadcast message distribution
 * - Failed message retry logic
 */

import { logger } from '@server/src/core/logger';
import type { UserId } from '@shared/types';
import { EventEmitter } from 'events';
import type { RoomId, MessageId } from '@shared/types';
import { UserId } from "@shared/types";

interface QueuedMessage {
	id: string;
	userId: UserId;
	roomId: RoomId;
	content: string;
	type: 'regular' | 'command' | 'system' | 'broadcast';
	priority: 'low' | 'normal' | 'high' | 'critical';
	scheduledFor: Date;
	attempts: number;
	maxAttempts: number;
	metadata?: Record<string, any>;
	createdAt: Date;
}

interface MessageProcessor {
	process(message: QueuedMessage): Promise<{ success: boolean; error?: string; retry?: boolean }>;
}

interface QueueStats {
	pending: number;
	processing: number;
	failed: number;
	completed: number;
	avgProcessingTime: number;
}

export class MessageQueueService extends EventEmitter {
	private static instance: MessageQueueService;
	private queues: Map<string, QueuedMessage[]> = new Map();
	private processing: Map<string, QueuedMessage> = new Map();
	private failed: QueuedMessage[] = [];
	private completed: number = 0;
	private processors: Map<string, MessageProcessor> = new Map();
	private isRunning: boolean = false;
	private stats: QueueStats = {
		pending: 0,
		processing: 0,
		failed: 0,
		completed: 0,
		avgProcessingTime: 0
	};

	private constructor() {
		super();
		this.initializeQueues();
		this.start();
	}

	static getInstance(): MessageQueueService {
		if (!this.instance) {
			this.instance = new MessageQueueService();
		}
		return this.instance;
	}

	/**
	 * Initialize queue categories
	 */
	private initializeQueues(): void {
		this.queues.set('critical', []); // System messages, admin commands
		this.queues.set('high', []); // Moderator actions, tips
		this.queues.set('normal', []); // Regular user messages
		this.queues.set('low', []); // Bot messages, automated content
	}

	/**
	 * Add message to queue
	 */
	async enqueue(message: Omit<QueuedMessage, 'id' | 'attempts' | 'createdAt'>): Promise<string> {
		const queuedMessage: QueuedMessage = {
			...message,
			id: this.generateMessageId(),
			attempts: 0,
			createdAt: new Date()
		};

		const queueName = message.priority;
		const queue = this.queues.get(queueName) || [];

		// Insert based on scheduled time (priority queue)
		const insertIndex = queue.findIndex((m) => m.scheduledFor > queuedMessage.scheduledFor);
		if (insertIndex === -1) {
			queue.push(queuedMessage);
		} else {
			queue.splice(insertIndex, 0, queuedMessage);
		}

		this.queues.set(queueName, queue);
		this.updateStats();

		logger.debug('MessageQueueService', 'Message enqueued', {
			messageId: queuedMessage.id,
			userId: queuedMessage.userId,
			roomId: queuedMessage.roomId,
			priority: queuedMessage.priority,
			scheduledFor: queuedMessage.scheduledFor
		});

		this.emit('messageEnqueued', queuedMessage);
		return queuedMessage.id;
	}

	/**
	 * Register message processor
	 */
	registerProcessor(type: string, processor: MessageProcessor): void {
		this.processors.set(type, processor);
		logger.info('MessageQueueService', 'Processor registered', { type });
	}

	/**
	 * Start queue processing
	 */
	start(): void {
		if (this.isRunning) return;

		this.isRunning = true;
		this.processQueues();

		// Start retry processor
		setInterval(() => this.retryFailedMessages(), 30000); // Every 30 seconds

		// Cleanup old completed/failed messages
		setInterval(() => this.cleanup(), 300000); // Every 5 minutes

		logger.info('MessageQueueService', 'Queue processing started');
	}

	/**
	 * Stop queue processing
	 */
	stop(): void {
		this.isRunning = false;
		logger.info('MessageQueueService', 'Queue processing stopped');
	}

	/**
	 * Main queue processing loop
	 */
	private async processQueues(): Promise<void> {
		if (!this.isRunning) return;

		try {
			// Process queues in priority order
			const queuePriorities = ['critical', 'high', 'normal', 'low'];

			for (const priority of queuePriorities) {
				const queue = this.queues.get(priority) || [];

				if (queue.length > 0) {
					const message = queue.shift();
					if (message && this.shouldProcessMessage(message)) {
						await this.processMessage(message);
					} else if (message) {
						// Put back if not ready to process
						queue.unshift(message);
					}
				}
			}

			this.updateStats();
		} catch (error) {
			logger.error('MessageQueueService', 'Error in queue processing', { error });
		}

		// Continue processing
		setTimeout(() => this.processQueues(), 100); // 100ms interval
	}

	/**
	 * Check if message should be processed now
	 */
	private shouldProcessMessage(message: QueuedMessage): boolean {
		const now = new Date();
		return message.scheduledFor <= now;
	}

	/**
	 * Process individual message
	 */
	private async processMessage(message: QueuedMessage): Promise<void> {
		const startTime = Date.now();

		try {
			this.processing.set(message.id, message);
			this.emit('messageProcessing', message);

			const processor = this.processors.get(message.type);
			if (!processor) {
				throw new Error(`No processor found for message type: ${message.type}`);
			}

			message.attempts++;
			const result = await processor.process(message);

			if (result.success) {
				this.completed++;
				this.emit('messageCompleted', message);

				logger.debug('MessageQueueService', 'Message processed successfully', {
					messageId: message.id,
					attempts: message.attempts,
					processingTime: Date.now() - startTime
				});
			} else {
				if (result.retry && message.attempts < message.maxAttempts) {
					// Reschedule for retry with exponential backoff
					const delay = Math.min(1000 * Math.pow(2, message.attempts - 1), 60000); // Max 1 minute
					message.scheduledFor = new Date(Date.now() + delay);

					const queue = this.queues.get(message.priority) || [];
					queue.push(message);
					this.queues.set(message.priority, queue);

					logger.warn('MessageQueueService', 'Message scheduled for retry', {
						messageId: message.id,
						attempts: message.attempts,
						nextRetry: message.scheduledFor,
						error: result.error
					});
				} else {
					// Move to failed queue
					this.failed.push(message);
					this.emit('messageFailed', message, result.error);

					logger.error('MessageQueueService', 'Message failed permanently', {
						messageId: message.id,
						attempts: message.attempts,
						error: result.error
					});
				}
			}
		} catch (error) {
			logger.error('MessageQueueService', 'Error processing message', {
				messageId: message.id,
				error
			});

			// Handle unexpected errors
			if (message.attempts < message.maxAttempts) {
				const delay = Math.min(1000 * Math.pow(2, message.attempts), 60000);
				message.scheduledFor = new Date(Date.now() + delay);

				const queue = this.queues.get(message.priority) || [];
				queue.push(message);
				this.queues.set(message.priority, queue);
			} else {
				this.failed.push(message);
				this.emit('messageFailed', message, error);
			}
		} finally {
			this.processing.delete(message.id);

			// Update average processing time
			const processingTime = Date.now() - startTime;
			this.stats.avgProcessingTime = (this.stats.avgProcessingTime + processingTime) / 2;
		}
	}

	/**
	 * Retry failed messages
	 */
	private async retryFailedMessages(): Promise<void> {
		const now = new Date();
		const retryableMessages = this.failed.filter((message) => {
			// Only retry messages that failed less than 24 hours ago
			const hoursSinceFailed = (now.getTime() - message.createdAt.getTime()) / (1000 * 60 * 60);
			return hoursSinceFailed < 24 && message.attempts < message.maxAttempts;
		});

		for (const message of retryableMessages) {
			// Remove from failed queue
			const index = this.failed.indexOf(message);
			if (index > -1) {
				this.failed.splice(index, 1);
			}

			// Reset for retry
			message.scheduledFor = now;
			message.attempts = 0;

			// Re-enqueue
			const queue = this.queues.get(message.priority) || [];
			queue.push(message);
			this.queues.set(message.priority, queue);

			logger.info('MessageQueueService', 'Failed message re-queued for retry', {
				messageId: message.id
			});
		}
	}

	/**
	 * Queue management methods
	 */
	async removeMessage(messageId: string): Promise<boolean> {
		// Check processing queue
		if (this.processing.has(messageId)) {
			return false; // Cannot remove message being processed
		}

		// Check all queues
		for (const [priority, queue] of this.queues.entries()) {
			const index = queue.findIndex((m) => m.id === messageId);
			if (index > -1) {
				queue.splice(index, 1);
				this.queues.set(priority, queue);
				this.updateStats();

				logger.debug('MessageQueueService', 'Message removed from queue', {
					messageId,
					priority
				});

				return true;
			}
		}

		// Check failed queue
		const failedIndex = this.failed.findIndex((m) => m.id === messageId);
		if (failedIndex > -1) {
			this.failed.splice(failedIndex, 1);
			this.updateStats();
			return true;
		}

		return false;
	}

	getQueuedMessages(userId?: UserId, roomId?: RoomId): QueuedMessage[] {
		const allMessages: QueuedMessage[] = [];

		for (const queue of this.queues.values()) {
			allMessages.push(...queue);
		}

		let filtered = allMessages;

		if (userId) {
			filtered = filtered.filter((m) => m.userId === userId);
		}

		if (roomId) {
			filtered = filtered.filter((m) => m.roomId === roomId);
		}

		return filtered.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
	}

	/**
	 * Statistics and monitoring
	 */
	getStats(): QueueStats {
		this.updateStats();
		return { ...this.stats };
	}

	private updateStats(): void {
		let pending = 0;
		for (const queue of this.queues.values()) {
			pending += queue.length;
		}

		this.stats.pending = pending;
		this.stats.processing = this.processing.size;
		this.stats.failed = this.failed.length;
	}

	/**
	 * Cleanup old messages
	 */
	private cleanup(): void {
		const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

		// Remove old failed messages
		const oldFailedCount = this.failed.length;
		this.failed = this.failed.filter((m) => m.createdAt > oneDayAgo);

		if (this.failed.length < oldFailedCount) {
			logger.debug('MessageQueueService', 'Cleaned up old failed messages', {
				removed: oldFailedCount - this.failed.length
			});
		}
	}

	/**
	 * Utility methods
	 */
	private generateMessageId(): string {
		return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	}

	/**
	 * Graceful shutdown
	 */
	async shutdown(): Promise<void> {
		this.stop();

		// Wait for current processing to complete
		while (this.processing.size > 0) {
			await new Promise((resolve) => setTimeout(resolve, 100));
		}

		logger.info('MessageQueueService', 'Queue service shutdown complete');
	}
}

// Export singleton instance
export const messageQueue = MessageQueueService.getInstance();
