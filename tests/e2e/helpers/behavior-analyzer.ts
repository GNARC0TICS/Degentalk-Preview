/**
 * Behavior Analyzer for E2E Testing
 * Captures and analyzes user behavior patterns to verify seeded data alignment
 */

import { Page, Locator } from '@playwright/test';

export interface BehaviorMetrics {
	sessionStart: number;
	sessionDuration: number;
	pagesVisited: string[];
	actionsPerformed: ActionEvent[];
	clickHeatmap: ClickEvent[];
	scrollDepth: number[];
	engagementScore: number;
	conversionEvents: ConversionEvent[];
}

export interface ActionEvent {
	timestamp: number;
	type: 'click' | 'input' | 'scroll' | 'navigation';
	element: string;
	value?: string;
	duration?: number;
}

export interface ClickEvent {
	x: number;
	y: number;
	element: string;
	timestamp: number;
}

export interface ConversionEvent {
	type: 'registration' | 'first_post' | 'purchase' | 'tip_sent' | 'level_up';
	timestamp: number;
	value?: number;
	metadata?: Record<string, any>;
}

export interface EngagementMetrics {
	viewsPerMinute: number;
	responsesPerHour: number;
	likeRatio: number;
	shareCount: number;
	averageReadTime: number;
}

export class BehaviorAnalyzer {
	private page: Page;
	private metrics: BehaviorMetrics;
	private isTracking: boolean = false;
	private observers: any[] = [];

	constructor(page: Page) {
		this.page = page;
		this.metrics = {
			sessionStart: Date.now(),
			sessionDuration: 0,
			pagesVisited: [],
			actionsPerformed: [],
			clickHeatmap: [],
			scrollDepth: [],
			engagementScore: 0,
			conversionEvents: []
		};
	}

