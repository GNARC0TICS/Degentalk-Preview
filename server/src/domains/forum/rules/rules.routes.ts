/**
 * Forum Rules Routes
 *
 * Defines API routes for forum rules and user agreements to those rules.
 */

import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '@db';
import { count, desc, eq, and, like, sql, inArray } from 'drizzle-orm';
import {
	forumRules,
	userRulesAgreements,
	contentEditStatusEnum,
	type ForumRule,
	type UserRulesAgreement,
	type User
} from '@schema';
import crypto from 'crypto';
import { z } from 'zod';
import { isAuthenticated } from '../../auth/middleware/auth.middleware';
import { storage } from '../../../../storage';
import { asyncHandler } from '@server/src/core/errors'; // Assuming asyncHandler is in core errors

// Helper function to get user ID from req.user, handling both id and user_id formats
function getUserId(req: Request): number {
	return (req.user as any)?.id || (req.user as any)?.user_id || 0; // Keeping as any for now due to complex Express Request typing
}

const router = Router();

// Get all published forum rules
router.get('/', async (req: Request, res: Response) => {
	try {
		const { section, status } = req.query;

		// Build query conditionally based on request
		let query = db.select().from(forumRules);

		// Filter by status (default to 'published' if not specified)
		const ruleStatus = (status as string) || 'published';
		if (ruleStatus && ruleStatus in contentEditStatusEnum.enumValues) {
			query = query.where(eq(forumRules.status, ruleStatus as any));
		}

		// Filter by section if provided
		if (section) {
			query = query.where(eq(forumRules.section, section as string));
		}

		// Execute query and sort by position
		const rules = await query.orderBy(forumRules.position);

		return res.status(200).json({
			data: rules,
			count: rules.length
		});
	} catch (error) {
		console.error('Error fetching forum rules:', error);
		return res.status(500).json({ error: 'Failed to fetch forum rules' });
	}
});

// Get a specific rule
router.get('/:id', async (req: Request, res: Response) => {
	try {
		const ruleId = Number(req.params.id);
		if (isNaN(ruleId)) {
			return res.status(400).json({ error: 'Invalid rule ID' });
		}

		const rule = await storage.getForumRule(ruleId);

		if (!rule) {
			return res.status(404).json({ error: 'Rule not found' });
		}

		// Only allow published rules to be viewed, unless the user is an admin
		if (rule.status !== 'published' && (!req.user || (req.user as any).role !== 'admin')) {
			// Fixed isAdmin check
			return res.status(403).json({ error: 'This rule is not published' });
		}

		return res.status(200).json({ rule });
	} catch (error) {
		console.error('Error fetching forum rule:', error);
		return res.status(500).json({ error: 'Failed to fetch forum rule' });
	}
});

// Get user agreements (requires authentication)
router.get('/user-agreements', async (req: Request, res: Response) => {
	if (!req.isAuthenticated() || !req.user) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	try {
		const userId = getUserId(req);

		// Get all user rule agreements
		const agreements = await db
			.select()
			.from(userRulesAgreements)
			.where(eq(userRulesAgreements.userId, userId))
			.orderBy(desc(userRulesAgreements.agreedAt));

		// Get all published rules
		const rules = await db.select().from(forumRules).where(eq(forumRules.status, 'published'));

		// Find which rules require agreement
		const requiredRules = rules.filter((rule: ForumRule) => rule.isRequired);

		// Check which required rules have been agreed to
		const agreedRequiredRuleIds = agreements
			.filter((agreement: UserRulesAgreement) => {
				const rule = rules.find((r: ForumRule) => r.id === agreement.ruleId);
				return rule && rule.isRequired;
			})
			.map((agreement: UserRulesAgreement) => agreement.ruleId);

		const allRequiredRulesAgreed = requiredRules.every((rule: ForumRule) =>
			agreedRequiredRuleIds.includes(rule.id)
		);

		return res.status(200).json({
			agreements,
			requiredRules,
			allRequiredRulesAgreed,
			requiresAction: !allRequiredRulesAgreed
		});
	} catch (error) {
		console.error('Error fetching user rule agreements:', error);
		return res.status(500).json({ error: 'Failed to fetch user rule agreements' });
	}
});

// Agree to rules (requires authentication)
router.post('/agree', async (req: Request, res: Response) => {
	if (!req.isAuthenticated() || !req.user) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	// Validate request body using Zod
	const agreeSchema = z.object({
		ruleIds: z.array(z.number())
	});

	const parsed = agreeSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			error: 'Invalid request body',
			details: parsed.error.issues
		});
	}

	const { ruleIds } = parsed.data;

	try {
		const userId = getUserId(req);

		// Get rules
		const rules = await db
			.select()
			.from(forumRules)
			.where(and(inArray(forumRules.id, ruleIds), eq(forumRules.status, 'published')));

		if (rules.length !== ruleIds.length) {
			return res.status(404).json({
				error: 'One or more rules not found or not published'
			});
		}

		// Get existing agreements
		const existingAgreements = await db
			.select()
			.from(userRulesAgreements)
			.where(
				and(eq(userRulesAgreements.userId, userId), inArray(userRulesAgreements.ruleId, ruleIds))
			);

		// Create map of existing agreements for faster lookup
		const existingAgreementMap = new Map<number, UserRulesAgreement>();
		existingAgreements.forEach((agreement: UserRulesAgreement) => {
			existingAgreementMap.set(agreement.ruleId, agreement);
		});

		// Process each rule agreement
		for (const rule of rules) {
			const existingAgreement = existingAgreementMap.get(rule.id);

			// If agreement already exists and hash is the same, skip
			if (existingAgreement && existingAgreement.versionHash === rule.versionHash) {
				continue;
			}

			// If agreement exists but hash is different (rule was updated), update the agreement
			if (existingAgreement) {
				await db
					.update(userRulesAgreements)
					.set({
						versionHash: rule.versionHash,
						agreedAt: new Date()
					})
					.where(
						and(
							eq(userRulesAgreements.userId, existingAgreement.userId),
							eq(userRulesAgreements.ruleId, existingAgreement.ruleId)
						)
					);

				// Also update the rule's lastAgreedVersionHash if not already set
				if (!rule.lastAgreedVersionHash) {
					await db
						.update(forumRules)
						.set({ lastAgreedVersionHash: rule.versionHash })
						.where(eq(forumRules.id, rule.id));
				}
			}
			// If no agreement exists, create a new one
			else {
				await db.insert(userRulesAgreements).values({
					userId,
					ruleId: rule.id,
					versionHash: rule.versionHash,
					agreedAt: new Date()
				});

				// Also update the rule's lastAgreedVersionHash if not already set
				if (!rule.lastAgreedVersionHash) {
					await db
						.update(forumRules)
						.set({ lastAgreedVersionHash: rule.versionHash })
						.where(eq(forumRules.id, rule.id));
				}
			}
		}

		return res.status(200).json({
			success: true,
			message: 'Successfully agreed to rules',
			ruleIds
		});
	} catch (error) {
		console.error('Error agreeing to rules:', error);
		return res.status(500).json({ error: 'Failed to process rule agreements' });
	}
});

export default router;