	async startTracking(): Promise<void> {
		this.isTracking = true;
		this.metrics.sessionStart = Date.now();

		// Track page navigation
		this.page.on('framenavigated', (frame) => {
			if (frame === this.page.mainFrame()) {
				this.metrics.pagesVisited.push(frame.url());
				this.recordAction('navigation', frame.url());
			}
		});

		// Inject behavior tracking script
		await this.page.addInitScript(() => {
			// Global behavior tracking
			(window as any).__behaviorTracker = {
				actions: [],
				clicks: [],
				scrollEvents: [],

				trackClick: (event: MouseEvent) => {
					const target = event.target as HTMLElement;
					(window as any).__behaviorTracker.clicks.push({
						x: event.clientX,
						y: event.clientY,
						element:
							target.tagName.toLowerCase() +
							(target.id ? `#${target.id}` : '') +
							(target.className ? `.${target.className.split(' ').join('.')}` : ''),
						timestamp: Date.now()
					});
				},

				trackScroll: () => {
					const scrollPercent = Math.round(
						(window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
					);
					(window as any).__behaviorTracker.scrollEvents.push({
						depth: scrollPercent,
						timestamp: Date.now()
					});
				}
			};

			// Attach event listeners
			document.addEventListener('click', (window as any).__behaviorTracker.trackClick, true);
			document.addEventListener('scroll', (window as any).__behaviorTracker.trackScroll, {
				passive: true
			});
		});
	}

	async stopTracking(): Promise<BehaviorMetrics> {
		this.isTracking = false;
		this.metrics.sessionDuration = Date.now() - this.metrics.sessionStart;

		// Collect final data from browser
		await this.collectBrowserMetrics();

		// Calculate engagement score
		this.metrics.engagementScore = this.calculateEngagementScore();

		return this.metrics;
	}

	private async collectBrowserMetrics(): Promise<void> {
		try {
			const browserData = await this.page.evaluate(() => {
				const tracker = (window as any).__behaviorTracker;
				return {
					clicks: tracker?.clicks || [],
					scrollEvents: tracker?.scrollEvents || []
				};
			});

			this.metrics.clickHeatmap = browserData.clicks;
			this.metrics.scrollDepth = browserData.scrollEvents.map((e) => e.depth);
		} catch (error) {
			console.warn('Failed to collect browser metrics:', error);
		}
	}

	private recordAction(
		type: ActionEvent['type'],
		element: string,
		value?: string,
		duration?: number
	): void {
		if (!this.isTracking) return;

		this.metrics.actionsPerformed.push({
			timestamp: Date.now(),
			type,
			element,
			value,
			duration
		});
	}

	private calculateEngagementScore(): number {
		const { sessionDuration, pagesVisited, actionsPerformed, scrollDepth, conversionEvents } =
			this.metrics;

		// Scoring algorithm based on typical user engagement patterns
		let score = 0;

		// Session duration (up to 30 points)
		score += Math.min((sessionDuration / 60000) * 5, 30); // 5 points per minute, max 30

		// Page depth (up to 20 points)
		score += Math.min(pagesVisited.length * 2, 20);

		// Action frequency (up to 25 points)
		const actionsPerMinute = actionsPerformed.length / (sessionDuration / 60000);
		score += Math.min(actionsPerMinute * 2, 25);

		// Scroll engagement (up to 15 points)
		const maxScrollDepth = Math.max(...scrollDepth, 0);
		score += maxScrollDepth * 0.15;

		// Conversion events (up to 30 points)
		score += conversionEvents.length * 10;

		return Math.round(score);
	}

	// Specific behavior analysis methods

	async captureRegistrationMetrics(): Promise<{
		timeToComplete: number;
		formInteractions: number;
		errorsEncountered: number;
		completionRate: number;
	}> {
		const registrationStart = Date.now();

		// Wait for registration completion or timeout
		try {
			await this.page.waitForSelector('[data-testid="welcome-message"]', { timeout: 120000 });

			const timeToComplete = Date.now() - registrationStart;
			const formActions = this.metrics.actionsPerformed.filter(
				(action) => action.type === 'input' && action.timestamp > registrationStart
			);

			return {
				timeToComplete,
				formInteractions: formActions.length,
				errorsEncountered: await this.countFormErrors(),
				completionRate: 1.0
			};
		} catch (error) {
			return {
				timeToComplete: Date.now() - registrationStart,
				formInteractions: 0,
				errorsEncountered: await this.countFormErrors(),
				completionRate: 0.0
			};
		}
	}

	async captureVerificationMetrics(): Promise<{
		timeFromRegistration: number;
		clickThroughRate: number;
		verificationSuccess: boolean;
	}> {
		const currentTime = Date.now();
		const registrationTime = this.findLastConversionEvent('registration')?.timestamp || currentTime;

		return {
			timeFromRegistration: currentTime - registrationTime,
			clickThroughRate: await this.calculateEmailClickThrough(),
			verificationSuccess: await this.page.isVisible('[data-testid="email-verified"]')
		};
	}

	async captureProgressionMetrics(): Promise<{
		threadsCreated: number;
		postsCreated: number;
		likesReceived: number;
		currentLevel: number;
		xpGained: number;
	}> {
		const profileData = await this.page.evaluate(() => {
			// Extract user profile data from DOM
			const levelElement = document.querySelector('[data-testid="user-level"]');
			const xpElement = document.querySelector('[data-testid="user-xp"]');
			const threadsElement = document.querySelector('[data-testid="threads-count"]');
			const postsElement = document.querySelector('[data-testid="posts-count"]');
			const likesElement = document.querySelector('[data-testid="likes-received"]');

			return {
				level: levelElement ? parseInt(levelElement.textContent || '1') : 1,
				xp: xpElement ? parseInt(xpElement.textContent || '0') : 0,
				threads: threadsElement ? parseInt(threadsElement.textContent || '0') : 0,
				posts: postsElement ? parseInt(postsElement.textContent || '0') : 0,
				likes: likesElement ? parseInt(likesElement.textContent || '0') : 0
			};
		});

		return {
			threadsCreated: profileData.threads,
			postsCreated: profileData.posts,
			likesReceived: profileData.likes,
			currentLevel: profileData.level,
			xpGained: profileData.xp
		};
	}

	async captureEngagementMetrics(): Promise<EngagementMetrics> {
		const currentTime = Date.now();
		const timeWindow = 5 * 60 * 1000; // 5 minutes
		const windowStart = currentTime - timeWindow;

		// Simulate engagement data collection
		const engagementData = await this.page.evaluate((start) => {
			const threadElement = document.querySelector('[data-testid="thread-views"]');
			const responsesElement = document.querySelector('[data-testid="response-count"]');
			const likesElement = document.querySelector('[data-testid="total-likes"]');

			return {
				views: threadElement ? parseInt(threadElement.textContent || '0') : 0,
				responses: responsesElement ? parseInt(responsesElement.textContent || '0') : 0,
				likes: likesElement ? parseInt(likesElement.textContent || '0') : 0,
				shares: 0 // Would be extracted from share buttons
			};
		}, windowStart);

		return {
			viewsPerMinute: engagementData.views / 5,
			responsesPerHour: engagementData.responses * 12, // Extrapolate to hourly
			likeRatio: engagementData.views > 0 ? engagementData.likes / engagementData.views : 0,
			shareCount: engagementData.shares,
			averageReadTime: this.calculateAverageReadTime()
		};
	}

	async simulateHelpfulResponses(threadId: string, helpfulUsers: any[]): Promise<any[]> {
		const responses = [];

		for (const user of helpfulUsers.slice(0, 3)) {
			// Limit to 3 helpful responses
			const response = {
				id: `response_${Date.now()}_${Math.random()}`,
				userId: user.id,
				threadId,
				content: this.generateHelpfulResponse(user.expertise),
				tone: 'helpful',
				length: Math.floor(Math.random() * 200) + 100, // 100-300 chars
				timestamp: Date.now(),
				helpfulnessScore: Math.random() * 0.3 + 0.7 // 0.7-1.0 for helpful users
			};

			responses.push(response);

			// Simulate response delay
			await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 1000));
		}

		return responses;
	}

	async captureActivitySummary(): Promise<{
		favoriteForums: string[];
		postingFrequency: number;
		engagementRatio: number;
		peakActivityHours: number[];
	}> {
		// Analyze user activity patterns from the session
		const forumVisits = this.metrics.pagesVisited
			.filter((url) => url.includes('/forums/'))
			.map((url) => url.split('/forums/')[1]?.split('/')[0])
			.filter(Boolean);

		const forumFrequency: Record<string, number> = {};
		forumVisits.forEach((forum) => {
			forumFrequency[forum] = (forumFrequency[forum] || 0) + 1;
		});

		const favoriteForums = Object.entries(forumFrequency)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 3)
			.map(([forum]) => forum);

		const postingActions = this.metrics.actionsPerformed.filter(
			(action) => action.element.includes('submit') || action.element.includes('post')
		);

		const sessionHours = this.metrics.sessionDuration / (1000 * 60 * 60);
		const postingFrequency = postingActions.length / Math.max(sessionHours, 0.1);

		const totalActions = this.metrics.actionsPerformed.length;
		const engagementActions = this.metrics.actionsPerformed.filter((action) =>
			['click', 'input'].includes(action.type)
		).length;
		const engagementRatio = totalActions > 0 ? engagementActions / totalActions : 0;

		return {
			favoriteForums,
			postingFrequency,
			engagementRatio,
			peakActivityHours: this.analyzePeakActivityHours()
		};
	}

	// Helper methods

	private async countFormErrors(): Promise<number> {
		try {
			const errorElements = await this.page
				.locator('[data-testid*="error"], .error, .invalid')
				.all();
			return errorElements.length;
		} catch {
			return 0;
		}
	}

	private async calculateEmailClickThrough(): Promise<number> {
		// Simulate email click-through rate calculation
		// In real implementation, this would integrate with email service
		return Math.random() * 0.3 + 0.6; // 60-90% typical rate
	}

	private findLastConversionEvent(type: ConversionEvent['type']): ConversionEvent | undefined {
		return this.metrics.conversionEvents
			.filter((event) => event.type === type)
			.sort((a, b) => b.timestamp - a.timestamp)[0];
	}

	private calculateAverageReadTime(): number {
		// Calculate based on scroll patterns and time spent on pages
		const readingActions = this.metrics.actionsPerformed.filter(
			(action) => action.type === 'scroll'
		);

		if (readingActions.length === 0) return 0;

		const sessionMinutes = this.metrics.sessionDuration / (1000 * 60);
		const pagesRead = this.metrics.pagesVisited.length;

		return pagesRead > 0 ? (sessionMinutes / pagesRead) * 60 : 0; // seconds per page
	}

	private analyzePeakActivityHours(): number[] {
		const hourlyActivity: Record<number, number> = {};

		this.metrics.actionsPerformed.forEach((action) => {
			const hour = new Date(action.timestamp).getHours();
			hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
		});

		return Object.entries(hourlyActivity)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 3)
			.map(([hour]) => parseInt(hour));
	}

	private generateHelpfulResponse(expertise: string): string {
		const templates = {
			trading: [
				'Great question! Based on my experience with technical analysis...',
				"I've been trading for several years and here's what I've learned...",
				'Check out the RSI and MACD indicators for this setup...'
			],
			defi: [
				'Welcome to DeFi! Here are some beginner-friendly protocols...',
				'Make sure to understand impermanent loss before providing liquidity...',
				'Always DYOR and start with small amounts when learning...'
			],
			general: [
				'Welcome to the community! Here are some helpful resources...',
				'I remember asking the same question when I started...',
				'Feel free to DM me if you have more specific questions!'
			]
		};

		const expertiseTemplates = templates[expertise as keyof typeof templates] || templates.general;
		return expertiseTemplates[Math.floor(Math.random() * expertiseTemplates.length)];
	}

	recordConversion(
		type: ConversionEvent['type'],
		value?: number,
		metadata?: Record<string, any>
	): void {
		this.metrics.conversionEvents.push({
			type,
			timestamp: Date.now(),
			value,
			metadata
		});
	}

	getMetrics(): BehaviorMetrics {
		return { ...this.metrics };
	}
}

// Extension methods for custom behavioral pattern matching
declare global {
	namespace PlaywrightTest {
		interface Matchers<R> {
			toMatchSeededPattern(expectedPattern: any): R;
		}
	}
}
